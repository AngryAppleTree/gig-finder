const { Pool } = require('pg');

async function checkAllDuplicates() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        // Check duplicates by name only (case-insensitive)
        console.log('Checking for duplicate venues by name (case-insensitive)...\n');
        const venuesByName = await pool.query(`
      SELECT LOWER(name) as name_lower, COUNT(*) as count, array_agg(id) as ids, array_agg(name) as names, array_agg(address) as addresses
      FROM venues
      GROUP BY LOWER(name)
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);

        if (venuesByName.rows.length > 0) {
            console.log(`Found ${venuesByName.rows.length} duplicate venue groups (by name):\n`);
            venuesByName.rows.forEach(row => {
                console.log(`- "${row.name_lower}": ${row.count} copies`);
                row.ids.forEach((id, idx) => {
                    console.log(`  ID ${id}: "${row.names[idx]}" at "${row.addresses[idx]}"`);
                });
                console.log();
            });
        } else {
            console.log('No duplicate venues found by name.\n');
        }

        // Check duplicates by name AND address
        console.log('Checking for duplicate venues by name AND address...\n');
        const venuesByNameAddress = await pool.query(`
      SELECT name, address, COUNT(*) as count, array_agg(id) as ids
      FROM venues
      GROUP BY name, address
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);

        if (venuesByNameAddress.rows.length > 0) {
            console.log(`Found ${venuesByNameAddress.rows.length} duplicate venue groups (by name + address):\n`);
            venuesByNameAddress.rows.forEach(row => {
                console.log(`- "${row.name}" at "${row.address}": ${row.count} copies`);
                console.log(`  IDs: ${row.ids.join(', ')}\n`);
            });
        } else {
            console.log('No duplicate venues found by name + address.\n');
        }

        // Show total count
        const totalVenues = await pool.query('SELECT COUNT(*) FROM venues');
        console.log(`Total venues in database: ${totalVenues.rows[0].count}\n`);

    } catch (error) {
        console.error('Error checking duplicates:', error);
    } finally {
        await pool.end();
    }
}

checkAllDuplicates();
