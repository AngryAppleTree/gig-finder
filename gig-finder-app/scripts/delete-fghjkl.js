require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function deleteVenue() {
    const client = await pool.connect();
    try {
        // Check if venue has any events
        const eventsCheck = await client.query(
            'SELECT COUNT(*) FROM events WHERE venue_id = (SELECT id FROM venues WHERE name = $1)',
            ['fghjkl']
        );

        const eventCount = parseInt(eventsCheck.rows[0].count);

        if (eventCount > 0) {
            console.log(`⚠️  Warning: Venue "fghjkl" has ${eventCount} event(s) associated with it.`);
            console.log('   Deleting venue will set venue_id to NULL for these events.');
        }

        // Delete the venue
        const result = await client.query(
            'DELETE FROM venues WHERE name = $1 RETURNING id, name',
            ['fghjkl']
        );

        if (result.rows.length > 0) {
            console.log(`✅ Deleted venue: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
        } else {
            console.log('❌ Venue "fghjkl" not found');
        }

    } finally {
        client.release();
        await pool.end();
    }
}

deleteVenue();
