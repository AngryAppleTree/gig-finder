
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

const SKIDDLE_API_BASE = 'https://www.skiddle.com/api/v1';

// Scottish cities to scrape
const SCOTTISH_CITIES = [
    { name: 'Edinburgh', lat: '55.9533', lon: '-3.1883' },
    { name: 'Glasgow', lat: '55.8642', lon: '-4.2518' },
    { name: 'Aberdeen', lat: '57.1497', lon: '-2.0943' },
    { name: 'Dundee', lat: '56.4620', lon: '-2.9707' },
    { name: 'Inverness', lat: '57.4778', lon: '-4.2247' },
    { name: 'Stirling', lat: '56.1165', lon: '-3.9369' },
    { name: 'Perth', lat: '56.3960', lon: '-3.4370' }
];

async function main() {
    console.log("🎸 Starting Full Event Population (with Price Fix)...");
    const client = await pool.connect();

    try {
        const apiKey = process.env.SKIDDLE_API_KEY;
        if (!apiKey) throw new Error("No API Key");

        let totalEventsProcessed = 0;
        let totalEventsCreated = 0;
        let totalEventsUpdated = 0;

        for (const city of SCOTTISH_CITIES) {
            console.log(`\n📍 Processing ${city.name}...`);

            const params = new URLSearchParams({
                api_key: apiKey,
                latitude: city.lat,
                longitude: city.lon,
                radius: '30',
                order: 'date',
                limit: '100', // Fetch up to 100 events per city
                eventcode: 'LIVE',
            });

            const skiddleUrl = `${SKIDDLE_API_BASE}/events/search/?${params.toString()}`;
            const response = await fetch(skiddleUrl);
            const data = await response.json();

            const events = data.results || [];
            console.log(`   Found ${events.length} events from Skiddle.`);

            // Pre-load venues map for this batch
            const venueMap = new Map();

            // 1. Ensure Venues Linkage
            for (const event of events) {
                const venueName = event.venue?.name;
                if (!venueName) continue;

                // Check if we already resolved this venue in this run
                if (venueMap.has(venueName.toLowerCase())) continue;

                // Find ID in DB
                const existing = await client.query('SELECT id FROM venues WHERE LOWER(name) = LOWER($1)', [venueName]);

                if (existing.rows.length > 0) {
                    venueMap.set(venueName.toLowerCase(), existing.rows[0].id);
                } else {
                    // Create if missing
                    // console.log(`   🆕 Creating missing venue: ${venueName}`);
                    try {
                        const newVenue = await client.query(
                            `INSERT INTO venues (name, city, latitude, longitude)
                             VALUES ($1, $2, $3, $4)
                             RETURNING id`,
                            [venueName, event.venue.town, event.venue.latitude, event.venue.longitude]
                        );
                        venueMap.set(venueName.toLowerCase(), newVenue.rows[0].id);
                    } catch (e) {
                        // Likely concurrency or duplicate on insert race condition
                        // Refetch
                        try {
                            const refetch = await client.query('SELECT id FROM venues WHERE LOWER(name) = LOWER($1)', [venueName]);
                            if (refetch.rows.length > 0) venueMap.set(venueName.toLowerCase(), refetch.rows[0].id);
                        } catch (err) { }
                    }
                }
            }

            // 2. Process Events
            let cityNewEvents = 0;
            let cityUpdatedEvents = 0;
            for (const event of events) {
                const venueName = event.venue.name.toLowerCase();
                const venueId = venueMap.get(venueName);

                if (!venueId) continue;

                const dateStr = event.date; // YYYY-MM-DD
                const fingerprint = `${dateStr}|venue_${venueId}|${event.eventname.toLowerCase().trim()}`;

                // Parse Price - Improved Logic
                let priceVal = 0;
                let priceText = 'Free';

                // 1. Try explicit pricing object first (most reliable for numbers)
                if (event.ticketpricing?.minPrice && parseFloat(event.ticketpricing.minPrice) > 0) {
                    priceVal = parseFloat(event.ticketpricing.minPrice);
                    priceText = `£${priceVal.toFixed(2)}`;
                }
                // 2. Fallback to entryprice text parsing
                else if (event.entryprice) {
                    // Look for patterns like "£10" or "GBP 10" or "10.00"
                    const m = event.entryprice.match(/(?:£|GBP)?\s*(\d+(?:\.\d{2})?)/i);
                    if (m) {
                        priceVal = parseFloat(m[1]);
                        priceText = `£${priceVal.toFixed(2)}`;
                    }
                }

                // Check existing
                const existingEvent = await client.query('SELECT id FROM events WHERE fingerprint = $1', [fingerprint]);

                if (existingEvent.rows.length === 0) {
                    await client.query(
                        `INSERT INTO events (
                            name, venue_id, date, price, ticket_price, 
                            user_id, fingerprint, approved, created_at,
                            ticket_url, image_url, description, genre
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10, $11, $12)`,
                        [
                            event.eventname,
                            venueId,
                            `${dateStr} ${event.openingtimes?.doorsopen || '19:00'}:00`,
                            priceText,
                            priceVal,
                            "scraper_skiddle",
                            fingerprint,
                            true,
                            event.link,
                            event.imageurl,
                            event.description,
                            event.genres?.[0]?.name
                        ]
                    );
                    cityNewEvents++;
                    totalEventsCreated++;
                } else {
                    // Update existing event price
                    const id = existingEvent.rows[0].id;
                    await client.query(
                        `UPDATE events SET price = $1, ticket_price = $2 WHERE id = $3`,
                        [priceText, priceVal, id]
                    );
                    cityUpdatedEvents++;
                    totalEventsUpdated++;
                }
                totalEventsProcessed++;
            }
            console.log(`   Saved ${cityNewEvents} new, Updated ${cityUpdatedEvents} events.`);

            // Be nice to API
            await new Promise(r => setTimeout(r, 500));
        }

        console.log(`\n✅ Population Complete.`);
        console.log(`   Total Processed: ${totalEventsProcessed}`);
        console.log(`   Total Created: ${totalEventsCreated}`);
        console.log(`   Total Updated: ${totalEventsUpdated}`);

    } catch (err) {
        console.error("FAIL:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
