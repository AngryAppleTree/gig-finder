require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function addPresaleBookingColumns() {
    const client = await pool.connect();
    try {
        console.log('🔧 Adding presale booking columns to PRODUCTION bookings table...\n');

        // Add records_quantity column
        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS records_quantity INTEGER DEFAULT 0
        `);
        console.log('✅ Added records_quantity column');

        // Add platform_fee column
        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10, 2) DEFAULT 0
        `);
        console.log('✅ Added platform_fee column');

        // Add records_price column (to store the price at time of purchase)
        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS records_price DECIMAL(10, 2)
        `);
        console.log('✅ Added records_price column');

        // Show updated schema
        const result = await client.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns 
            WHERE table_name = 'bookings' 
            AND column_name IN ('records_quantity', 'platform_fee', 'records_price')
            ORDER BY column_name
        `);

        console.log('\n📊 New columns in PRODUCTION bookings table:');
        console.log('Column | Type | Default');
        console.log('-------|------|--------');
        result.rows.forEach(col => {
            console.log(`${col.column_name} | ${col.data_type} | ${col.column_default || 'NULL'}`);
        });

        console.log('\n✅ PRODUCTION Migration complete!');

    } finally {
        client.release();
        await pool.end();
    }
}

addPresaleBookingColumns().catch(console.error);
