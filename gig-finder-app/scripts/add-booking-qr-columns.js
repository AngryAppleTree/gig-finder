require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function addMissingColumns() {
    const client = await pool.connect();
    try {
        console.log('🔧 Adding missing columns to bookings table...\n');

        await client.query('BEGIN');

        // Add payment_intent_id column
        console.log('Adding payment_intent_id column...');
        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS payment_intent_id TEXT
        `);
        console.log('✅ payment_intent_id added\n');

        // Add qr_code column
        console.log('Adding qr_code column...');
        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS qr_code TEXT
        `);
        console.log('✅ qr_code added\n');

        await client.query('COMMIT');

        // Verify columns were added
        const result = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'bookings' 
            ORDER BY ordinal_position
        `);

        console.log('📋 Updated bookings table schema:');
        result.rows.forEach(row => {
            console.log(`   - ${row.column_name} (${row.data_type})`);
        });

        console.log('\n✅ Migration complete!');
        console.log('\n⚠️  IMPORTANT: You need to redeploy to Vercel for this to take effect!');
        console.log('   The webhook will now be able to save QR codes and payment intents.');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addMissingColumns().catch(console.error);
