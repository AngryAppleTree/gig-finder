require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

// Venue data found from web search
const VENUE_UPDATES = [
    {
        id: 100,
        name: 'Beat Generator',
        city: 'Dundee',
        address: '70 North Lindsay Street',
        postcode: 'DD1 1PS',
        capacity: 400,
        email: 'bookings@beatgenerator.co.uk',
        phone: '01382 229226',
        website: 'https://beatgenerator.co.uk'
    },
    {
        id: 10,
        name: 'Bannermans Edinburgh',
        city: 'Edinburgh',
        address: '212 Cowgate',
        postcode: 'EH1 1NQ',
        capacity: 200,
        email: 'info@bannermanslive.co.uk',
        phone: '0131 556 3254',
        website: 'https://bannermanslive.co.uk'
    }
];

async function updateVenueInfo() {
    const client = await pool.connect();
    try {
        console.log('📝 Updating venue information from web search...\n');

        await client.query('BEGIN');

        for (const venue of VENUE_UPDATES) {
            console.log(`Updating: ${venue.name}, ${venue.city}`);

            await client.query(`
                UPDATE venues
                SET 
                    address = $1,
                    postcode = $2,
                    capacity = $3,
                    email = $4,
                    phone = $5,
                    website = $6
                WHERE id = $7
            `, [
                venue.address,
                venue.postcode,
                venue.capacity,
                venue.email,
                venue.phone,
                venue.website,
                venue.id
            ]);

            console.log(`  ✅ Updated:`);
            console.log(`     Address: ${venue.address}`);
            console.log(`     Postcode: ${venue.postcode}`);
            console.log(`     Capacity: ${venue.capacity}`);
            console.log(`     Email: ${venue.email}`);
            console.log(`     Phone: ${venue.phone}`);
            console.log(`     Website: ${venue.website}`);
            console.log('');
        }

        await client.query('COMMIT');
        console.log(`✅ Successfully updated ${VENUE_UPDATES.length} venues!`);

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
