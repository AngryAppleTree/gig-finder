require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

// Batch 5: Another 20 venues to reach 42%
const VENUE_UPDATES = [
    {
        name: 'Banshee\'s Labyrinth',
        city: 'Edinburgh',
        address: '29-35 Niddry Street',
        postcode: 'EH1 1LG',
        capacity: 80,
        email: 'bookings@thebansheelabyrinth.com',
        phone: '0131 558 8209',
        website: 'https://thebansheelabyrinth.com'
    },
    {
        name: 'Leith Depot',
        city: 'Edinburgh',
        address: '138-140 Leith Walk',
        postcode: 'EH6 5DT',
        capacity: 65,
        email: 'leithdepot@gmail.com',
        phone: '0131 555 4738',
        website: 'https://leithdepot.com'
    },
    {
        name: 'Edinburgh Corn Exchange',
        city: 'Edinburgh',
        address: '10 Newmarket Road',
        postcode: 'EH14 1RJ',
        capacity: 3000,
        email: 'info@ece.org.uk',
        phone: '0131 477 3500',
        website: 'https://ece.org.uk'
    },
    {
        name: 'Stramash',
        city: 'Edinburgh',
        address: '10 Calton Road',
        postcode: 'EH8 8DL',
        capacity: 250,
        email: 'info@stramash.co.uk',
        phone: '0131 557 0687',
        website: 'https://stramash.co.uk'
    },
    {
        name: 'Henry\'s Cellar Bar',
        city: 'Edinburgh',
        address: '16 Morrison Street',
        postcode: 'EH3 8BJ',
        capacity: 250,
        email: 'info@henryscellarbar.com',
        phone: '0131 629 9990',
        website: 'https://henryscellarbar.com'
    },
    {
        name: 'Voodoo Rooms',
        city: 'Edinburgh',
        address: '19a West Register Street',
        postcode: 'EH2 2AA',
        capacity: 300,
        email: 'info@thevoodoorooms.com',
        phone: '0131 556 7060',
        website: 'https://thevoodoorooms.com'
    },
    {
        name: 'The Bongo Club',
        city: 'Edinburgh',
        address: '66 Cowgate',
        postcode: 'EH1 1JX',
        capacity: 400,
        email: 'info@thebongoclub.co.uk',
        phone: '0131 558 7604',
        website: 'https://thebongoclub.co.uk'
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
        name: 'The Jazz Bar',
        city: 'Edinburgh',
        address: '1a Chambers Street',
        postcode: 'EH1 1HR',
        capacity: 100,
        email: 'info@thejazzbar.co.uk',
        phone: '0131 220 4298',
        website: 'https://thejazzbar.co.uk'
    },
    {
        name: 'Whistlebinkies',
        city: 'Edinburgh',
        address: '4-6 South Bridge',
        postcode: 'EH1 1LL',
        capacity: 150,
        email: 'info@whistlebinkies.com',
        phone: '0131 557 5114',
        website: 'https://whistlebinkies.com'
    },
    // Glasgow venues
    {
        name: 'Sub Club',
        city: 'Glasgow',
        address: '22 Jamaica Street',
        postcode: 'G1 4QD',
        capacity: 410,
        email: 'info@subclub.co.uk',
        phone: '0141 248 4600',
        website: 'https://subclub.co.uk'
    },
    {
        name: 'Broadcast',
        city: 'Glasgow',
        address: '427 Sauchiehall Street',
        postcode: 'G2 3LG',
        capacity: 200,
        email: 'info@broadcastglasgow.co.uk',
        phone: '0141 204 0160',
        website: 'https://broadcastglasgow.co.uk'
    },
    {
        name: 'Mono',
        city: 'Glasgow',
        address: '12 Kings Court',
        postcode: 'G1 5RB',
        capacity: 150,
        email: 'info@monocafebar.com',
        phone: '0141 553 2400',
        website: 'https://monocafebar.com'
    },
    {
        name: 'Glad Cafe',
        city: 'Glasgow',
        address: '1006a Pollokshaws Road',
        postcode: 'G41 2HG',
        capacity: 100,
        email: 'info@thegladcafe.co.uk',
        phone: '0141 636 6119',
        website: 'https://thegladcafe.co.uk'
    },
    {
        name: 'Saint Luke\'s',
        city: 'Glasgow',
        address: '17 Bain Street',
        postcode: 'G40 2JZ',
        capacity: 350,
        email: 'info@saintlukes.co.uk',
        phone: '0141 552 8378',
        website: 'https://saintlukes.co.uk'
    },
    {
        name: 'The Art School',
        city: 'Glasgow',
        address: '167 Renfrew Street',
        postcode: 'G3 6RQ',
        capacity: 300,
        email: 'info@theartschoolglasgow.co.uk',
        phone: '0141 353 4700',
        website: 'https://theartschoolglasgow.co.uk'
    },
    {
        name: 'Ivory Blacks',
        city: 'Glasgow',
        address: '56 Oswald Street',
        postcode: 'G1 4PL',
        capacity: 250,
        email: 'info@ivoryblacks.co.uk',
        phone: '0141 204 2288',
        website: 'https://ivoryblacks.co.uk'
    },
    {
        name: 'The Flying Duck',
        city: 'Glasgow',
        address: '142 Renfield Street',
        postcode: 'G2 3AU',
        capacity: 200,
        email: 'info@theflyingduck.org',
        phone: '0141 564 1450',
        website: 'https://theflyingduck.org'
    },
    {
        name: 'Bloc+',
        city: 'Glasgow',
        address: '117 Bath Street',
        postcode: 'G2 2SZ',
        capacity: 600,
        email: 'info@blocplus.co.uk',
        phone: '0141 574 6066',
        website: 'https://blocplus.co.uk'
    },
    {
        name: 'The 13th Note',
        city: 'Glasgow',
        address: '50-60 King Street',
        postcode: 'G1 5QT',
        capacity: 200,
        email: 'info@13thnote.co.uk',
        phone: '0141 553 1638',
        website: 'https://13thnote.co.uk'
    }
];

async function updateVenueInfo() {
    const client = await pool.connect();
    try {
        console.log('📝 Updating venue information (Batch 5 - 20 venues)...\n');

        await client.query('BEGIN');

        let updated = 0;
        let notFound = 0;

        for (const venue of VENUE_UPDATES) {
            console.log(`Searching for: ${venue.name}, ${venue.city}`);

            // Find venue by name and city (case insensitive, fuzzy match)
            const existing = await client.query(`
                SELECT id FROM venues 
                WHERE (name ILIKE $1 OR name ILIKE $2 OR name ILIKE $3) 
                AND city ILIKE $4
            `, [venue.name, `%${venue.name}%`, `${venue.name}%`, venue.city]);

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

                console.log(`  ✅ Updated ID ${venueId}`);
                updated++;
            } else {
                console.log(`  ⚠️  Not found - skipping`);
                notFound++;
            }
        }

        await client.query('COMMIT');
        console.log(`\n✅ Batch 5 complete!`);
        console.log(`   Updated: ${updated} venues`);
        console.log(`   Not found: ${notFound} venues`);
        console.log(`\n📊 Total venues populated so far: ${22 + updated}`);
        console.log(`   Progress: ${Math.round((22 + updated) / 100 * 100)}%`);

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
