require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function findDuplicateVenues() {
    const client = await pool.connect();
    try {
        console.log('🔍 Finding duplicate venues in PRODUCTION...\n');

        // Get all venues and group them manually
        const allVenues = await client.query(`
            SELECT id, name, city, postcode, capacity
            FROM venues
            WHERE city IS NOT NULL
            ORDER BY city, name
        `);

        // Group by normalized name and city
        const groups = {};
        for (const venue of allVenues.rows) {
            const normalizedName = venue.name.toLowerCase().trim().replace(/\s+/g, ' ');
            const normalizedCity = (venue.city || '').toLowerCase().trim();
            const key = `${normalizedName}|${normalizedCity}`;

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(venue);
        }

        // Find duplicates
        const duplicates = Object.entries(groups).filter(([key, venues]) => venues.length > 1);

        if (duplicates.length === 0) {
            console.log('✅ No duplicate venues found');
        } else {
            console.log(`❌ Found ${duplicates.length} duplicate venue groups:\n`);

            for (const [key, venues] of duplicates) {
                const [name, city] = key.split('|');
                console.log(`📍 ${name.toUpperCase()} in ${city.toUpperCase()}`);
                console.log(`   ${venues.length} duplicate venues:`);

                for (let i = 0; i < venues.length; i++) {
                    const venue = venues[i];

                    // Get event count
                    const eventCount = await client.query(
                        'SELECT COUNT(*) FROM events WHERE venue_id = $1',
                        [venue.id]
                    );

                    console.log(`   ${i + 1}. ID: ${venue.id}`);
                    console.log(`      Name: "${venue.name}"`);
                    console.log(`      Postcode: ${venue.postcode || 'Unknown'}`);
                    console.log(`      Capacity: ${venue.capacity || 'Unknown'}`);
                    console.log(`      Events: ${eventCount.rows[0].count}`);
                }
                console.log('');
            }

            console.log('\n💡 To merge duplicates, you can:');
            console.log('   1. Use the admin panel to manually reassign events');
            console.log('   2. Delete duplicate venues after reassigning');
            console.log('   3. Or create a merge script if you have many duplicates');
        }

    } finally {
        client.release();
        await pool.end();
    }
}

findDuplicateVenues().catch(console.error);
