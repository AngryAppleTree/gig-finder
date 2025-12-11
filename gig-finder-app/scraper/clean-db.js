require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function clean() {
    const client = await pool.connect();
    console.log('Cleaning scraper data...');
    const res = await client.query("DELETE FROM events WHERE user_id = 'scraper_v1'");
    console.log(`Deleted ${res.rowCount} rows.`);
    client.release();
    await pool.end();
}
clean();
