const { Pool } = require('pg');

async function removeDuplicates() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('Finding and removing duplicate events...\n');

        // Find duplicates and keep only the one with the lowest ID
        const result = await pool.query(`
      DELETE FROM events
      WHERE id IN (
        SELECT id
        FROM (
          SELECT id,
                 ROW_NUMBER() OVER (PARTITION BY name, venue_id, date ORDER BY id) as rnum
          FROM events
        ) t
        WHERE t.rnum > 1
      )
      RETURNING id, name, date
    `);

        if (result.rows.length > 0) {
            console.log(`Removed ${result.rows.length} duplicate events:\n`);
            result.rows.forEach(row => {
                console.log(`- ID ${row.id}: "${row.name}" on ${row.date}`);
            });
        } else {
            console.log('No duplicate events found to remove.\n');
        }

    } catch (error) {
        console.error('Error removing duplicates:', error);
    } finally {
        await pool.end();
    }
}

removeDuplicates();
