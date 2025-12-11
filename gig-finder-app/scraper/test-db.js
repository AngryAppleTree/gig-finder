require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function test() {
    try {
        console.log('Connecting to:', process.env.POSTGRES_URL ? 'URL Found' : 'No URL');
        const client = await pool.connect();
        const res = await client.query('SELECT NOW()');
        console.log('DB Time:', res.rows[0]);
        client.release();
        await pool.end();
    } catch (err) {
        console.error('DB Error:', err);
    }
}
test();
