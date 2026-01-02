const { Pool } = require('pg');

// Define which venues to keep and which to remove
const mergePlan = [
    { keep: 3, remove: 23 },   // Keep "Leith Depot", remove "Leith Depot Bar"
    { keep: 26, remove: 37 },  // Keep "The Liquid Room", remove "Liquid Room Warehouse"
    { keep: 9, remove: 104 },  // Keep "The Mash House", remove "Upstairs At The Mash House"
    { keep: 83, remove: 85 },  // Keep "The Tunnels", remove "Tunnels Aberdeen"
];

async function mergeDuplicateVenues() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('Merging duplicate venues...\n');

        for (const plan of mergePlan) {
            // Get venue names for logging
            const keepVenue = await pool.query('SELECT name FROM venues WHERE id = $1', [plan.keep]);
            const removeVenue = await pool.query('SELECT name FROM venues WHERE id = $1', [plan.remove]);

            console.log(`Merging "${removeVenue.rows[0].name}" (ID ${plan.remove}) into "${keepVenue.rows[0].name}" (ID ${plan.keep})...`);

            // Update all events pointing to the removed venue
            const updateResult = await pool.query(
                'UPDATE events SET venue_id = $1 WHERE venue_id = $2 RETURNING id',
                [plan.keep, plan.remove]
            );
            console.log(`  Updated ${updateResult.rows.length} events`);

            // Delete the duplicate venue
            await pool.query('DELETE FROM venues WHERE id = $1', [plan.remove]);
            console.log(`  Deleted venue ID ${plan.remove}\n`);
        }

        console.log('✅ Merge complete!\n');

        // Show final count
        const venueCount = await pool.query('SELECT COUNT(*) FROM venues');
        console.log(`Total venues remaining: ${venueCount.rows[0].count}`);

    } catch (error) {
        console.error('Error merging venues:', error);
    } finally {
        await pool.end();
    }
}

mergeDuplicateVenues();
