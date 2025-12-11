require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log('📦 Adding Check-In columns...');
        const client = await pool.connect();

        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP DEFAULT NULL;
        `);

        console.log('✅ "checked_in_at" column added.');
        client.release();
    } catch (e) {
        console.error('Migration Failed:', e);
    } finally {
        pool.end();
    }
}

migrate();
