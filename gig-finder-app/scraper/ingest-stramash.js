import * as cheerio from 'cheerio';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';
import { getOrCreateVenue } from './venue-helper.js';

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

        const BATCH_SIZE = 5; // Limit to avoid timeout on Vercel
        const itemsToProcess = items.slice(0, BATCH_SIZE);
        console.log(`Processing newest ${itemsToProcess.length} items (Batch Limit)...`);

        const processItem = async (item) => {
            const link = $(item).find('link').text();
            const rssTitle = $(item).find('title').text();

            if (!link) return 0;

            // Fetch individual page
            const pageHtml = await fetchText(link);
            if (!pageHtml) {
                console.log('  - Failed to fetch page content.');
                return 0;
            }

            const $p = cheerio.load(pageHtml);
            let eventData = null;

            // Extract JSON-LD
            $p('script[type="application/ld+json"]').each((i, el) => {
                if (eventData) return;
                try {
                    const json = JSON.parse($p(el).html());
                    const nodes = Array.isArray(json) ? json : (json['@graph'] || [json]);
                    const evt = nodes.find(n => n['@type'] === 'Event' || n['@type'] === 'MusicEvent');
                    if (evt) eventData = evt;
                } catch (e) { /* ignore */ }
            });

            if (eventData && eventData.startDate) {
                const match = eventData.startDate.match(/(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}:\d{2})/);
                let dateObj = null;
                if (match) {
                    const [_, y, m, d, time] = match;
                    const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${time}:00Z`;
                    dateObj = new Date(iso);
                } else {
                    dateObj = new Date(eventData.startDate);
                }

                if (!dateObj || isNaN(dateObj.getTime())) return 0;

                const dateStr = dateObj.toISOString().split('T')[0];

                // Filter Past Events
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (dateObj < yesterday) return 0;

                const title = eventData.name || rssTitle;
                const description = eventData.description || '';
                const fingerprint = `${dateStr}|${VENUE_NAME.toLowerCase()}|${title.toLowerCase().trim()}`;

                // Get venue ID
                const venueId = await getOrCreateVenue(client, VENUE_NAME);

                // Check DB
                const existRes = await client.query('SELECT id FROM events WHERE fingerprint = $1', [fingerprint]);
                if (existRes.rows.length === 0) {
                    await client.query(
                        `INSERT INTO events (
                                name, venue_id, date, price, ticket_url, description, 
                                fingerprint, user_id, created_at
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
                        [
                            title,
                            venueId,
                            dateObj,
                            'Free',
                            link,
                            description,
                            fingerprint,
                            USER_ID
                        ]
                    );
                    console.log(`  + Upserted: ${dateStr} - ${title}`);
                    return 1; // Added 1
                }
                // Skip duplicate
                skippedCount++; // Note: modifying outer var in async function is race-condition prone if exact count matters, but ok for rough stats
                return 0;
            }
            return 0;
        };

        // Run in parallel
        const results = await Promise.all(itemsToProcess.map(processItem));
        addedCount = results.reduce((a, b) => a + b, 0);

        console.log(`🎉 Finished batch. Added ${addedCount} new events.`);
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
