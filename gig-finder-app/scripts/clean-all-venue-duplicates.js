const { Pool } = require('pg');

async function cleanAndMergeAllDuplicates() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('🧹 Starting comprehensive venue cleanup...\n');

        // Find all duplicate groups using normalization
        const duplicates = await pool.query(`
      WITH normalized_venues AS (
        SELECT 
          id,
          name,
          address,
          city,
          LOWER(
            REGEXP_REPLACE(
              REGEXP_REPLACE(
                REGEXP_REPLACE(
                  REGEXP_REPLACE(name, '^(upstairs\\s+(at\\s+)?)|(the\\s+)', '', 'i'),
                  '[^a-z0-9\\s]', '', 'g'
                ),
                '\\s+(and|n)\\s+', ' ', 'g'
              ),
              '\\s+(bar|pub|club|venue|hall|hotel|theatre|theater|lounge|room|warehouse)(\\s+(bar|pub|club|venue|hall|hotel|theatre|theater|lounge|room|warehouse))*$', '', 'i'
            )
          ) as normalized
        FROM venues
      )
      SELECT 
        normalized,
        array_agg(id ORDER BY id) as ids,
        array_agg(name ORDER BY id) as names,
        array_agg(address ORDER BY id) as addresses
      FROM normalized_venues
      GROUP BY normalized
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC, normalized
    `);

        if (duplicates.rows.length === 0) {
            console.log('✅ No duplicates found!\n');
            const count = await pool.query('SELECT COUNT(*) FROM venues');
            console.log(`Total venues: ${count.rows[0].count}`);
            await pool.end();
            return;
        }

        console.log(`Found ${duplicates.rows.length} groups of duplicates:\n`);

        let totalMerged = 0;

        for (const group of duplicates.rows) {
            const ids = group.ids;
            const names = group.names;
            const addresses = group.addresses;

            // Keep the first one (lowest ID), merge others into it
            const keepId = ids[0];
            const keepName = names[0];
            const removeIds = ids.slice(1);

            console.log(`📍 Merging group: "${group.normalized}"`);
            console.log(`   ✅ KEEP: ID ${keepId} - "${keepName}" (${addresses[0] || 'no address'})`);

            for (let i = 0; i < removeIds.length; i++) {
                console.log(`   ❌ MERGE: ID ${removeIds[i]} - "${names[i + 1]}" (${addresses[i + 1] || 'no address'})`);

                // Move all events to the kept venue
                const moved = await pool.query(
                    'UPDATE events SET venue_id = $1 WHERE venue_id = $2 RETURNING id',
                    [keepId, removeIds[i]]
                );

                if (moved.rows.length > 0) {
                    console.log(`      → Moved ${moved.rows.length} events`);
                }

                // Delete the duplicate
                await pool.query('DELETE FROM venues WHERE id = $1', [removeIds[i]]);
                totalMerged++;
            }
            console.log();
        }

        console.log(`✅ Cleanup complete!`);
        console.log(`   Merged ${totalMerged} duplicate venues\n`);

        const finalCount = await pool.query('SELECT COUNT(*) FROM venues');
        console.log(`Final venue count: ${finalCount.rows[0].count}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

cleanAndMergeAllDuplicates();
