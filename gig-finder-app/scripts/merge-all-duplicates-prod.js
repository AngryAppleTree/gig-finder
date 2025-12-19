require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function mergeAllDuplicates() {
    const client = await pool.connect();
    try {
        console.log('🔧 Merging ALL duplicate events in PRODUCTION (keeping better data)...\n');

        // Find all duplicates
        const duplicates = await client.query(`
            SELECT 
                e.name,
                DATE(e.date) as event_date,
                v.name as venue_name,
                ARRAY_AGG(e.id ORDER BY e.id) as event_ids,
                ARRAY_AGG(TO_CHAR(e.date, 'HH24:MI') ORDER BY e.id) as times
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            GROUP BY e.name, DATE(e.date), v.name
            HAVING COUNT(*) > 1
        `);

        if (duplicates.rows.length === 0) {
            console.log('✅ No duplicates found in production');
            return;
        }

        let totalDeleted = 0;

        for (const dup of duplicates.rows) {
            const eventIds = dup.event_ids;
            const times = dup.times;

            console.log(`📝 "${dup.name.substring(0, 60)}..." on ${new Date(dup.event_date).toLocaleDateString()}`);
            console.log(`   Venue: ${dup.venue_name}`);
            console.log(`   Event IDs: ${eventIds.join(', ')}`);
            console.log(`   Times: ${times.join(', ')}`);

            // Smart selection: prefer non-00:00 times
            let keepId;
            let deleteIds = [];

            // Find first event with non-00:00 time
            const goodTimeIndex = times.findIndex(t => t !== '00:00');
            if (goodTimeIndex !== -1) {
                keepId = eventIds[goodTimeIndex];
                deleteIds = eventIds.filter((id, i) => i !== goodTimeIndex);
                console.log(`   ✅ Keeping ID ${keepId} (has time: ${times[goodTimeIndex]})`);
            } else {
                // All have 00:00, just keep the first
                keepId = eventIds[0];
                deleteIds = eventIds.slice(1);
                console.log(`   ✅ Keeping ID ${keepId} (first one, all have 00:00)`);
            }

            console.log(`   🗑️  Deleting IDs: ${deleteIds.join(', ')}`);

            // Delete duplicates
            for (const id of deleteIds) {
                await client.query('DELETE FROM events WHERE id = $1', [id]);
                totalDeleted++;
            }
            console.log('   ✅ Done\n');
        }

        console.log(`\n✅ Removed ${totalDeleted} duplicate events from PRODUCTION`);
        console.log(`📊 Processed ${duplicates.rows.length} duplicate groups`);

    } finally {
        client.release();
        await pool.end();
    }
}

mergeAllDuplicates().catch(console.error);
