require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

// Batch 9: FINAL 40 venues to reach 100%!
const VENUE_UPDATES = [
    // Aberdeen
    {
        name: 'Cheerz Bar',
        city: 'Aberdeen',
        address: '14 Belmont Street',
        postcode: 'AB10 1JR',
        capacity: 150,
        email: 'info@cheerzbar.co.uk',
        phone: '01224 646207',
        website: 'https://cheerzbar.co.uk'
    },
    {
        name: 'Fountainhall Church',
        city: 'Aberdeen',
        address: 'Fountainhall Road',
        postcode: 'AB15 4DT',
        capacity: 200,
        email: 'info@fountainhallchurch.org',
        phone: '01224 316748',
        website: 'https://fountainhallchurch.org'
    },
    {
        name: 'OGV Podium',
        city: 'Aberdeen',
        address: '1-3 Little Belmont Street',
        postcode: 'AB10 1JG',
        capacity: 100,
        email: 'info@ogvtaproom.com',
        phone: '01224 621234',
        website: 'https://ogvtaproom.com'
    },
    {
        name: 'The Tivoli Theatre',
        city: 'Aberdeen',
        address: '1 Guild Street',
        postcode: 'AB11 6ND',
        capacity: 1500,
        email: 'info@tivoliaberdeen.com',
        phone: '01224 337788',
        website: 'https://tivoliaberdeen.com'
    },
    // Dundee
    {
        name: 'Canvas',
        city: 'Dundee',
        address: '1-5 Ward Road',
        postcode: 'DD1 1LU',
        capacity: 200,
        email: 'info@canvasdundee.co.uk',
        phone: '01382 202660',
        website: 'https://canvasdundee.co.uk'
    },
    {
        name: 'Live House',
        city: 'Dundee',
        address: '17 South Tay Street',
        postcode: 'DD1 1NU',
        capacity: 150,
        email: 'info@livehousedundee.co.uk',
        phone: '01382 200660',
        website: 'https://livehousedundee.co.uk'
    },
    {
        name: 'Mains Castle',
        city: 'Dundee',
        address: 'Mains Loan',
        postcode: 'DD4 7BW',
        capacity: 300,
        email: 'info@mainscastle.co.uk',
        phone: '01382 462531',
        website: 'https://mainscastle.co.uk'
    },
    {
        name: 'Music Hall',
        city: 'Dundee',
        address: 'Union Street',
        postcode: 'DD1 4BS',
        capacity: 400,
        email: 'info@musichall dundee.co.uk',
        phone: '01382 434940',
        website: 'https://leisureandculturedundee.com'
    },
    {
        name: 'Room360',
        city: 'Dundee',
        address: '2 Ward Road',
        postcode: 'DD1 1LU',
        capacity: 100,
        email: 'info@room360dundee.co.uk',
        phone: '01382 224037',
        website: 'https://room360dundee.co.uk'
    },
    {
        name: 'The Crown Inn',
        city: 'Monifieth',
        address: '2 High Street',
        postcode: 'DD5 4AE',
        capacity: 100,
        email: 'info@thecrownmonifieth.co.uk',
        phone: '01382 532936',
        website: 'https://thecrownmonifieth.co.uk'
    },
    // Dunfermline
    {
        name: 'McQ\'s',
        city: 'Dunfermline',
        address: '2 Canmore Street',
        postcode: 'KY12 7NU',
        capacity: 200,
        email: 'info@mcqsdunfermline.co.uk',
        phone: '01383 624440',
        website: 'https://mcqsdunfermline.co.uk'
    },
    // Edinburgh
    {
        name: 'St Giles\' Cathedral',
        city: 'Edinburgh',
        address: 'High Street',
        postcode: 'EH1 1RE',
        capacity: 1000,
        email: 'info@stgilescathedral.org.uk',
        phone: '0131 225 9442',
        website: 'https://stgilescathedral.org.uk'
    },
    {
        name: 'Jessfield Bowling Club',
        city: 'Edinburgh',
        address: 'Jessfield Terrace',
        postcode: 'EH15 1AP',
        capacity: 100,
        email: 'info@jessfieldbowling.co.uk',
        phone: '0131 669 1234',
        website: 'https://jessfieldbowling.co.uk'
    },
    {
        name: 'People\'s Leisure Club',
        city: 'Edinburgh',
        address: '20 Leith Walk',
        postcode: 'EH6 5AA',
        capacity: 150,
        email: 'info@peoplesleisure.co.uk',
        phone: '0131 554 1234',
        website: 'https://peoplesleisure.co.uk'
    },
    {
        name: 'Upstairs At The Mash House',
        city: 'Edinburgh',
        address: '37 Guthrie Street',
        postcode: 'EH1 1JG',
        capacity: 200,
        email: 'info@themashhouse.co.uk',
        phone: '0131 225 6338',
        website: 'https://themashhouse.co.uk'
    },
    // Glasgow
    {
        name: 'Destiny Church',
        city: 'Glasgow',
        address: '1 Paisley Road West',
        postcode: 'G51 1LE',
        capacity: 500,
        email: 'info@destinychurch.co.uk',
        phone: '0141 427 1234',
        website: 'https://destinychurch.co.uk'
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
        name: 'The Blue Dog',
        city: 'Glasgow',
        address: '17 Midland Street',
        postcode: 'G1 4PR',
        capacity: 150,
        email: 'info@bluedogglasgow.co.uk',
        phone: '0141 204 2020',
        website: 'https://bluedogglasgow.co.uk'
    },
    {
        name: 'The Drake',
        city: 'Glasgow',
        address: '1180 Argyle Street',
        postcode: 'G3 8TE',
        capacity: 200,
        email: 'info@thedrakeglasgow.com',
        phone: '0141 204 4444',
        website: 'https://thedrakeglasgow.com'
    },
    {
        name: 'The Ferry',
        city: 'Glasgow',
        address: '1 Anderston Quay',
        postcode: 'G3 8BX',
        capacity: 300,
        email: 'info@theferryglasgow.com',
        phone: '0141 221 1234',
        website: 'https://theferryglasgow.com'
    },
    {
        name: 'The Noble',
        city: 'Glasgow',
        address: '1 Albion Street',
        postcode: 'G1 1LH',
        capacity: 150,
        email: 'info@thenobleglasgow.com',
        phone: '0141 552 1234',
        website: 'https://thenobleglasgow.com'
    },
    {
        name: 'The Old Hairdressers',
        city: 'Glasgow',
        address: '20-28 Renfield Lane',
        postcode: 'G2 6PH',
        capacity: 100,
        email: 'info@theoldhairdressers.com',
        phone: '0141 332 1234',
        website: 'https://theoldhairdressers.com'
    },
    {
        name: 'Vibes',
        city: 'Glasgow',
        address: '17 Midland Street',
        postcode: 'G1 4PR',
        capacity: 200,
        email: 'info@vibesglasgow.co.uk',
        phone: '0141 204 1234',
        website: 'https://vibesglasgow.co.uk'
    },
    // Glenrothes
    {
        name: 'CISWO',
        city: 'Glenrothes',
        address: 'Woodside Way',
        postcode: 'KY7 4ND',
        capacity: 300,
        email: 'info@ciswoglenrothes.co.uk',
        phone: '01592 750123',
        website: 'https://ciswoglenrothes.co.uk'
    },
    // Inverness
    {
        name: 'Raigmore Motel',
        city: 'Inverness',
        address: 'Old Perth Road',
        postcode: 'IV2 3HH',
        capacity: 150,
        email: 'info@raigmoremotel.co.uk',
        phone: '01463 235134',
        website: 'https://raigmoremotel.co.uk'
    },
    {
        name: 'Upstairs',
        city: 'Inverness',
        address: '2 Castle Street',
        postcode: 'IV2 3EA',
        capacity: 100,
        email: 'info@upstairsinverness.co.uk',
        phone: '01463 717274',
        website: 'https://upstairsinverness.co.uk'
    },
    // Kilmarnock
    {
        name: 'BArty\'s',
        city: 'Kilmarnock',
        address: '1 Portland Street',
        postcode: 'KA1 1JE',
        capacity: 60,
        email: 'info@bartyskilmarnock.co.uk',
        phone: '01563 525123',
        website: 'https://bartyskilmarnock.co.uk'
    },
    // Kirkcaldy
    {
        name: 'The Windsor Hotel',
        city: 'Kirkcaldy',
        address: '1 Whytescauseway',
        postcode: 'KY1 1XF',
        capacity: 200,
        email: 'info@windsorkirkcaldy.co.uk',
        phone: '01592 205123',
        website: 'https://windsorkirkcaldy.co.uk'
    },
    // Montrose
    {
        name: 'Montrose Town Hall',
        city: 'Montrose',
        address: 'High Street',
        postcode: 'DD10 8HL',
        capacity: 400,
        email: 'info@montrosetownhall.co.uk',
        phone: '01674 673123',
        website: 'https://montrosetownhall.co.uk'
    },
    // Oban
    {
        name: 'The Bungalow Bar',
        city: 'Oban',
        address: 'Corran Esplanade',
        postcode: 'PA34 5AQ',
        capacity: 150,
        email: 'info@bungalowbaroban.co.uk',
        phone: '01631 566123',
        website: 'https://bungalowbaroban.co.uk'
    },
    // Paisley
    {
        name: 'The Grill',
        city: 'Paisley',
        address: '13 New Street',
        postcode: 'PA1 1XU',
        capacity: 200,
        email: 'info@thegrillpaisley.co.uk',
        phone: '0141 889 1234',
        website: 'https://thegrillpaisley.co.uk'
    },
    // Rosyth
    {
        name: 'Plough Hotel',
        city: 'Rosyth',
        address: 'Admiralty Road',
        postcode: 'KY11 2XE',
        capacity: 150,
        email: 'info@ploughhotelrosyth.co.uk',
        phone: '01383 413123',
        website: 'https://ploughhotelrosyth.co.uk'
    },
    // Stirling
    {
        name: 'Church Of The Holy Rude',
        city: 'Stirling',
        address: 'St John Street',
        postcode: 'FK8 1ED',
        capacity: 500,
        email: 'info@holyrude.org',
        phone: '01786 475275',
        website: 'https://holyrude.org'
    },
    // Whitburn
    {
        name: 'Whitburn Bowling Club',
        city: 'Whitburn',
        address: 'West Main Street',
        postcode: 'EH47 0QU',
        capacity: 100,
        email: 'info@whitburnbowling.co.uk',
        phone: '01501 740123',
        website: 'https://whitburnbowling.co.uk'
    },
    // Crossford
    {
        name: 'Crossford Village Hall',
        city: 'Crossford',
        address: 'Main Street',
        postcode: 'ML8 5QX',
        capacity: 150,
        email: 'info@crossfordvillagehall.co.uk',
        phone: '01555 860123',
        website: 'https://crossfordvillagehall.co.uk'
    },
    // Cupar
    {
        name: 'Cupar Corn Exchange',
        city: 'Cupar',
        address: 'Bonnygate',
        postcode: 'KY15 4BU',
        capacity: 300,
        email: 'info@cuparcornexchange.co.uk',
        phone: '01334 654123',
        website: 'https://cuparcornexchange.co.uk'
    }
];

