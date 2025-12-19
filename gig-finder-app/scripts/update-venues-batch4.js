require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

// Batch 4: Large batch of 30 venues from web search
const VENUE_UPDATES = [
    // Edinburgh venues
    {
        name: 'The Queen\'s Hall',
        city: 'Edinburgh',
        address: '85-89 Clerk Street',
        postcode: 'EH8 9JG',
        capacity: 900,
        email: 'info@queenshalledinburgh.org',
        phone: '0131 668 2019',
        website: 'https://thequeenshall.net'
    },
    // Glasgow venues
    {
        name: 'Oran Mor',
        city: 'Glasgow',
        address: '731-735 Great Western Road',
        postcode: 'G12 8QX',
        capacity: 500,
        email: 'info@oran-mor.co.uk',
        phone: '0141 357 6200',
        website: 'https://oran-mor.co.uk'
    },
    // Aberdeen venues  
    {
        name: 'Aberdeen Beach Ballroom',
        city: 'Aberdeen',
        address: 'Beach Promenade',
        postcode: 'AB24 5NR',
        capacity: 1500,
        email: 'info@aberdeenperformingarts.com',
        phone: '01224 641122',
        website: 'https://aberdeenperformingarts.com'
    },
    // Dundee venues
    {
        name: 'Caird Hall',
        city: 'Dundee',
        address: 'City Square',
        postcode: 'DD1 3BB',
        capacity: 2200,
        email: 'caird.hall@leisureandculturedundee.com',
        phone: '01382 434940',
        website: 'https://leisureandculturedundee.com'
    },
    // Stirling venues
    {
        name: 'The Tolbooth',
        city: 'Stirling',
        address: 'Jail Wynd',
        postcode: 'FK8 1DE',
        capacity: 200,
        email: 'thetolbooth@stirling.gov.uk',
        phone: '01786 274000',
        website: 'https://tolbooth.co.uk'
    },
    // Perth venues
    {
        name: 'Perth Concert Hall',
        city: 'Perth',
        address: 'Mill Street',
        postcode: 'PH1 5HZ',
        capacity: 1200,
        email: 'perthconcerthall@culturepk.org.uk',
        phone: '01738 621031',
        website: 'https://horsecross.co.uk'
    },
    // Inverness venues
    {
        name: 'Ironworks',
        city: 'Inverness',
        address: '122b Academy Street',
        postcode: 'IV1 1LX',
        capacity: 1000,
        email: 'info@ironworksvenue.com',
        phone: '01463 237670',
        website: 'https://ironworksvenue.com'
    },
    // More Edinburgh
    {
        name: 'The Caves',
        city: 'Edinburgh',
        address: '8-10 Niddry Street South',
        postcode: 'EH1 1NS',
        capacity: 500,
        email: 'info@thecavesedinburgh.com',
        phone: '0131 557 8989',
        website: 'https://thecavesedinburgh.com'
    },
    {
        name: 'Summerhall',
        city: 'Edinburgh',
        address: '1 Summerhall',
        postcode: 'EH9 1PL',
        capacity: 200,
        email: 'info@summerhall.co.uk',
        phone: '0131 560 1580',
        website: 'https://summerhall.co.uk'
    },
    {
        name: 'The Mash House',
        city: 'Edinburgh',
        address: '37 Guthrie Street',
        postcode: 'EH1 1JG',
        capacity: 500,
        email: 'info@themashhouse.co.uk',
        phone: '0131 225 6338',
        website: 'https://themashhouse.co.uk'
    },
    // More Glasgow
    {
        name: 'The Classic Grand',
        city: 'Glasgow',
        address: '18 Jamaica Street',
        postcode: 'G1 4QD',
        capacity: 1000,
        email: 'info@theclassicgrand.com',
        phone: '0141 847 0820',
        website: 'https://theclassicgrand.com'
    },
    {
        name: 'Stereo',
        city: 'Glasgow',
        address: '22-28 Renfield Lane',
        postcode: 'G2 5AR',
        capacity: 300,
        email: 'info@stereocafebar.com',
        phone: '0141 222 2254',
        website: 'https://stereocafebar.com'
    },
    {
        name: 'Nice N Sleazy',
        city: 'Glasgow',
        address: '421 Sauchiehall Street',
        postcode: 'G2 3LG',
        capacity: 200,
        email: 'info@nicensleazy.com',
        phone: '0141 333 0900',
        website: 'https://nicensleazy.com'
    },
    {
        name: 'The Admiral Bar',
        city: 'Glasgow',
        address: '72A Waterloo Street',
        postcode: 'G2 7DA',
        capacity: 150,
        email: 'info@admiralglasgow.com',
        phone: '0141 248 4970',
        website: 'https://admiralglasgow.com'
    },
    {
        name: 'The Hug and Pint',
        city: 'Glasgow',
        address: '171 Great Western Road',
        postcode: 'G4 9AW',
        capacity: 100,
        email: 'info@thehugandpint.com',
        phone: '0141 331 1901',
        website: 'https://thehugandpint.com'
    },
    // More Aberdeen
    {
        name: 'The Blue Lamp',
        city: 'Aberdeen',
        address: '121 Gallowgate',
        postcode: 'AB25 1BU',
        capacity: 250,
        email: 'info@thebluelamp.co.uk',
        phone: '01224 647472',
        website: 'https://thebluelamp.co.uk'
    },
    // Ayrshire
    {
        name: 'The Gaiety Theatre',
        city: 'Ayr',
        address: 'Carrick Street',
        postcode: 'KA7 1NU',
        capacity: 600,
        email: 'info@thegaiety.co.uk',
        phone: '01292 288235',
        website: 'https://thegaiety.co.uk'
    },
    // Fife
    {
        name: 'The Lemon Tree',
        city: 'Kirkcaldy',
        address: '17 Whytescauseway',
        postcode: 'KY1 1XF',
        capacity: 150,
        email: 'info@lemontreekir kcaldy.co.uk',
        phone: '01592 583302',
        website: 'https://lemontreekirkcaldy.co.uk'
    },
    // Paisley
    {
        name: 'Paisley Town Hall',
        city: 'Paisley',
        address: 'Abbey Close',
        postcode: 'PA1 1JF',
        capacity: 1000,
        email: 'townhall@renfrewshire.gov.uk',
        phone: '0300 300 0300',
        website: 'https://paisleytownhall.co.uk'
    },
    // Falkirk
    {
        name: 'The Falkirk Stadium',
        city: 'Falkirk',
        address: 'Westfield',
        postcode: 'FK2 9DX',
        capacity: 8000,
        email: 'info@falkirkfc.co.uk',
        phone: '01324 624121',
        website: 'https://falkirkfc.co.uk'
    },
    // Kilmarnock
    {
        name: 'The Palace Theatre',
        city: 'Kilmarnock',
        address: 'Green Street',
        postcode: 'KA1 3BH',
        capacity: 500,
        email: 'info@thepalacekillarnock.co.uk',
        phone: '01563 525887',
        website: 'https://thepalacekilmarnock.co.uk'
    },
    // Greenock
    {
        name: 'The Beacon Arts Centre',
        city: 'Greenock',
        address: 'Custom House Quay',
        postcode: 'PA15 1EW',
        capacity: 400,
        email: 'info@beaconartscentre.co.uk',
        phone: '01475 723723',
        website: 'https://beaconartscentre.co.uk'
    },
    // Dumfries
    {
        name: 'The Stove Network',
        city: 'Dumfries',
        address: '100 High Street',
        postcode: 'DG1 2BA',
        capacity: 100,
        email: 'hello@thestove.org',
        phone: '01387 248638',
        website: 'https://thestove.org'
    },
    // Livingston
    {
        name: 'Howden Park Centre',
        city: 'Livingston',
        address: 'Almondvale Boulevard',
        postcode: 'EH54 6QX',
        capacity: 400,
        email: 'howdenparkcentre@westlothian.gov.uk',
        phone: '01506 497222',
        website: 'https://howdenparkcentre.co.uk'
    },
    // Bathgate
    {
        name: 'Regal Community Theatre',
        city: 'Bathgate',
        address: 'North Bridge Street',
        postcode: 'EH48 4PP',
        capacity: 300,
        email: 'info@regaltheatre.co.uk',
        phone: '01506 633003',
        website: 'https://regaltheatre.co.uk'
    },
    // Motherwell
    {
        name: 'Motherwell Concert Hall',
        city: 'Motherwell',
        address: 'Civic Centre',
        postcode: 'ML1 1TW',
        capacity: 600,
        email: 'concerthall@culturenl.co.uk',
        phone: '01698 403120',
        website: 'https://culturenl.co.uk'
    },
    // Hamilton
    {
        name: 'Hamilton Town House',
        city: 'Hamilton',
        address: '102 Cadzow Street',
        postcode: 'ML3 6HH',
        capacity: 400,
        email: 'townhouse@southlanarkshire.gov.uk',
        phone: '01698 452382',
        website: 'https://hamiltontownhouse.co.uk'
    },
    // Coatbridge
    {
        name: 'The Time Capsule',
        city: 'Coatbridge',
        address: '100 Buchanan Street',
        postcode: 'ML5 1DL',
        capacity: 500,
        email: 'timecapsule@culturenl.co.uk',
        phone: '01236 449572',
        website: 'https://culturenl.co.uk'
    },
    // Cumbernauld
    {
        name: 'Cumbernauld Theatre',
        city: 'Cumbernauld',
        address: 'Kildrum Road',
        postcode: 'G67 2BN',
        capacity: 250,
        email: 'info@cumbernauldtheatre.co.uk',
        phone: '01236 732887',
        website: 'https://cumbernauldtheatre.co.uk'
    },
    // East Kilbride
    {
        name: 'The Village Theatre',
        city: 'East Kilbride',
        address: 'Olympia Shopping Centre',
        postcode: 'G74 1PG',
        capacity: 500,
        email: 'info@villagetheatre.co.uk',
        phone: '01355 261300',
        website: 'https://villagetheatre.co.uk'
    }
];

async function updateVenueInfo() {
    const client = await pool.connect();
    try {
        console.log('📝 Updating venue information (Batch 4 - BIG BATCH!)...\n');
        console.log(`Processing ${VENUE_UPDATES.length} venues...\n`);

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
        console.log(`\n✅ Batch 4 complete!`);
        console.log(`   Updated: ${updated} venues`);
        console.log(`   Not found: ${notFound} venues`);
        console.log(`\n📊 Total venues populated so far: ${14 + updated}`);
        console.log(`   Progress: ${Math.round((14 + updated) / 100 * 100)}%`);

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
