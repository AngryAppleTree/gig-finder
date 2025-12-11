/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config({ path: '.env.local' });
const cheerio = require('cheerio');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

const VENUE_NAME = 'The Banshee Labyrinth';
const USER_ID = 'scraper_banshee';

async function scrapeBanshee() {
    console.log('🚀 Starting Banshee Labyrinth Scraper...');
    const url = 'https://www.thebansheelabyrinth.com/cinema/';

    try {
        const resp = await fetch(url);
        const html = await resp.text();
        const $ = cheerio.load(html);

        const client = await pool.connect();
        try {
            // Identify grid cells
            const days = $('.day').toArray();
            console.log(`Found ${days.length} day cells in the calendar grid.`);

            if (days.length === 0) {
                console.log('No calendar grid found. Page structure might have changed.');
                return;
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
                    if (img.length > 0) {
                        const alt = img.attr('alt');
                        if (alt) title = alt;
                    }

                    // Ensure we have a link (default to calendar)
                    if (!link) link = url;

                    if (title) events.push({ title, link });
                });

                for (const evt of events) {
                    if (!evt.title) continue;

                    // Filter specific placeholders found in analysis
                    if (/booking/i.test(evt.title) || /possible booking/i.test(evt.title)) continue;

                    // Construct Date object
                    // Note: Since we don't have year/month in the cell, we assume current month.
                    // A robust check would be: if dateText < 5 and we are late in the month (e.g. 29th), maybe it's next month?
                    // But usually grids are strictly one month.
                    const eventDate = new Date(currentYear, currentMonth, dayNum, 19, 0, 0); // Default 7 PM
                    const dateStr = eventDate.toISOString().split('T')[0];

                    // Simple logic: if dayNum is significantly smaller than today's date minus buffer, and it's near the start of grid?
                    // Actually, just filtering strictly "past" dates by valid Date comparison is safer.
                    // We ignore "past" events (yesterday or earlier).
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    if (eventDate < yesterday) {
                        // console.log(`  - Skipping past event: ${dateStr} ${evt.title}`);
                        continue;
                    }

                    const fingerprint = `${dateStr}|${VENUE_NAME.toLowerCase()}|${evt.title.toLowerCase().trim()}`;

                    // Insert
                    const existRes = await client.query('SELECT id FROM events WHERE fingerprint = $1', [fingerprint]);
                    if (existRes.rows.length === 0) {
                        await client.query(
                            `INSERT INTO events (
                              name, venue, date, price, ticket_url, description, 
                              fingerprint, user_id, approved, created_at, genre
                          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)`,
                            [
                                evt.title,
                                VENUE_NAME,
                                eventDate, // Full Date (includes time)
                                'Free',
                                evt.link,
                                'Scraped from /cinema',
                                fingerprint,
                                USER_ID,
                                true,
                                'Cinema/Varies'
                            ]
                        );
                        addedCount++;
                        console.log(`  + Upserted: ${dateStr} - ${evt.title}`);
                    }
                }
            }
            console.log(`🎉 Finished. Added ${addedCount} events via Scraper.`);
        } finally {
            client.release();
        }

    } catch (e) {
        console.error('❌ Banshee Scraper Failed:', e);
    } finally {
        await pool.end();
    }
}

scrapeBanshee();
