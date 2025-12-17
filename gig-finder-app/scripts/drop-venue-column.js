/**
 * Drop the old venue column since venue_id is now in use
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('🔗 Connecting to database...');
    const client = await pool.connect();

    try {
        console.log('✅ Connected.');

        // Check if column exists
        const checkCol = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'events' AND column_name = 'venue'
        `);

        if (checkCol.rows.length === 0) {
            console.log('ℹ️  Column "venue" does not exist. Already dropped.');
            process.exit(0);
        }

        console.log('🗑️  Dropping old "venue" column...');
        await client.query('ALTER TABLE events DROP COLUMN venue');

        console.log('✅ Successfully dropped "venue" column!');
        console.log('📊 Events now use venue_id exclusively.');

        client.release();
        process.exit(0);
    } catch (e) {
        console.error('❌ Migration Failed:', e.message);
        client.release();
        process.exit(1);
    }
}

migrate();
