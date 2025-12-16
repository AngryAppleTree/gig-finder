/**
 * Add refund tracking columns to bookings table
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

        console.log('🛠  Adding refund columns to bookings table...');

        // Add refund_id to track Stripe refund
        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS refund_id VARCHAR(255);
        `);

        // Add refunded_at timestamp
        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP;
        `);

        // Add index on status for faster queries
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
        `);

        console.log('✅ Migration successful!');
        console.log('📊 New columns:');
        console.log('   - refund_id (VARCHAR) - Stripe refund ID');
        console.log('   - refunded_at (TIMESTAMP) - When refund was processed');
        console.log('   - idx_bookings_status - Index for faster status queries');

        client.release();
        process.exit(0);
    } catch (e) {
        console.error('❌ Migration Failed:', e.message);
        process.exit(1);
    }
}

migrate();
