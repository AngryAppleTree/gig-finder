require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function listAllVenues() {
    const client = await pool.connect();
    try {
        console.log('📋 All venues in PRODUCTION (grouped by city):\n');

        const result = await client.query(`
            SELECT 
                v.id,
                v.name,
                v.city,
                v.postcode,
                v.capacity,
                COUNT(e.id) as event_count
            FROM venues v
            LEFT JOIN events e ON e.venue_id = v.id
            GROUP BY v.id, v.name, v.city, v.postcode, v.capacity
            ORDER BY v.city, v.name
        `);

        let currentCity = '';
        for (const venue of result.rows) {
            if (venue.city !== currentCity) {
                currentCity = venue.city;
                console.log(`\n📍 ${currentCity || 'Unknown City'}:`);
            }
            console.log(`   ${venue.id}: ${venue.name} | ${venue.postcode || 'No postcode'} | Cap: ${venue.capacity || '?'} | Events: ${venue.event_count}`);
        }

        console.log(`\n\nTotal venues: ${result.rows.length}`);

    } finally {
        client.release();
        await pool.end();
    }
}

listAllVenues().catch(console.error);
