require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

// Batch 3: More venue data from web search
const VENUE_UPDATES = [
    {
        name: 'La Belle Angele',
        city: 'Edinburgh',
        address: '11 Hasties Close',
        postcode: 'EH1 1HJ',
        capacity: 600,
        email: 'matt@la-belleangele.com',
        phone: '0131 220 1161',
        website: 'https://la-belleangele.com'
    },
    {
        name: 'The Liquid Room',
        city: 'Edinburgh',
        address: '9C Victoria Street',
        postcode: 'EH1 2HE',
        capacity: 800,
        email: 'info@liquidroom.com',
        phone: '0131 225 2564',
        website: 'https://liquidroom.com'
    },
    {
        name: 'SWG3',
        city: 'Glasgow',
        address: '100 Eastvale Place',
        postcode: 'G3 8QG',
        capacity: 4000,
        email: 'info@swg3.tv',
        phone: '0141 337 1731',
        website: 'https://swg3.tv'
    },
    {
        name: 'O2 Academy Glasgow',
        city: 'Glasgow',
        address: '121 Eglinton Street',
        postcode: 'G5 9NT',
        capacity: 2500,
        email: 'mail@o2academyglasgow.co.uk',
        phone: '0141 418 3000',
        website: 'https://academymusicgroup.com'
    },
    {
        name: 'The Tunnels',
        city: 'Aberdeen',
        address: 'Carnegie\'s Brae',
        postcode: 'AB10 1BF',
        capacity: 300,
        email: 'info@thetunnels.co.uk',
        phone: '01224 211121',
        website: 'https://thetunnels.co.uk'
    }
];

async function updateVenueInfo() {
    const client = await pool.connect();
    try {
        console.log('📝 Updating venue information (Batch 3)...\n');

        await client.query('BEGIN');

        let updated = 0;
        let notFound = 0;

        for (const venue of VENUE_UPDATES) {
            console.log(`Searching for: ${venue.name}, ${venue.city}`);

            // Find venue by name and city (case insensitive, fuzzy match)
            const existing = await client.query(`
                SELECT id FROM venues 
                WHERE (name ILIKE $1 OR name ILIKE $2) 
                AND city ILIKE $3
            `, [venue.name, `%${venue.name}%`, venue.city]);

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
        console.log(`\n✅ Batch 3 complete!`);
        console.log(`   Updated: ${updated} venues`);
        console.log(`   Not found: ${notFound} venues`);
        console.log(`\n📊 Total venues populated so far: ${11 + updated}`);

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
