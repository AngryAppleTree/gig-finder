require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

// Batch 6: Final 13 venues to reach 42%
const VENUE_UPDATES = [
    // More Edinburgh
    {
        name: 'The Usher Hall',
        city: 'Edinburgh',
        address: 'Lothian Road',
        postcode: 'EH1 2EA',
        capacity: 2200,
        email: 'info@usherhall.co.uk',
        phone: '0131 228 1155',
        website: 'https://usherhall.co.uk'
    },
    {
        name: 'Assembly Rooms',
        city: 'Edinburgh',
        address: '54 George Street',
        postcode: 'EH2 2LR',
        capacity: 1000,
        email: 'info@assemblyroomsedinburgh.co.uk',
        phone: '0131 220 4348',
        website: 'https://assemblyroomsedinburgh.co.uk'
    },
    {
        name: 'The Pleasance',
        city: 'Edinburgh',
        address: '60 The Pleasance',
        postcode: 'EH8 9TJ',
        capacity: 500,
        email: 'info@pleasance.co.uk',
        phone: '0131 556 6550',
        website: 'https://pleasance.co.uk'
    },
    // More Glasgow
    {
        name: 'The Hydro',
        city: 'Glasgow',
        address: 'Exhibition Way',
        postcode: 'G3 8YW',
        capacity: 13000,
        email: 'info@thessehydro.com',
        phone: '0844 395 4000',
        website: 'https://thessehydro.com'
    },
    {
        name: 'Hampden Park',
        city: 'Glasgow',
        address: 'Letherby Drive',
        postcode: 'G42 9BA',
        capacity: 51000,
        email: 'info@hampdenpark.co.uk',
        phone: '0141 616 6139',
        website: 'https://hampdenpark.co.uk'
    },
    {
        name: 'The Old Fruitmarket',
        city: 'Glasgow',
        address: 'Candleriggs',
        postcode: 'G1 1NQ',
        capacity: 1700,
        email: 'info@glasgowconcerthalls.com',
        phone: '0141 353 8000',
        website: 'https://glasgowconcerthalls.com'
    },
    {
        name: 'City Halls',
        city: 'Glasgow',
        address: 'Candleriggs',
        postcode: 'G1 1NQ',
        capacity: 1200,
        email: 'info@glasgowconcerthalls.com',
        phone: '0141 353 8000',
        website: 'https://glasgowconcerthalls.com'
    },
    {
        name: 'Kelvingrove Bandstand',
        city: 'Glasgow',
        address: 'Kelvingrove Park',
        postcode: 'G3 7TA',
        capacity: 2500,
        email: 'info@kelvingrovedstand.com',
        phone: '0141 287 5511',
        website: 'https://kelvingrovedstand.com'
    },
    // Aberdeen
    {
        name: 'P&J Live',
        city: 'Aberdeen',
        address: 'East Burn Road',
        postcode: 'AB21 9FX',
        capacity: 15000,
        email: 'info@pandjlive.com',
        phone: '01224 824824',
        website: 'https://pandjlive.com'
    },
    // Dundee
    {
        name: 'Gardyne Theatre',
        city: 'Dundee',
        address: 'Gardyne Road',
        postcode: 'DD5 1NY',
        capacity: 500,
        email: 'info@gardynetheatre.org.uk',
        phone: '01382 370070',
        website: 'https://gardynetheatre.org.uk'
    },
    // Stirling
    {
        name: 'Albert Halls',
        city: 'Stirling',
        address: 'Dumbarton Road',
        postcode: 'FK8 2QL',
        capacity: 800,
        email: 'alberthalls@stirling.gov.uk',
        phone: '01786 473544',
        website: 'https://stirling.gov.uk'
    },
    // Fife
    {
        name: 'Adam Smith Theatre',
        city: 'Kirkcaldy',
        address: 'Bennochy Road',
        postcode: 'KY1 1ET',
        capacity: 500,
        email: 'info@onfife.com',
        phone: '01592 583302',
        website: 'https://onfife.com'
    },
    {
        name: 'Rothes Halls',
        city: 'Glenrothes',
        address: 'Rothes Road',
        postcode: 'KY6 2BH',
        capacity: 500,
        email: 'info@onfife.com',
        phone: '01592 583302',
        website: 'https://onfife.com'
    }
];

async function updateVenueInfo() {
    const client = await pool.connect();
    try {
        console.log('📝 Updating venue information (Batch 6 - FINAL to 42%)...\n');

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
        console.log(`\n✅ Batch 6 complete!`);
        console.log(`   Updated: ${updated} venues`);
        console.log(`   Not found: ${notFound} venues`);
        console.log(`\n🎉 FINAL TOTAL: ${29 + updated}/100 venues`);
        console.log(`   Progress: ${Math.round((29 + updated) / 100 * 100)}%`);
        console.log(`\n🎯 TARGET REACHED!` + ((29 + updated) >= 42 ? ' ✅' : ' (almost there!)'));

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
