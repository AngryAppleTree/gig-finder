require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function findSimilarVenues() {
    const client = await pool.connect();
    try {
        console.log('🔍 Finding similar/duplicate venues in PRODUCTION...\n');

        // Get all venues in the same city
        const result = await client.query(`
            SELECT 
                v1.id as id1,
                v1.name as name1,
                v1.postcode as postcode1,
                v1.capacity as capacity1,
                v2.id as id2,
                v2.name as name2,
                v2.postcode as postcode2,
                v2.capacity as capacity2,
                v1.city
            FROM venues v1
            JOIN venues v2 ON v1.city = v2.city AND v1.id < v2.id
            WHERE v1.city IS NOT NULL
            AND (
                v1.name ILIKE v2.name || '%' 
                OR v2.name ILIKE v1.name || '%'
                OR SIMILARITY(v1.name, v2.name) > 0.6
            )
            ORDER BY v1.city, v1.name
        `);

        if (result.rows.length === 0) {
            console.log('✅ No similar venues found');
        } else {
            console.log(`Found ${result.rows.length} potential duplicate pairs:\n`);

            const processed = new Set();

            for (const row of result.rows) {
                const key = [row.id1, row.id2].sort().join('-');
                if (processed.has(key)) continue;
                processed.add(key);

                // Get event counts
                const events1 = await client.query('SELECT COUNT(*) FROM events WHERE venue_id = $1', [row.id1]);
                const events2 = await client.query('SELECT COUNT(*) FROM events WHERE venue_id = $1', [row.id2]);

                console.log(`📍 ${row.city.toUpperCase()}`);
                console.log(`   1. ID: ${row.id1} - "${row.name1}"`);
                console.log(`      Postcode: ${row.postcode1 || 'Unknown'}, Capacity: ${row.capacity1 || 'Unknown'}, Events: ${events1.rows[0].count}`);
                console.log(`   2. ID: ${row.id2} - "${row.name2}"`);
                console.log(`      Postcode: ${row.postcode2 || 'Unknown'}, Capacity: ${row.capacity2 || 'Unknown'}, Events: ${events2.rows[0].count}`);
                console.log('');
            }
        }

    } finally {
        client.release();
        await pool.end();
    }
}

findSimilarVenues().catch(console.error);
