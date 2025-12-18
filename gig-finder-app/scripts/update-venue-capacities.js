require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function updateVenues() {
    const client = await pool.connect();
    try {
        console.log('🔧 Updating venue capacities...\n');

        // First, check if fghjkl has events
        const eventsCheck = await client.query(
            'SELECT COUNT(*) FROM events WHERE venue_id = (SELECT id FROM venues WHERE name = $1)',
            ['fghjkl']
        );

        const eventCount = parseInt(eventsCheck.rows[0].count);

        if (eventCount > 0) {
            console.log(`⚠️  Found ${eventCount} event(s) linked to "fghjkl"`);
            console.log('   Setting venue_id to NULL for these events...');

            await client.query(
                'UPDATE events SET venue_id = NULL WHERE venue_id = (SELECT id FROM venues WHERE name = $1)',
                ['fghjkl']
            );
            console.log('   ✓ Events updated\n');
        }

        // Now delete fghjkl
        const deleteResult = await client.query(
            'DELETE FROM venues WHERE name = $1 RETURNING id, name',
            ['fghjkl']
        );

        if (deleteResult.rows.length > 0) {
            console.log(`✅ Deleted test venue: ${deleteResult.rows[0].name}\n`);
        } else {
            console.log('ℹ️  Venue "fghjkl" not found (already deleted?)\n');
        }

        // Update capacities
        const updates = [
            { name: 'The Banshee Labyrinth', capacity: 70 },
            { name: 'Leith Depot', capacity: 65 },
            { name: 'Stramash', capacity: 700 }
        ];

        console.log('📊 Updating capacities:');
        for (const update of updates) {
            const result = await client.query(
                'UPDATE venues SET capacity = $1 WHERE name = $2 RETURNING name, capacity',
                [update.capacity, update.name]
            );

            if (result.rows.length > 0) {
                console.log(`  ✓ ${result.rows[0].name}: ${result.rows[0].capacity}`);
            } else {
                console.log(`  ⚠️  ${update.name}: not found`);
            }
        }

        // Show final state
        console.log('\n✅ Final venue list:');
        const allVenues = await client.query(
            'SELECT name, city, capacity FROM venues ORDER BY name'
        );

        console.log('\nName | City | Capacity');
        console.log('-----|------|----------');
        allVenues.rows.forEach(v => {
            console.log(`${v.name} | ${v.city || '-'} | ${v.capacity}`);
        });

    } finally {
        client.release();
        await pool.end();
    }
}

updateVenues();
