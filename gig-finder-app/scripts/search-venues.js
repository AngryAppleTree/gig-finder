const { Pool } = require('pg');

async function searchVenues() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const searchTerms = ['Bannerman', 'Banshee', 'Nice', 'Sleazy'];

        for (const term of searchTerms) {
            console.log(`\nSearching for venues containing "${term}":\n`);
            const result = await pool.query(
                `SELECT id, name, address, city FROM venues WHERE name ILIKE $1 ORDER BY name`,
                [`%${term}%`]
            );

            if (result.rows.length > 0) {
                result.rows.forEach(venue => {
                    console.log(`  ID ${venue.id}: "${venue.name}" - ${venue.address}, ${venue.city || 'N/A'}`);
                });
            } else {
                console.log(`  No venues found`);
            }
        }

    } catch (error) {
        console.error('Error searching venues:', error);
    } finally {
        await pool.end();
    }
}

searchVenues();
