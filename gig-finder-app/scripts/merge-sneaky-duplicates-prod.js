require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function mergeSneakyDuplicates() {
    const client = await pool.connect();
    try {
        console.log('🔧 Merging Sneaky Pete\'s duplicate events in PRODUCTION...\n');

        // Find duplicates
        const duplicates = await client.query(`
            SELECT 
                e.name,
                e.date,
                v.name as venue_name,
                ARRAY_AGG(e.id ORDER BY e.id) as event_ids
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE v.name ILIKE '%sneaky%'
            GROUP BY e.name, e.date, v.name
            HAVING COUNT(*) > 1
        `);

        if (duplicates.rows.length === 0) {
            console.log('✅ No duplicates found in production');
            return;
        }

        let totalDeleted = 0;

        for (const dup of duplicates.rows) {
            const eventIds = dup.event_ids;
            const keepId = eventIds[0]; // Keep the first one
            const deleteIds = eventIds.slice(1); // Delete the rest

            console.log(`📝 "${dup.name}" on ${new Date(dup.date).toLocaleDateString()}`);
            console.log(`   Keeping ID: ${keepId}`);
            console.log(`   Deleting IDs: ${deleteIds.join(', ')}`);

            // Delete duplicates
            for (const id of deleteIds) {
                await client.query('DELETE FROM events WHERE id = $1', [id]);
                totalDeleted++;
            }
            console.log('   ✅ Deleted\n');
        }

        console.log(`\n✅ Removed ${totalDeleted} duplicate events from PRODUCTION`);
        console.log(`📊 Processed ${duplicates.rows.length} duplicate groups`);

    } finally {
        client.release();
        await pool.end();
    }
}

mergeSneakyDuplicates().catch(console.error);
