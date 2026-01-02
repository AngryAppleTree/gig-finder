const { Pool } = require('pg');

async function checkDuplicates() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('Checking for duplicate venues...\n');
        const venueResult = await pool.query(`
      SELECT name, address, COUNT(*) as count, array_agg(id) as ids
      FROM venues
      GROUP BY name, address
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);

        if (venueResult.rows.length > 0) {
            console.log(`Found ${venueResult.rows.length} duplicate venue groups:\n`);
            venueResult.rows.forEach(row => {
                console.log(`- "${row.name}" at "${row.address}": ${row.count} copies`);
                console.log(`  IDs: ${row.ids.join(', ')}\n`);
            });
        } else {
            console.log('No duplicate venues found.\n');
        }

        console.log('Checking for duplicate events...\n');
        const eventResult = await pool.query(`
      SELECT name, venue_id, date, COUNT(*) as count, array_agg(id) as ids
      FROM events
      GROUP BY name, venue_id, date
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);

        if (eventResult.rows.length > 0) {
            console.log(`Found ${eventResult.rows.length} duplicate event groups:\n`);
            eventResult.rows.forEach(row => {
                console.log(`- "${row.name}" on ${row.date}: ${row.count} copies`);
                console.log(`  IDs: ${row.ids.join(', ')}\n`);
            });
        } else {
            console.log('No duplicate events found.\n');
        }

    } catch (error) {
        console.error('Error checking duplicates:', error);
    } finally {
        await pool.end();
    }
}

checkDuplicates();
