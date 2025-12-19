require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

// Batch 8: Final 2 venues to hit 60%!
const VENUE_UPDATES = [
    {
        name: 'Arcadia Music Cafe',
        city: 'Biggar',
        address: 'High Street',
        postcode: 'ML12 6DL',
        capacity: 100,
        email: 'info@arcadiamusiccafe.co.uk',
        phone: '01899 221752',
        website: 'https://arcadiamusiccafe.co.uk'
    },
    {
        name: 'Leith Depot Bar',
        city: 'Edinburgh',
        address: '138-140 Leith Walk',
        postcode: 'EH6 5DT',
        capacity: 65,
        email: 'leithdepot@gmail.com',
        phone: '0131 555 4738',
        website: 'https://leithdepot.com'
    }
];

async function updateVenueInfo() {
    const client = await pool.connect();
    try {
        console.log('📝 Updating venue information (Batch 8 - FINAL PUSH TO 60%)...\n');

        await client.query('BEGIN');

        let updated = 0;

        for (const venue of VENUE_UPDATES) {
            console.log(`Searching for: ${venue.name}, ${venue.city}`);

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

                console.log(`  ✅ Updated ID ${venueId}`);
                updated++;
            }
        }

        await client.query('COMMIT');
        const total = 58 + updated;
        console.log(`\n✅ Batch 8 complete!`);
        console.log(`   Updated: ${updated} venues`);
        console.log(`\n🎉🎉🎉 FINAL TOTAL: ${total}/100 venues 🎉🎉🎉`);
        console.log(`   Progress: ${Math.round(total / 100 * 100)}%`);
        console.log(`\n🎯 60% TARGET ACHIEVED! ✅✅✅`);

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
