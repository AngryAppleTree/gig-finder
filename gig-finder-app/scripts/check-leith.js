require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkLeithDepot() {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT id, name, city, postcode
            FROM venues
            WHERE LOWER(name) LIKE '%leith%' OR LOWER(name) LIKE '%depot%'
            ORDER BY name
        `);

        console.log('Venues matching "leith" or "depot":');
        console.log('='.repeat(80));
        result.rows.forEach(v => {
            console.log(`ID: ${v.id.toString().padEnd(4)} | Name: "${v.name}" | City: ${v.city || 'N/A'} | Postcode: ${v.postcode || 'N/A'}`);
        });
    } finally {
        client.release();
        await pool.end();
    }
}

checkLeithDepot().catch(console.error);
