require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

// Batch 2: More venue data from web search
const VENUE_UPDATES = [
    {
        name: 'King Tut\'s Wah Wah Hut',
        city: 'Glasgow',
        address: '272A St Vincent Street',
        postcode: 'G2 5RL',
        capacity: 300,
        email: 'admin@dfconcerts.co.uk',
        phone: '0141 846 4034',
        website: 'https://kingtuts.co.uk'
    },
    {
        name: 'The Garage',
        city: 'Glasgow',
        address: '490 Sauchiehall Street',
        postcode: 'G2 3LW',
        capacity: 1800,
        email: 'garageall@hfents.com',
        phone: '0141 332 1120',
        website: 'https://garageglasgow.co.uk'
    },
    {
        name: 'Cabaret Voltaire',
        city: 'Edinburgh',
        address: '36-38 Blair Street',
        postcode: 'EH1 1QR',
        capacity: 500,
        email: 'info@thecabaretvoltaire.com',
        phone: '0131 247 4704',
        website: 'https://thecabaretvoltaire.com'
    }
];

async function updateVenueInfo() {
    const client = await pool.connect();
    try {
        console.log('📝 Updating venue information (Batch 2)...\n');

        await client.query('BEGIN');

        let updated = 0;
        let notFound = 0;

        for (const venue of VENUE_UPDATES) {
            console.log(`Searching for: ${venue.name}, ${venue.city}`);

            // Find venue by name and city (case insensitive)
            const existing = await client.query(
                'SELECT id FROM venues WHERE name ILIKE $1 AND city ILIKE $2',
                [venue.name, venue.city]
            );

            if (existing.rows.length > 0) {
                const venueId = existing.rows[0].id;

                await client.query(`
                    UPDATE venues
                    SET 
                        address = COALESCE(NULLIF($1, ''), address),
                        postcode = COALESCE(NULLIF($2, ''), postcode),
                        capacity = COALESCE($3, capacity),
                        email = COALESCE(NULLIF($4, ''), email),
                        phone = COALESCE(NULLIF($5, ''), phone),
                        website = COALESCE(NULLIF($6, ''), website)
                    WHERE id = $7
                `, [
                    venue.address,
                    venue.postcode,
                    venue.capacity,
                    venue.email,
                    venue.phone,
                    venue.website,
                    venueId
                ]);

                console.log(`  ✅ Updated ID ${venueId}:`);
                console.log(`     Address: ${venue.address}`);
                console.log(`     Postcode: ${venue.postcode}`);
                console.log(`     Capacity: ${venue.capacity}`);
                console.log(`     Email: ${venue.email}`);
                console.log(`     Phone: ${venue.phone}`);
                console.log('');
                updated++;
            } else {
                console.log(`  ⚠️  Not found in database - skipping`);
                console.log('');
                notFound++;
            }
        }

        await client.query('COMMIT');
        console.log(`\n✅ Batch 2 complete!`);
        console.log(`   Updated: ${updated} venues`);
        console.log(`   Not found: ${notFound} venues`);
        console.log(`\n📊 Total venues populated so far: ${6 + 4 + updated}`);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

updateVenueInfo().catch(console.error);
