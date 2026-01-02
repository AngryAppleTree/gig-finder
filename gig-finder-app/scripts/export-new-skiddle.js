const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables - prioritizing production-level config if it exists
dotenv.config({ path: path.join(__dirname, '../.env.production.local') });
if (!process.env.POSTGRES_URL) {
    dotenv.config({ path: path.join(__dirname, '../.env.local') });
}

async function exportToCSV() {
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔍 Querying database for items added in the last hour...');

        // 1. Get New Venues
        const venuesRes = await pool.query(`
            SELECT id, name, city, address, approved, created_at
            FROM venues
            WHERE created_at > NOW() - INTERVAL '1 hour'
            ORDER BY created_at DESC
        `);

        // 2. Get New Events
        const eventsRes = await pool.query(`
            SELECT e.id, e.name, v.name as venue_name, e.date, e.price, e.approved, e.created_at
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE e.user_id = 'scraper_skiddle' 
            AND e.created_at > NOW() - INTERVAL '1 hour'
            ORDER BY e.created_at DESC
        `);

        const venues = venuesRes.rows;
        const events = eventsRes.rows;

        console.log(`✅ Found ${venues.length} new venues and ${events.length} new events.`);

        // Helper to convert array of objects to CSV
        const toCSV = (data) => {
            if (data.length === 0) return 'No data';
            const headers = Object.keys(data[0]);
            const rows = data.map(row =>
                headers.map(header => {
                    const val = row[header];
                    // Escape quotes and wrap in quotes
                    return `"${String(val).replace(/"/g, '""')}"`;
                }).join(',')
            );
            return [headers.join(','), ...rows].join('\n');
        };

        // Write files
        const venueCSV = toCSV(venues);
        const eventCSV = toCSV(events);

        fs.writeFileSync(path.join(__dirname, '../new_venues.csv'), venueCSV);
        fs.writeFileSync(path.join(__dirname, '../new_events.csv'), eventCSV);

        console.log('\n--- NEW VENUES CSV ---');
        console.log(venueCSV);
        console.log('\n--- NEW EVENTS CSV ---');
        console.log(eventCSV);

        console.log('\n📁 Files saved:');
        console.log('- new_venues.csv');
        console.log('- new_events.csv');

    } catch (err) {
        console.error('❌ Export error:', err);
    } finally {
        await pool.end();
    }
}

exportToCSV();
