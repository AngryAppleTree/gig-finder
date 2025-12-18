require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkVenues() {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT id, name, city, capacity 
            FROM venues 
            ORDER BY name
        `);

        console.log('\n📊 Venues in database:\n');
        console.log('ID | Name | City | Capacity');
        console.log('---|------|------|----------');

        result.rows.forEach(v => {
            console.log(`${v.id} | ${v.name} | ${v.city || '-'} | ${v.capacity || 'NULL'}`);
        });

        console.log(`\n✅ Total venues: ${result.rows.length}`);

    } finally {
        client.release();
        await pool.end();
    }
}

checkVenues();
