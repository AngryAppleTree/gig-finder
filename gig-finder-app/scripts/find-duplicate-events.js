const { Pool } = require('pg');

async function findDuplicateEvents() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('Finding events at the same venue on the same date...\n');

        const result = await pool.query(`
      SELECT 
        venue_id,
        date,
        COUNT(*) as event_count,
        array_agg(id ORDER BY id) as event_ids,
        array_agg(name ORDER BY id) as event_names
      FROM events
      GROUP BY venue_id, date
      HAVING COUNT(*) > 1
      ORDER BY date, venue_id
    `);

        if (result.rows.length > 0) {
            console.log(`Found ${result.rows.length} groups of potential duplicate events:\n`);

            for (const row of result.rows) {
                // Get venue name
                const venueResult = await pool.query(
                    'SELECT name, address FROM venues WHERE id = $1',
                    [row.venue_id]
                );
                const venueName = venueResult.rows[0]?.name || 'Unknown Venue';
                const venueAddress = venueResult.rows[0]?.address || 'Unknown Address';

                console.log(`📍 Venue: ${venueName} (${venueAddress})`);
                console.log(`📅 Date: ${new Date(row.date).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                })}`);
                console.log(`   ${row.event_count} events found:\n`);

                row.event_ids.forEach((id, idx) => {
                    console.log(`   ${idx + 1}. ID ${id}: "${row.event_names[idx]}"`);
                });
                console.log();
            }

            console.log(`\nTotal: ${result.rows.length} groups with multiple events on same date/venue`);

        } else {
            console.log('No duplicate events found (same venue + same date).\n');
        }

    } catch (error) {
        console.error('Error finding duplicate events:', error);
    } finally {
        await pool.end();
    }
}

findDuplicateEvents();
