require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkBannermans() {
    const client = await pool.connect();
    try {
        console.log('🔍 Checking Bannerman\'s venues...\n');

        const result = await client.query(`
            SELECT 
                v.id,
                v.name,
                v.city,
                v.address,
                v.postcode,
                COUNT(e.id) as event_count
            FROM venues v
            LEFT JOIN events e ON e.venue_id = v.id
            WHERE v.name ILIKE '%bannerman%'
            GROUP BY v.id, v.name, v.city, v.address, v.postcode
            ORDER BY v.city, v.name
        `);

        if (result.rows.length === 0) {
            console.log('❌ No Bannerman\'s venues found');
        } else {
            console.log(`Found ${result.rows.length} Bannerman's venue(s):\n`);
            result.rows.forEach((venue, i) => {
                console.log(`${i + 1}. ${venue.name}`);
                console.log(`   ID: ${venue.id}`);
                console.log(`   City: ${venue.city || 'Unknown'}`);
                console.log(`   Address: ${venue.address || 'Unknown'}`);
                console.log(`   Postcode: ${venue.postcode || 'Unknown'}`);
                console.log(`   Events: ${venue.event_count}`);
                console.log('');
            });

            // Check if Biggar one exists
            const biggarVenue = result.rows.find(v => v.city && v.city.toLowerCase().includes('biggar'));
            if (biggarVenue) {
                console.log('⚠️  ISSUE: Found Bannerman\'s in Biggar');
                console.log('   This appears to be incorrect - no Bannerman\'s exists in Biggar');
                console.log(`   Venue ID to delete/update: ${biggarVenue.id}`);
                console.log(`   Events using this venue: ${biggarVenue.event_count}`);
            }
        }

    } finally {
        client.release();
        await pool.end();
    }
}

checkBannermans().catch(console.error);
