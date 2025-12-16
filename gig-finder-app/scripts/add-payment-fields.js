/**
 * Add payment fields to bookings table
 * Supports Stripe payment integration
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

        console.log('🛠  Adding payment fields to bookings table...');

        // Add payment_intent_id for Stripe
        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255);
        `);

        // Add price_paid to track actual amount paid
        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS price_paid DECIMAL(10,2);
        `);

        // Add checked_in column for QR code scanning
        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE;
        `);

        // Add booking_code for reference
        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS booking_code VARCHAR(20);
        `);

        console.log('✅ Migration successful!');
        console.log('📊 New columns:');
        console.log('   - payment_intent_id (VARCHAR) - Stripe payment ID');
        console.log('   - price_paid (DECIMAL) - Amount customer paid');
        console.log('   - checked_in (BOOLEAN) - Entry status');
        console.log('   - booking_code (VARCHAR) - Human-readable reference');

        client.release();
        process.exit(0);
    } catch (e) {
        console.error('❌ Migration Failed:', e.message);
        process.exit(1);
    }
}

migrate();
