require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log('📦 Adding image_url column...');
        const client = await pool.connect();

        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS image_url TEXT;
        `);

        console.log('✅ "image_url" column added.');
        client.release();
    } catch (e) {
        console.error('Migration Failed:', e);
    } finally {
        pool.end();
    }
}

migrate();
