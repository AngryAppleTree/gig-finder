require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkSneakyDuplicates() {
    const client = await pool.connect();
    try {
        console.log('🔍 Checking for Sneaky Pete\'s duplicates...\n');

        // Find duplicate events (same name, date, venue)
        const result = await client.query(`
            SELECT 
                e.name,
                e.date,
                v.name as venue_name,
                COUNT(*) as count,
                STRING_AGG(e.id::text, ', ') as event_ids,
                STRING_AGG(e.user_id, ', ') as user_ids
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE v.name ILIKE '%sneaky%'
            GROUP BY e.name, e.date, v.name
            HAVING COUNT(*) > 1
            ORDER BY e.date DESC, COUNT(*) DESC
        `);

        if (result.rows.length === 0) {
            console.log('✅ No duplicates found for Sneaky Pete\'s');
        } else {
            console.log(`❌ Found ${result.rows.length} duplicate event groups:\n`);
            result.rows.forEach((row, i) => {
                console.log(`${i + 1}. "${row.name}" on ${new Date(row.date).toLocaleDateString()}`);
                console.log(`   Venue: ${row.venue_name}`);
                console.log(`   Count: ${row.count} duplicates`);
                console.log(`   Event IDs: ${row.event_ids}`);
                console.log(`   User IDs: ${row.user_ids}`);
                console.log('');
            });

            console.log('\n💡 To fix, run: node scripts/merge-sneaky-duplicates.js');
        }

        // Also check total Sneaky Pete's events
        const total = await client.query(`
            SELECT COUNT(*) as total
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE v.name ILIKE '%sneaky%'
        `);

        console.log(`\n📊 Total Sneaky Pete's events in database: ${total.rows[0].total}`);

    } finally {
        client.release();
        await pool.end();
    }
}

checkSneakyDuplicates().catch(console.error);
