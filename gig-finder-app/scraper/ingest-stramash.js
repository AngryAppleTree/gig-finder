import cheerio from 'cheerio';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

const VENUE_NAME = 'Stramash';
const USER_ID = 'scraper_stramash';

// Helper to fetch text with headers (replaces curl)
async function fetchText(url) {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            }
        });
        if (!res.ok) {
            console.error(`Fetch failed ${res.status} for ${url}`);
            return null;
        }
        return await res.text();
    } catch (e) {
        console.error(`Fetch error for ${url}:`, e);
        return null;
    }
}

export async function scrapeStramash() {
    console.log('🚀 Starting Stramash RSS Scraper (Fetch Mode)...');

    if (!process.env.POSTGRES_URL) {
        throw new Error('POSTGRES_URL is not defined');
    }

    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
    });

    const feedUrl = 'https://stramashedinburgh.com/events/feed/';
    let client;
    let addedCount = 0;
    let skippedCount = 0;

    try {
        const text = await fetchText(feedUrl);
        if (!text) throw new Error('Failed to fetch RSS feed');
        // console.log('RSS Preview:', text.substring(0, 200));

        const $ = cheerio.load(text, { xmlMode: true });

        const items = $('item').toArray();
        console.log(`Found ${items.length} items in RSS feed.`);

        client = await pool.connect();

        for (const item of items) {
            const link = $(item).find('link').text();
            const rssTitle = $(item).find('title').text();

            if (!link) continue;

            // console.log(`Processing: ${rssTitle}`);

            // Fetch individual page
            const pageHtml = await fetchText(link);
            if (!pageHtml) {
                console.log('  - Failed to fetch page content.');
                continue;
            }

            const $p = cheerio.load(pageHtml);
            let eventData = null;

            // Extract JSON-LD
            $p('script[type="application/ld+json"]').each((i, el) => {
                if (eventData) return; // Found one
                try {
                    const json = JSON.parse($p(el).html());
                    const nodes = Array.isArray(json) ? json : (json['@graph'] || [json]);
                    const evt = nodes.find(n => n['@type'] === 'Event' || n['@type'] === 'MusicEvent');
                    if (evt) eventData = evt;
                } catch (e) { /* ignore */ }
            });

            if (eventData && eventData.startDate) {
                // Parse Date - Stramash JSON-LD often has non-standard formats like "2026-1-4T23:55+0:00"
                // We use regex to be safe
                const match = eventData.startDate.match(/(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}:\d{2})/);

                let dateObj = null;
                if (match) {
                    const [_, y, m, d, time] = match;
                    // Construct ISO string with padding
                    const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${time}:00Z`;
                    dateObj = new Date(iso);
                } else {
                    // Try standard constructor
                    dateObj = new Date(eventData.startDate);
                }

                if (!dateObj || isNaN(dateObj.getTime())) {
                    console.log(`  - Invalid Date: ${eventData.startDate}`);
                    continue;
                }

                const dateStr = dateObj.toISOString().split('T')[0];

                // Filter Past Events
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (dateObj < yesterday) {
                    continue;
                }

                const title = eventData.name || rssTitle;
                const description = eventData.description || '';
                const fingerprint = `${dateStr}|${VENUE_NAME.toLowerCase()}|${title.toLowerCase().trim()}`;
                const genre = 'Live Music';

                // Check DB
                const existRes = await client.query('SELECT id FROM events WHERE fingerprint = $1', [fingerprint]);
                if (existRes.rows.length === 0) {
                    await client.query(
                        `INSERT INTO events (
                                name, venue, date, price, ticket_url, description, 
                                fingerprint, user_id, approved, created_at, genre
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)`,
                        [
                            title,
                            VENUE_NAME,
                            dateObj, // Postgres takes Date object
                            'Free', // Often free
                            link,
                            description,
                            fingerprint,
                            USER_ID,
                            true,
                            genre
                        ]
                    );
                    addedCount++;
                    console.log(`  + Upserted: ${dateStr} - ${title}`);
                } else {
                    skippedCount++;
                }

            } else {
                // console.log('  - No JSON-LD Event data found.');
            }
        }
        console.log(`🎉 Finished. Added ${addedCount} new events.`);
        return { success: true, count: addedCount, skipped: skippedCount };

    } catch (error) {
        console.error('❌ Stramash Scraper Failed:', error);
        throw error;
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

// Allow standalone execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    import('dotenv').then(dotenv => {
        dotenv.config({ path: '.env.local' });
        scrapeStramash()
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
    });
}
