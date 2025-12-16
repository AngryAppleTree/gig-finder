/**
 * Add ticket_price column to events table
 * This stores the numerical price value for paid ticketing
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

        console.log('🛠  Adding ticket_price column...');

        // Add ticket_price as DECIMAL(10,2) for monetary values
        // This allows prices like 10.50, 99.99, etc.
        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS ticket_price DECIMAL(10,2) DEFAULT NULL;
        `);

        console.log('🛠  Adding price_currency column...');

        // Add currency column (default to GBP for UK)
        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS price_currency VARCHAR(3) DEFAULT 'GBP';
        `);

        console.log('✅ Migration successful!');
        console.log('📊 New columns:');
        console.log('   - ticket_price (DECIMAL(10,2)) - Numerical price value');
        console.log('   - price_currency (VARCHAR(3)) - Currency code (GBP, USD, EUR, etc.)');

        client.release();
        process.exit(0);
    } catch (e) {
        console.error('❌ Migration Failed:', e.message);
        process.exit(1);
    }
}

migrate();
