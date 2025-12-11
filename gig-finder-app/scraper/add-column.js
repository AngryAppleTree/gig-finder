require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        const client = await pool.connect();
        console.log('Adding ticket_url column...');
        await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS ticket_url TEXT');
        console.log('Adding approved column (just in case)...');
        await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT TRUE');
        console.log('Adding fingerprint column (just in case)...');
        await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS fingerprint TEXT');

        console.log('Done.');
        client.release();
        await pool.end();
    } catch (err) {
        console.error('Error:', err);
    }
}
migrate();
