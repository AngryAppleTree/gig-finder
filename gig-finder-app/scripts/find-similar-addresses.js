const { Pool } = require('pg');

async function findSimilarAddresses() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        // Get all venues with addresses
        const result = await pool.query(`
      SELECT id, name, address, city
      FROM venues
      WHERE address IS NOT NULL AND address != ''
      ORDER BY address
    `);

        const venues = result.rows;
        const similarGroups = [];
        const processed = new Set();

        // Find venues with similar addresses
        for (let i = 0; i < venues.length; i++) {
            if (processed.has(venues[i].id)) continue;

            const group = [venues[i]];
            const baseAddress = venues[i].address.toLowerCase()
                .replace(/\s+/g, ' ')      // Normalize spaces
                .replace(/[,.-]/g, '')     // Remove punctuation
                .trim();

            for (let j = i + 1; j < venues.length; j++) {
                if (processed.has(venues[j].id)) continue;

                const compareAddress = venues[j].address.toLowerCase()
                    .replace(/\s+/g, ' ')
                    .replace(/[,.-]/g, '')
                    .trim();

                // Check if addresses are very similar or one contains the other
                if (baseAddress === compareAddress ||
                    baseAddress.includes(compareAddress) ||
                    compareAddress.includes(baseAddress)) {
                    group.push(venues[j]);
                    processed.add(venues[j].id);
                }
            }

            if (group.length > 1) {
                similarGroups.push(group);
                group.forEach(v => processed.add(v.id));
            }
        }

        if (similarGroups.length > 0) {
            console.log(`Found ${similarGroups.length} groups of venues with similar addresses:\n`);
            similarGroups.forEach((group, idx) => {
                console.log(`Group ${idx + 1}:`);
                group.forEach(venue => {
                    console.log(`  ID ${venue.id}: "${venue.name}"`);
                    console.log(`       Address: ${venue.address}, ${venue.city || 'N/A'}`);
                });
                console.log();
            });
        } else {
            console.log('No venues with similar addresses found.\n');
        }

    } catch (error) {
        console.error('Error finding similar addresses:', error);
    } finally {
        await pool.end();
    }
}

findSimilarAddresses();
