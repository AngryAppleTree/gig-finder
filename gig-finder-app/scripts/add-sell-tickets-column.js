/**
 * Add sell_tickets column to events table
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('🔗 Connecting to database...');
    try {
        const client = await pool.connect();
        console.log('✅ Connected.');

        console.log('🛠  Adding sell_tickets column to events table...');

        // Add sell_tickets column (boolean, default false)
        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS sell_tickets BOOLEAN DEFAULT FALSE;
        `);

        console.log('✅ Migration successful!');
        console.log('📊 New column:');
        console.log('   - sell_tickets (BOOLEAN) - Whether paid ticketing is enabled');

        client.release();
        process.exit(0);
    } catch (e) {
        console.error('❌ Migration Failed:', e.message);
        process.exit(1);
    }
}

migrate();
