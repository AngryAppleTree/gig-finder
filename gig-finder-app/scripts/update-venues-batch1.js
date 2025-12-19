require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

// Batch 1: Venue data found from web search (5 venues)
const VENUE_UPDATES = [
    {
        name: 'Aberdeen Music Hall',
        city: 'Aberdeen',
        address: 'Union Street',
        postcode: 'AB10 1QS',
        capacity: 1300,
        email: 'events@aberdeenperformingarts.com',
        phone: '01224 641122',
        website: 'https://musicaberdeen.com'
    },
    {
        name: 'The Lemon Tree',
        city: 'Aberdeen',
        address: '5 West North Street',
        postcode: 'AB24 5AT',
        capacity: 550,
        email: 'events@aberdeenperformingarts.com',
        phone: '01224 641122',
        website: 'https://www.aberdeenperformingarts.com'
    },
    {
        name: 'Sneaky Pete\'s',
        city: 'Edinburgh',
        address: '73 Cowgate',
        postcode: 'EH1 1JW',
        capacity: 100,
        email: 'nick@sneakypetes.co.uk',
        phone: '0131 225 1757',
        website: 'https://sneakypetes.co.uk'
    },
    {
        name: 'Barrowland Ballroom',
        city: 'Glasgow',
        address: '244 Gallowgate',
        postcode: 'G4 0TT',
        capacity: 1900,
        email: 'office@barrowland.co.uk',
        phone: '0141 552 4601',
        website: 'https://barrowland.co.uk'
    }
];

async function updateVenueInfo() {
    const client = await pool.connect();
    try {
        console.log('📝 Updating venue information (Batch 1)...\n');

        await client.query('BEGIN');

        let updated = 0;
        let notFound = 0;

        for (const venue of VENUE_UPDATES) {
            console.log(`Searching for: ${venue.name}, ${venue.city}`);

            // Find venue by name and city
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
        console.log(`\n✅ Batch 1 complete!`);
        console.log(`   Updated: ${updated} venues`);
        console.log(`   Not found: ${notFound} venues`);

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
