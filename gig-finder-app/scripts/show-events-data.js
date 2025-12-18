require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function showData() {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT 
                e.id,
                e.name,
                e.venue,
                v.name as venue_from_table,
                e.venue_id,
                e.date,
                e.price,
                e.user_id,
                e.ticket_url,
                e.is_internal_ticketing,
                e.fingerprint
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE e.date >= CURRENT_DATE
            ORDER BY e.date ASC
        `);

        console.log('\n');
        console.log('EVENTS TABLE DATA:');
        console.log('='.repeat(150));
        console.table(result.rows);
        console.log(`\nTotal rows: ${result.rows.length}`);

    } finally {
        client.release();
        await pool.end();
    }
}

showData().catch(console.error);
