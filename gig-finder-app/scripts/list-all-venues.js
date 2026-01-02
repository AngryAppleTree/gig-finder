const { Pool } = require('pg');

async function listAllVenues() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const result = await pool.query(`
      SELECT id, name, address, city
      FROM venues
      ORDER BY name
    `);

        console.log(`Total venues: ${result.rows.length}\n`);
        console.log('All venues in database:\n');

        result.rows.forEach((venue, idx) => {
            console.log(`${idx + 1}. ID ${venue.id}: "${venue.name}"`);
            if (venue.address) console.log(`   ${venue.address}, ${venue.city || 'N/A'}`);
        });

    } catch (error) {
        console.error('Error listing venues:', error);
    } finally {
        await pool.end();
    }
}

listAllVenues();
