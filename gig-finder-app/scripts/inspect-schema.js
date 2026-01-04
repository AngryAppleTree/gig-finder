const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env.production.local') });
if (!process.env.POSTGRES_URL) {
    dotenv.config({ path: path.join(__dirname, '../.env.local') });
}

async function checkSchema() {
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const venues = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'venues' ORDER BY ordinal_position");
        const events = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'events' ORDER BY ordinal_position");
        const users = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position");

        console.log('--- VENUES TABLE ---');
        console.table(venues.rows);
        console.log('\n--- EVENTS TABLE ---');
        console.table(events.rows);
        console.log('\n--- USERS TABLE ---');
        console.table(users.rows);
    } catch (err) {
        console.error('❌ Schema check error:', err);
    } finally {
        await pool.end();
    }
}
checkSchema();
