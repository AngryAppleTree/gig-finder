import * as cheerio from 'cheerio';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

const VENUE_NAME = 'The Banshee Labyrinth';
const USER_ID = 'scraper_banshee';

export async function scrapeBanshee() {
    console.log('🚀 Starting Banshee Labyrinth Scraper...');
    const url = 'https://www.thebansheelabyrinth.com/cinema/';

    // Log env vars for debugging (careful not to log full string in prod)
    if (!process.env.POSTGRES_URL) {
        throw new Error('POSTGRES_URL is not defined');
    }

    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false } // Vercel/Neon usually needs this
    });

    let client;

    try {
        const resp = await fetch(url);
        if (!resp.ok) {
            throw new Error(`Failed to fetch ${url}: ${resp.statusText}`);
        }

        const html = await resp.text();
        const $ = cheerio.load(html);

        client = await pool.connect();

        // Identify grid cells
        const days = $('.day').toArray();
        console.log(`Found ${days.length} day cells in the calendar grid.`);

        if (days.length === 0) {
            console.log('No calendar grid found. Page structure might have changed.');
            return { success: false, message: 'No calendar grid found' };
        }

        // Assume Current Month & Year for the grid
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-11

        let addedCount = 0;

        for (const dayEl of days) {
            const dateText = $(dayEl).find('.date-number').text().trim();
            if (!dateText) continue;
            const dayNum = parseInt(dateText, 10);
            if (isNaN(dayNum)) continue;

            const events = [];
            // Events can be text in .event OR <a><img></a>
            $(dayEl).find('.events-container .event').each((i, ev) => {
                let title = $(ev).text().trim();
                let link = $(ev).attr('href');

                // If it has an image, get alt text
                const img = $(ev).find('img');
                let imageUrl = null;
                if (img.length > 0) {
                    const alt = img.attr('alt');
                    if (alt) title = alt;
                    imageUrl = img.attr('src');
                }

                // Ensure we have a link (default to calendar)
                if (!link) link = url;

                if (title) events.push({ title, link, imageUrl });
            });

            for (const evt of events) {
                if (!evt.title) continue;

                // Filter specific placeholders found in analysis
                if (/booking/i.test(evt.title) || /possible booking/i.test(evt.title)) continue;

                const eventDate = new Date(currentYear, currentMonth, dayNum, 19, 0, 0); // Default 7 PM
                const dateStr = eventDate.toISOString().split('T')[0];

                // Check "past" events (yesterday or earlier).
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (eventDate < yesterday) {
                    continue;
                }

                const fingerprint = `${dateStr}|${VENUE_NAME.toLowerCase()}|${evt.title.toLowerCase().trim()}`;

                // Insert
                const existRes = await client.query('SELECT id FROM events WHERE fingerprint = $1', [fingerprint]);
                if (existRes.rows.length === 0) {
                    await client.query(
                        `INSERT INTO events (
                              name, venue, date, price, ticket_url, description, 
                              fingerprint, user_id, approved, created_at, genre, image_url
                          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10, $11)`,
                        [
                            evt.title,
                            VENUE_NAME,
                            eventDate, // Full Date (includes time)
                            'Free', // Default price
                            evt.link,
                            'Scraped from /cinema',
                            fingerprint,
                            USER_ID,
                            true,
                            'Cinema/Varies',
                            evt.imageUrl
                        ]
                    );
                    addedCount++;
                    console.log(`  + Upserted: ${dateStr} - ${evt.title}`);
                }
            }
        }
        console.log(`🎉 Finished. Added ${addedCount} events via Scraper.`);
        return { success: true, count: addedCount };

    } catch (e) {
        console.error('❌ Banshee Scraper Failed:', e);
        throw e;
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

// Allow standalone execution via `node scraper/ingest-banshee.js`
// Check if file is being run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    // If running correctly, we need to load dotenv manually here because Next.js isn't loading it
    import('dotenv').then(dotenv => {
        dotenv.config({ path: '.env.local' });
        scrapeBanshee()
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
    });
}
