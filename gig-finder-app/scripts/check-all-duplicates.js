require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkAllDuplicates() {
    const client = await pool.connect();
    try {
        console.log('🔍 Checking for ALL duplicate events...\n');

        // Find all duplicates
        const result = await client.query(`
            SELECT 
                e.name,
                MIN(e.date) as date,
                v.name as venue_name,
                COUNT(*) as count,
                ARRAY_AGG(e.id ORDER BY e.id) as event_ids,
                ARRAY_AGG(e.user_id ORDER BY e.id) as user_ids,
                ARRAY_AGG(TO_CHAR(e.date, 'HH24:MI') ORDER BY e.id) as times
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            GROUP BY e.name, DATE(e.date), v.name
            HAVING COUNT(*) > 1
            ORDER BY COUNT(*) DESC, MIN(e.date) DESC
        `);

        if (result.rows.length === 0) {
            console.log('✅ No duplicates found');
        } else {
            console.log(`❌ Found ${result.rows.length} duplicate event groups:\n`);

            let totalDupes = 0;
            result.rows.forEach((row, i) => {
                const dupeCount = row.count - 1;
                totalDupes += dupeCount;

                console.log(`${i + 1}. "${row.name}" on ${new Date(row.date).toLocaleDateString()}`);
                console.log(`   Venue: ${row.venue_name}`);
                console.log(`   Count: ${row.count} copies (${dupeCount} duplicates)`);
                console.log(`   Event IDs: ${row.event_ids.join(', ')}`);
                console.log(`   User IDs: ${row.user_ids.join(', ')}`);
                console.log(`   Times: ${row.times.join(', ')}`);

                // Check if any have 00:00 time
                const hasZeroTime = row.times.some(t => t === '00:00');
                if (hasZeroTime) {
                    console.log(`   ⚠️  Contains 00:00 time - likely from manual entry or scraper without time`);
                }
                console.log('');
            });

            console.log(`\n📊 Total duplicate events to remove: ${totalDupes}`);
            console.log(`💡 To fix, run: node scripts/merge-all-duplicates.js`);
        }

        // Check source breakdown
        console.log('\n📊 Event source breakdown:');
        const sources = await client.query(`
            SELECT 
                CASE 
                    WHEN user_id LIKE 'user_%' THEN 'manual'
                    WHEN user_id LIKE 'scraper_%' THEN user_id
                    ELSE 'unknown'
                END as source,
                COUNT(*) as count
            FROM events
            GROUP BY source
            ORDER BY count DESC
        `);

        sources.rows.forEach(row => {
            console.log(`  ${row.source}: ${row.count} events`);
        });

    } finally {
        client.release();
        await pool.end();
    }
}

checkAllDuplicates().catch(console.error);
