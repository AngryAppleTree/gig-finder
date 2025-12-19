require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function addEmailColumn() {
    const client = await pool.connect();
    try {
        console.log('📧 Adding email column to venues table...\n');

        // Add email column if it doesn't exist
        await client.query(`
            ALTER TABLE venues 
            ADD COLUMN IF NOT EXISTS email VARCHAR(255)
        `);

        console.log('✅ Email column added successfully!');

        // Also add website and phone if they don't exist
        await client.query(`
            ALTER TABLE venues 
            ADD COLUMN IF NOT EXISTS website VARCHAR(255),
            ADD COLUMN IF NOT EXISTS phone VARCHAR(50)
        `);

        console.log('✅ Website and phone columns added successfully!');

    } finally {
        client.release();
        await pool.end();
    }
}

addEmailColumn().catch(console.error);
