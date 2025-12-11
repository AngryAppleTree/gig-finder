require('dotenv').config({ path: '.env.local' });
const cheerio = require('cheerio');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function scrapeStramash() {
    console.log('🎸 Initiating Stramash Ingestion (RSS + Crawler)...');
    let client;

    try {
        console.log('📡 Fetching Stramash RSS Feed...');
        const res = await fetch('https://stramashedinburgh.com/events/feed/');
        if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`);
        const xml = await res.text();

        const $rss = cheerio.load(xml, { xmlMode: true });
        const links = [];

        $rss('item').each((i, el) => {
            const link = $rss(el).find('link').text().trim();
            const title = $rss(el).find('title').text().trim();
            if (link && title) {
                links.push({ link, title });
            }
        });

        console.log(`🔍 Found ${links.length} items in feed. Crawling pages...`);

        client = await pool.connect();
        let addedCount = 0;
        let skippedCount = 0;

        // Process sequentially to be polite
        for (const item of links) {
            try {
                // Fetch Page
                const pRes = await fetch(item.link);
                if (!pRes.ok) continue;
                const pHtml = await pRes.text();
                const $p = cheerio.load(pHtml);

                // Find JSON-LD
                let eventData = null;
                $p('script[type="application/ld+json"]').each((i, el) => {
                    try {
                        const json = JSON.parse($p(el).html());
                        // Sometimes it's an array or graph
                        const nodes = Array.isArray(json) ? json : (json['@graph'] || [json]);
                        const evt = nodes.find(n => n['@type'] === 'Event' || n['@type'] === 'MusicEvent');
                        if (evt) eventData = evt;
                    } catch (e) { /* ignore parse errors */ }
                });

                if (eventData && eventData.startDate) {
                    // Manual Regex for "2026-1-4T23:55+0:00"
                    const match = eventData.startDate.match(/(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}:\d{2})/);
                    if (!match) {
                        // console.log('Date parse failed:', eventData.startDate);
                        continue;
                    }

                    const [_, y, m, d, time] = match;
                    // Pad month/day
                    const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${time}:00Z`;

                    const dateObj = new Date(iso);

                    // Filter Past
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    if (dateObj < yesterday) continue;

                    // Format
                    const dateStr = dateObj.toISOString().split('T')[0];
                    const timeStr = dateObj.toTimeString().substring(0, 5); // HH:MM

                    const timestamp = `${dateStr} ${timeStr}:00`;
                    const fingerprint = `${dateStr}|stramash|${item.title.toLowerCase().trim()}`;

                    // DB Check
                    const checkRes = await client.query('SELECT id FROM events WHERE fingerprint = $1', [fingerprint]);

                    if (checkRes.rows.length === 0) {
                        await client.query(`
                            INSERT INTO events (
                                name, venue, date, genre, price, description, 
                                user_id, created_at, fingerprint, ticket_url, approved
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10)
                        `, [
                            item.title,
                            'Stramash',
                            timestamp,
                            'Live Music/Cover', // Stramash is mostly covers/folk/indie
                            '0.00', // Usually Free/Door
                            eventData.description || item.title,
                            'scraper_stramash',
                            fingerprint,
                            item.link,
                            true
                        ]);
                        console.log(`   + Added: ${item.title} @ ${dateStr}`);
                        addedCount++;
                    } else {
                        skippedCount++;
                    }

                } else {
                    // console.log(`   ? No JSON-LD event data for: ${item.title}`);
                }

                // Polite delay
                await new Promise(r => setTimeout(r, 100));

            } catch (err) {
                console.error(`   ! Failed to process ${item.link}:`, err.message);
            }
        }

        console.log(`🎉 Added ${addedCount} new events.`);

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

scrapeStramash();
