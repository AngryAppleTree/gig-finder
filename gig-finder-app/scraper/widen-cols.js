require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate2() {
    try {
        const client = await pool.connect();
        console.log('Widening columns...');
        await client.query('ALTER TABLE events ALTER COLUMN name TYPE TEXT'); // Use TEXT for unlimited length
        await client.query('ALTER TABLE events ALTER COLUMN venue TYPE TEXT');
        await client.query('ALTER TABLE events ALTER COLUMN genre TYPE TEXT');

        console.log('Done.');
        client.release();
        await pool.end();
    } catch (err) {
        console.error('Error:', err);
    }
}
migrate2();
