/**
 * Increase event name column length from 50 to 200 characters
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

        console.log('🛠  Increasing name column length to 200 characters...');

        // Increase name column from VARCHAR(50) to VARCHAR(200)
        await client.query(`
            ALTER TABLE events 
            ALTER COLUMN name TYPE VARCHAR(200);
        `);

        console.log('✅ Migration successful!');
        console.log('📊 Updated column:');
        console.log('   - name: VARCHAR(50) → VARCHAR(200)');
        console.log('');
        console.log('✨ Event names can now be up to 200 characters long!');

        client.release();
        process.exit(0);
    } catch (e) {
        console.error('❌ Migration Failed:', e.message);
        process.exit(1);
    }
}

migrate();
