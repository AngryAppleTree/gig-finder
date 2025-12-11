require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate3() {
    try {
        const client = await pool.connect();
        console.log('Widening price and description...');
        await client.query('ALTER TABLE events ALTER COLUMN price TYPE TEXT');
        await client.query('ALTER TABLE events ALTER COLUMN description TYPE TEXT');

        console.log('Done.');
        client.release();
        await pool.end();
    } catch (err) {
        console.error('Error:', err);
    }
}
migrate3();
