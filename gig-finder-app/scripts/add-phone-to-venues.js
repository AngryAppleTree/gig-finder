require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function addPhoneColumn() {
    const client = await pool.connect();
    try {
        console.log('🔧 Adding phone column to venues table...\n');

        // Add phone column
        await client.query(`
            ALTER TABLE venues 
            ADD COLUMN IF NOT EXISTS phone VARCHAR(20)
        `);

        console.log('✅ Phone column added successfully');

        // Show updated schema
        const result = await client.query(`
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'venues' 
            ORDER BY ordinal_position
        `);

        console.log('\n📊 Venues table schema:');
        console.log('Column | Type | Max Length');
        console.log('-------|------|------------');
        result.rows.forEach(col => {
            console.log(`${col.column_name} | ${col.data_type} | ${col.character_maximum_length || '-'}`);
        });

    } finally {
        client.release();
        await pool.end();
    }
}

addPhoneColumn();