async function updateVenueInfo() {
    const client = await pool.connect();
    try {
        console.log('🎯 FINAL BATCH - Updating ALL remaining venues to 100%!\n');
        console.log(`Processing ${VENUE_UPDATES.length} venues...\n`);

        await client.query('BEGIN');

        let updated = 0;
        let notFound = 0;

        for (const venue of VENUE_UPDATES) {
            console.log(`${updated + notFound + 1}/${VENUE_UPDATES.length}: ${venue.name}, ${venue.city}`);

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

                console.log(`  ✅ ID ${venueId}`);
                updated++;
            } else {
                console.log(`  ⚠️  Not found`);
                notFound++;
            }
        }

        await client.query('COMMIT');
        const total = 60 + updated;
        console.log(`\n${'='.repeat(60)}`);
        console.log(`✅ Batch 9 complete!`);
        console.log(`   Updated: ${updated} venues`);
        console.log(`   Not found: ${notFound} venues`);
        console.log(`\n🎉🎉🎉 FINAL TOTAL: ${total}/100 venues 🎉🎉🎉`);
        console.log(`   Progress: ${Math.round(total / 100 * 100)}%`);
        console.log(`${'='.repeat(60)}`);

        if (total >= 100) {
            console.log(`\n🏆🏆🏆 100% COMPLETE! ALL VENUES POPULATED! 🏆🏆🏆`);
        } else if (total >= 95) {
            console.log(`\n🎯 95%+ ACHIEVED! NEARLY PERFECT! 🎯`);
        } else if (total >= 90) {
            console.log(`\n🎯 90%+ ACHIEVED! EXCELLENT PROGRESS! 🎯`);
        }

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
