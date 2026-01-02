const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.production.local') });
if (!process.env.POSTGRES_URL) {
    dotenv.config({ path: path.join(__dirname, '../.env.local') });
}

async function exportAllToCSV() {
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔍 Querying database for ALL venues and events...');

        // 1. Get All Venues
        const venuesRes = await pool.query(`
            SELECT id, name, city, address, postcode, capacity, approved, created_at
            FROM venues
            ORDER BY name ASC
        `);

        // 2. Get All Events
        const eventsRes = await pool.query(`
            SELECT e.id, e.name, v.name as venue_name, e.date, e.price, e.user_id, e.approved, e.created_at
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            ORDER BY e.date DESC
        `);

        const venues = venuesRes.rows;
        const events = eventsRes.rows;

        console.log(`✅ Found ${venues.length} total venues and ${events.length} total events.`);

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

        fs.writeFileSync(path.join(__dirname, '../all_venues.csv'), venueCSV);
        fs.writeFileSync(path.join(__dirname, '../all_events.csv'), eventCSV);

        console.log('\n📁 Files saved:');
        console.log('- all_venues.csv');
        console.log('- all_events.csv');

    } catch (err) {
        console.error('❌ Export error:', err);
    } finally {
        await pool.end();
    }
}

exportAllToCSV();
