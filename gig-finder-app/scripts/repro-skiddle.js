
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Polyfill fetch if needed (Node 18+ has it)
// import fetch from 'node-fetch'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

const SKIDDLE_API_BASE = 'https://www.skiddle.com/api/v1';

async function main() {
    console.log("Starting Full Integration Repro...");
    const client = await pool.connect();

    try {
        const apiKey = process.env.SKIDDLE_API_KEY;
        if (!apiKey) throw new Error("No API Key");

        console.log("Fetching Skiddle events for Edinburgh...");
        const params = new URLSearchParams({
            api_key: apiKey,
            latitude: '55.9533',
            longitude: '-3.1883',
            radius: '20',
            order: 'date',
            limit: '5', // Limit to 5 for test
            eventcode: 'LIVE',
        });

        const skiddleUrl = `${SKIDDLE_API_BASE}/events/search/?${params.toString()}`;
        const response = await fetch(skiddleUrl);
        const data = await response.json();

        const events = data.results || [];
        console.log(`Fetched ${events.length} events from Skiddle.`);

        const venueMap = new Map();

        // 1. Process Venues
        for (const event of events) {
            const venueName = event.venue?.name;
            if (!venueName) continue;

            console.log(`Processing Venue: ${venueName}`);

            // mimic findOrCreateVenue
            let venueId;
            const existing = await client.query('SELECT id FROM venues WHERE LOWER(name) = LOWER($1)', [venueName]);

            if (existing.rows.length > 0) {
                venueId = existing.rows[0].id;
                console.log(` -> Found existing ID: ${venueId}`);
            } else {
                console.log(" -> Creating new venue...");
                const newVenue = await client.query(
                    `INSERT INTO venues (name, city, latitude, longitude)
                     VALUES ($1, $2, $3, $4)
                     RETURNING id`,
                    [venueName, event.venue.town, event.venue.latitude, event.venue.longitude]
                );
                venueId = newVenue.rows[0].id;
                console.log(` -> Created new ID: ${venueId}`);
            }
            venueMap.set(venueName.toLowerCase(), venueId);
        }

        // 2. Process Events
        for (const event of events) {
            const venueName = event.venue.name.toLowerCase();
            const venueId = venueMap.get(venueName);

            if (!venueId) {
                console.error(`ERROR: Venue ID not found for ${venueName}`);
                continue;
            }

            const dateStr = event.date;
            const fingerprint = `${dateStr}|venue_${venueId}|${event.eventname.toLowerCase().trim()}`;

            // Check existing
            const existingEvent = await client.query('SELECT id FROM events WHERE fingerprint = $1', [fingerprint]);

            if (existingEvent.rows.length > 0) {
                console.log(`Event exists: ${event.eventname}`);
            } else {
                console.log(`Creating Event: ${event.eventname}`);
                await client.query(
                    `INSERT INTO events (
                        name, venue_id, date, price, ticket_price, 
                        user_id, fingerprint, approved, created_at
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
                    [
                        event.eventname,
                        venueId,
                        `${dateStr} 19:00:00`,
                        event.entryprice || 'TBA',
                        0,
                        "scraper_repro",
                        fingerprint,
                        true
                    ]
                );
                console.log(" -> Created.");
            }
        }

    } catch (err) {
        console.error("FAIL:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
