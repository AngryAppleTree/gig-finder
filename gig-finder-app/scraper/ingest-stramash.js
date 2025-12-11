/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config({ path: '.env.local' });
const cheerio = require('cheerio');
const { Pool } = require('pg');
const { execSync } = require('child_process');

const VENUE_NAME = 'Stramash';
const USER_ID = 'scraper_stramash';

function fetchWithCurl(url) {
    try {
        const cmd = `curl -s -L -A "Mozilla/5.0" "${url}"`;
        return execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    } catch (e) {
        return null;
    }
}

async function scrapeStramash() {
    console.log('🚀 Starting Stramash RSS Scraper (Curl Mode)...');

    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
    });

    const feedUrl = 'https://stramashedinburgh.com/events/feed/';

    try {
        const text = fetchWithCurl(feedUrl);
        if (!text) throw new Error('Failed to fetch RSS feed');
        console.log('RSS Preview:', text.substring(0, 200));
        const $ = cheerio.load(text, { xmlMode: true });

        const items = $('item').toArray();
        console.log(`Found ${items.length} items in RSS feed.`);

        const client = await pool.connect();

        try {
            let addedCount = 0;

            for (const item of items) {
                const link = $(item).find('link').text();
                const rssTitle = $(item).find('title').text();

                if (!link) continue;

                console.log(`Processing: ${rssTitle}`);

                // Fetch individual page using Curl
                const pageHtml = fetchWithCurl(link);
                if (!pageHtml) {
                    console.log('  - Failed to fetch page (Curl returned null/error).');
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
                    const timeStr = dateObj.toISOString().split('T')[1].substring(0, 5); // Use correct time from dateObj (UTC)
                    // Actually, if input was "23:55+0:00", it is UTC.

                    // Filter Past Events
                    if (dateObj < new Date(new Date().setDate(new Date().getDate() - 1))) {
                        // console.log(`  - Past event skipped: ${dateStr}`);
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
                        // console.log(`  . Duplicate: ${dateStr}`);
                    }

                } else {
                    console.log('  - No JSON-LD Event data found.');
                }
            }
            console.log(`🎉 Finished. Added ${addedCount} new events.`);

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('❌ Stramash Scraper Failed:', error);
    } finally {
        await pool.end();
    }
}

// Export for Admin API
module.exports = { scrapeStramash };

// Run if executed directly
if (require.main === module) {
    scrapeStramash();
}
