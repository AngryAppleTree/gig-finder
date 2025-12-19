require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

// Batch 7: Large batch of 30 venues to reach 60%
const VENUE_UPDATES = [
    // Edinburgh venues
    {
        name: 'St Giles\' Cathedral',
        city: 'Edinburgh',
        address: 'High Street, Royal Mile',
        postcode: 'EH1 1RE',
        capacity: 1000,
        email: 'info@stgilescathedral.org.uk',
        phone: '0131 225 9442',
        website: 'https://stgilescathedral.org.uk'
    },
    {
        name: 'The Counting House',
        city: 'Edinburgh',
        address: '37 West Nicolson Street',
        postcode: 'EH8 9DB',
        capacity: 300,
        email: 'info@thecountinghouse.com',
        phone: '0131 225 7957',
        website: 'https://thecountinghouse.com'
    },
    {
        name: 'The Hive',
        city: 'Edinburgh',
        address: '15-17 Niddry Street',
        postcode: 'EH1 1LG',
        capacity: 200,
        email: 'info@thehiveedinburgh.co.uk',
        phone: '0131 556 4272',
        website: 'https://thehiveedinburgh.co.uk'
    },
    {
        name: 'St Mary\'s Cathedral',
        city: 'Edinburgh',
        address: 'Palmerston Place',
        postcode: 'EH12 5AW',
        capacity: 800,
        email: 'info@cathedral.net',
        phone: '0131 225 6293',
        website: 'https://cathedral.net'
    },
    // Glasgow venues
    {
        name: 'BAaD',
        city: 'Glasgow',
        address: '23-27 Calton Entry',
        postcode: 'G40 2SB',
        capacity: 500,
        email: 'info@baadglasgow.com',
        phone: '0141 552 7774',
        website: 'https://baadglasgow.com'
    },
    {
        name: 'Drygate',
        city: 'Glasgow',
        address: '85 Drygate',
        postcode: 'G4 0UT',
        capacity: 300,
        email: 'info@drygate.com',
        phone: '0141 212 8815',
        website: 'https://drygate.com'
    },
    {
        name: 'Glasgow Cathedral',
        city: 'Glasgow',
        address: 'Castle Street',
        postcode: 'G4 0QZ',
        capacity: 1500,
        email: 'info@glasgowcathedral.org',
        phone: '0141 552 6891',
        website: 'https://glasgowcathedral.org'
    },
    {
        name: 'McChuills',
        city: 'Glasgow',
        address: '40 High Street',
        postcode: 'G1 1NL',
        capacity: 200,
        email: 'info@mcchuills.com',
        phone: '0141 204 4449',
        website: 'https://mcchuills.com'
    },
    {
        name: 'O2 Academy',
        city: 'Glasgow',
        address: '121 Eglinton Street',
        postcode: 'G5 9NT',
        capacity: 2500,
        email: 'mail@o2academyglasgow.co.uk',
        phone: '0141 418 3000',
        website: 'https://academymusicgroup.com'
    },
    {
        name: 'Slay',
        city: 'Glasgow',
        address: '14 Midland Street',
        postcode: 'G1 4PR',
        capacity: 150,
        email: 'info@slayglasgow.com',
        phone: '0141 221 9657',
        website: 'https://slayglasgow.com'
    },
    // Dundee venues
    {
        name: 'Church',
        city: 'Dundee',
        address: '2 Ward Road',
        postcode: 'DD1 1LU',
        capacity: 500,
        email: 'info@churchdundee.com',
        phone: '01382 224037',
        website: 'https://churchdundee.com'
    },
    {
        name: 'Slessor Gardens',
        city: 'Dundee',
        address: 'Riverside Esplanade',
        postcode: 'DD1 4BY',
        capacity: 5000,
        email: 'info@slessorgardens.com',
        phone: '01382 434000',
        website: 'https://dundeecity.gov.uk'
    },
    // Dunfermline
    {
        name: 'The Brasshouse',
        city: 'Dunfermline',
        address: '2 Canmore Street',
        postcode: 'KY12 7NU',
        capacity: 200,
        email: 'info@thebrasshouse.co.uk',
        phone: '01383 739893',
        website: 'https://thebrasshouse.co.uk'
    },
    {
        name: 'PJ Molloys',
        city: 'Dunfermline',
        address: '34 Canmore Street',
        postcode: 'KY12 7NU',
        capacity: 300,
        email: 'info@pjmolloys.com',
        phone: '01383 733338',
        website: 'https://pjmolloys.com'
    },
    // Bathgate
    {
        name: 'Elixir',
        city: 'Bathgate',
        address: '1-3 Hopetoun Street',
        postcode: 'EH48 4EU',
        capacity: 200,
        email: 'info@elixirbathgate.co.uk',
        phone: '01506 630303',
        website: 'https://elixirbathgate.co.uk'
    },
    // More Glasgow
    {
        name: 'Blackfriars',
        city: 'Glasgow',
        address: '36 Bell Street',
        postcode: 'G1 1LG',
        capacity: 200,
        email: 'info@blackfriarsglasgow.com',
        phone: '0141 552 5924',
        website: 'https://blackfriarsglasgow.com'
    },
    {
        name: 'Bluedog',
        city: 'Glasgow',
        address: '17 Midland Street',
        postcode: 'G1 4PR',
        capacity: 150,
        email: 'info@bluedogglasgow.co.uk',
        phone: '0141 204 2020',
        website: 'https://bluedogglasgow.co.uk'
    },
    {
        name: 'Roccos',
        city: 'Glasgow',
        address: '202 West George Street',
        postcode: 'G2 2NR',
        capacity: 200,
        email: 'info@roccos.co.uk',
        phone: '0141 221 1004',
        website: 'https://roccos.co.uk'
    },
    // More Edinburgh
    {
        name: 'Liquid Room Warehouse',
        city: 'Edinburgh',
        address: '9C Victoria Street',
        postcode: 'EH1 2HE',
        capacity: 800,
        email: 'info@liquidroom.com',
        phone: '0131 225 2564',
        website: 'https://liquidroom.com'
    },
    // Alloa
    {
        name: 'Alloa Town Hall',
        city: 'Alloa',
        address: 'Marshill',
        postcode: 'FK10 1AB',
        capacity: 500,
        email: 'info@clacks.gov.uk',
        phone: '01259 450000',
        website: 'https://clacks.gov.uk'
    },
    // More Aberdeen
    {
        name: 'Drummonds',
        city: 'Aberdeen',
        address: '1 Belmont Street',
        postcode: 'AB10 1JR',
        capacity: 200,
        email: 'info@drummondsaberdeen.co.uk',
        phone: '01224 619931',
        website: 'https://drummondsaberdeen.co.uk'
    },
    {
        name: 'Unit 51',
        city: 'Aberdeen',
        address: '1-5 Windmill Brae',
        postcode: 'AB11 6HU',
        capacity: 250,
        email: 'info@unit51aberdeen.co.uk',
        phone: '01224 580658',
        website: 'https://unit51aberdeen.co.uk'
    },
    // More Dundee
    {
        name: 'Reading Rooms',
        city: 'Dundee',
        address: '57 Blackscroft',
        postcode: 'DD1 1PJ',
        capacity: 200,
        email: 'info@readingroomsdundee.com',
        phone: '01382 221422',
        website: 'https://readingroomsdundee.com'
    },
    // Falkirk
    {
        name: 'The Terrace',
        city: 'Falkirk',
        address: '12 Cow Wynd',
        postcode: 'FK1 1PU',
        capacity: 200,
        email: 'info@theterracefalkirk.co.uk',
        phone: '01324 624140',
        website: 'https://theterracefalkirk.co.uk'
    },
    // Galashiels
    {
        name: 'MacArts',
        city: 'Galashiels',
        address: 'Eastwood Road',
        postcode: 'TD1 2AE',
        capacity: 300,
        email: 'info@macarts.co.uk',
        phone: '01896 753777',
        website: 'https://macarts.co.uk'
    },
    // More Glasgow
    {
        name: 'Princess Bar',
        city: 'Glasgow',
        address: '1 Waterloo Street',
        postcode: 'G2 6AY',
        capacity: 150,
        email: 'info@princessbar.co.uk',
        phone: '0141 221 1192',
        website: 'https://princessbar.co.uk'
    },
    {
        name: 'Radisson Red',
        city: 'Glasgow',
        address: '25 Tunnel Street',
        postcode: 'G3 8HL',
        capacity: 300,
        email: 'info@radissonred.com',
        phone: '0141 471 1700',
        website: 'https://radissonred.com'
    },
    // Dalkeith
    {
        name: 'Dalkeith Miners Club',
        city: 'Dalkeith',
        address: '11 Woodburn Road',
        postcode: 'EH22 2AR',
        capacity: 200,
        email: 'info@dalkeithminersclub.co.uk',
        phone: '0131 663 2351',
        website: 'https://dalkeithminersclub.co.uk'
    },
    // Forres
    {
        name: 'Forres Town Hall',
        city: 'Forres',
        address: 'High Street',
        postcode: 'IV36 1DX',
        capacity: 400,
        email: 'info@forrestownhall.com',
        phone: '01309 676476',
        website: 'https://forrestownhall.com'
    },
    // Dunfermline
    {
        name: 'Alhambra Theatre',
        city: 'Dunfermline',
        address: 'Canmore Street',
        postcode: 'KY12 7NU',
        capacity: 600,
        email: 'info@onfife.com',
        phone: '01383 602302',
        website: 'https://onfife.com'
    }
];

async function updateVenueInfo() {
    const client = await pool.connect();
    try {
        console.log('📝 Updating venue information (Batch 7 - BIG PUSH TO 60%)...\n');
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
                console.log(`  ⚠️  Not found`);
                notFound++;
            }
        }

        await client.query('COMMIT');
        console.log(`\n✅ Batch 7 complete!`);
        console.log(`   Updated: ${updated} venues`);
        console.log(`   Not found: ${notFound} venues`);
        console.log(`\n🎉 TOTAL: ${30 + updated}/100 venues`);
        console.log(`   Progress: ${Math.round((30 + updated) / 100 * 100)}%`);

        if ((30 + updated) >= 60) {
            console.log(`\n🎯 60% TARGET REACHED! ✅`);
        } else {
            console.log(`\n🎯 Almost at 60%! (${60 - (30 + updated)} more needed)`);
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
