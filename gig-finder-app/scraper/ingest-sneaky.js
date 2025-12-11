import * as cheerio from 'cheerio';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

export async function scrapeSneaky() {
    console.log('🎸 Initiating Sneaky Pete\'s Ingestion (RSS Mode)...');

    // Check for Env Var
    if (!process.env.POSTGRES_URL) {
        throw new Error('POSTGRES_URL is not defined');
    }

    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
    });

    let client;
    let addedCount = 0;
    let skippedCount = 0;

    try {
        console.log('📡 Fetching RSS Feed...');
        const res = await fetch('https://www.sneakypetes.co.uk/feed/');
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const xml = await res.text();

        // Cheerio can parse XML with { xmlMode: true }
        const $ = cheerio.load(xml, { xmlMode: true });

        const items = [];
        $('item').each((i, el) => {
            const title = $(el).find('title').text().trim();
            const link = $(el).find('link').text().trim();
            const pubDate = $(el).find('pubDate').text().trim();
            const description = $(el).find('description').text().trim();
            const category = $(el).find('category').text().trim();

            if (title && pubDate) {
                items.push({
                    name: title,
                    link: link,
                    pubDate: pubDate,
                    description: description.replace(/<[^>]*>/g, '').trim(), // Strip HTML from desc
                    category: category
                });
            }
        });

        console.log(`✅ Extracted ${items.length} items from RSS.`);

        client = await pool.connect();

        for (const item of items) {
            // Parse Date
            const dateObj = new Date(item.pubDate);

            // Check valid date
            if (isNaN(dateObj.getTime())) continue;

            // Filter Past
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (dateObj < yesterday) continue;

            const dateStr = dateObj.toISOString().split('T')[0];

            // Time: Sneaky's usually 7pm for Gigs, 11pm for Clubs.
            let timeStr = '19:00';
            if (item.category && item.category.toLowerCase().includes('club')) {
                timeStr = '23:00';
            }

            const timestamp = `${dateStr} ${timeStr}:00`;
            const fingerprint = `${dateStr}|sneaky petes|${item.name.toLowerCase().trim()}`;

            // Upsert
            const checkRes = await client.query('SELECT id FROM events WHERE fingerprint = $1', [fingerprint]);

            if (checkRes.rows.length === 0) {
                await client.query(`
                    INSERT INTO events (
                        name, venue, date, genre, price, description, 
                        user_id, created_at, fingerprint, ticket_url, approved
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10)
                 `, [
                    item.name,
                    'Sneaky Pete\'s',
                    timestamp,
                    item.category || 'Indie', // Default Vibe
                    '0.00', // Unknown price from RSS? (We might need to fetch the page to get price, but let's leave 0 or TBC for now)
                    item.description || 'Live at Sneaky Pete\'s',
                    'scraper_sneaky',
                    fingerprint,
                    item.link,
                    true
                ]);
                console.log(`   + Added: ${item.name} @ ${dateStr}`);
                addedCount++;
            } else {
                skippedCount++;
            }
        }

        console.log(`🎉 Added ${addedCount} new events. Skipped ${skippedCount}.`);
        return { success: true, count: addedCount, skipped: skippedCount };

    } catch (err) {
        console.error('❌ Sneaky Scraper Failed:', err);
        throw err;
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

// Allow standalone execution via `node scraper/ingest-sneaky.js`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    import('dotenv').then(dotenv => {
        dotenv.config({ path: '.env.local' });
        scrapeSneaky()
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
    });
}
