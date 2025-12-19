require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function addPresaleColumns() {
    const client = await pool.connect();
    try {
        console.log('🔧 Adding presale columns to PRODUCTION events table...\n');

        // Add presale_price column
        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS presale_price DECIMAL(10, 2)
        `);
        console.log('✅ Added presale_price column');

        // Add presale_caption column
        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS presale_caption VARCHAR(200)
        `);
        console.log('✅ Added presale_caption column');

        // Show updated schema
        const result = await client.query(`
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'events' 
            AND column_name IN ('presale_price', 'presale_caption')
            ORDER BY column_name
        `);

        console.log('\n📊 New columns in PRODUCTION events table:');
        console.log('Column | Type | Max Length');
        console.log('-------|------|------------');
        result.rows.forEach(col => {
            console.log(`${col.column_name} | ${col.data_type} | ${col.character_maximum_length || '-'}`);
        });

        console.log('\n✅ PRODUCTION Migration complete!');

    } finally {
        client.release();
        await pool.end();
    }
}

addPresaleColumns();
