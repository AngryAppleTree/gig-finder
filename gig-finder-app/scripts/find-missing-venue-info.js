require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

// This script will search for venue information
// You'll need to manually review and approve the data before updating

async function searchVenueInfo() {
    const client = await pool.connect();
    try {
        console.log('🔍 Finding venues with missing information...\n');

        const result = await client.query(`
            SELECT id, name, city, address, postcode, capacity, email, website, phone
            FROM venues
            WHERE city IS NOT NULL
            ORDER BY city, name
        `);

        console.log(`Found ${result.rows.length} venues\n`);
        console.log('Venues missing information:\n');

        const missingInfo = [];

        for (const venue of result.rows) {
            const missing = [];
            if (!venue.postcode) missing.push('postcode');
            if (!venue.capacity) missing.push('capacity');
            if (!venue.email) missing.push('email');
            if (!venue.website) missing.push('website');
            if (!venue.phone) missing.push('phone');
            if (!venue.address || venue.address === 'Unknown') missing.push('address');

            if (missing.length > 0) {
                missingInfo.push({
                    id: venue.id,
                    name: venue.name,
                    city: venue.city,
                    missing: missing
                });
            }
        }

        console.log(`${missingInfo.length} venues need information:\n`);

        missingInfo.forEach((v, i) => {
            console.log(`${i + 1}. ${v.name}, ${v.city}`);
            console.log(`   Missing: ${v.missing.join(', ')}`);
            console.log(`   Search: https://www.google.com/search?q=${encodeURIComponent(v.name + ' ' + v.city + ' venue contact')}`);
            console.log('');
        });

        console.log('\n📝 Next steps:');
        console.log('1. Search for each venue online');
        console.log('2. Create a CSV file with the data: venue_data.csv');
        console.log('3. Format: id,postcode,capacity,email,website,phone,address');
        console.log('4. Run: node scripts/import-venue-data.js');

    } finally {
        client.release();
        await pool.end();
    }
}

searchVenueInfo().catch(console.error);
