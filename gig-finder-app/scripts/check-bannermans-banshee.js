require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkSpecificVenues() {
    const client = await pool.connect();
    try {
        console.log('🔍 Checking for Bannerman\'s and Banshee Labyrinth duplicates...\n');

        // Check Bannerman's
        console.log('═'.repeat(80));
        console.log('BANNERMAN\'S VENUES:');
        console.log('═'.repeat(80));
        const bannermans = await client.query(`
            SELECT id, name, city, postcode, capacity
            FROM venues
            WHERE LOWER(name) LIKE '%bannerman%'
            ORDER BY name
        `);

        if (bannermans.rows.length === 0) {
            console.log('❌ No Bannerman\'s venues found\n');
        } else {
            bannermans.rows.forEach(v => {
                console.log(`ID: ${v.id.toString().padEnd(4)} | Name: "${v.name}" | City: ${v.city || 'N/A'} | Postcode: ${v.postcode || 'N/A'} | Capacity: ${v.capacity || 'N/A'}`);
            });

            // Check event counts
            const bannerIds = bannermans.rows.map(v => v.id);
            const bannerEvents = await client.query(`
                SELECT venue_id, COUNT(*) as event_count
                FROM events
                WHERE venue_id = ANY($1)
                GROUP BY venue_id
            `, [bannerIds]);

            console.log('\nEvent counts:');
            bannerEvents.rows.forEach(row => {
                const venue = bannermans.rows.find(v => v.id === row.venue_id);
                console.log(`   - "${venue.name}" (ID: ${venue.id}): ${row.event_count} events`);
            });
            console.log('');
        }

        // Check Banshee Labyrinth
        console.log('═'.repeat(80));
        console.log('BANSHEE LABYRINTH VENUES:');
        console.log('═'.repeat(80));
        const banshee = await client.query(`
            SELECT id, name, city, postcode, capacity
            FROM venues
            WHERE LOWER(name) LIKE '%banshee%'
            ORDER BY name
        `);

        if (banshee.rows.length === 0) {
            console.log('❌ No Banshee Labyrinth venues found\n');
        } else {
            banshee.rows.forEach(v => {
                console.log(`ID: ${v.id.toString().padEnd(4)} | Name: "${v.name}" | City: ${v.city || 'N/A'} | Postcode: ${v.postcode || 'N/A'} | Capacity: ${v.capacity || 'N/A'}`);
            });

            // Check event counts
            const bansheeIds = banshee.rows.map(v => v.id);
            const bansheeEvents = await client.query(`
                SELECT venue_id, COUNT(*) as event_count
                FROM events
                WHERE venue_id = ANY($1)
                GROUP BY venue_id
            `, [bansheeIds]);

            console.log('\nEvent counts:');
            bansheeEvents.rows.forEach(row => {
                const venue = banshee.rows.find(v => v.id === row.venue_id);
                console.log(`   - "${venue.name}" (ID: ${venue.id}): ${row.event_count} events`);
            });
            console.log('');
        }

        console.log('═'.repeat(80));
        console.log('\n✅ Check complete!\n');

    } finally {
        client.release();
        await pool.end();
    }
}

checkSpecificVenues().catch(console.error);
