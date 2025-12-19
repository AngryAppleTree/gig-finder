require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

// Normalize venue name for comparison
function normalizeVenueName(name) {
    return name
        .toLowerCase()
        .replace(/^the\s+/i, '') // Remove leading "The"
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}

async function scanVenueDuplicates() {
    const client = await pool.connect();
    try {
        console.log('🔍 Scanning venues table for duplicates...\n');

        // Get all venues
        const result = await client.query(`
            SELECT id, name, city, postcode, capacity
            FROM venues
            ORDER BY name
        `);

        const venues = result.rows;
        console.log(`📊 Total venues in database: ${venues.length}\n`);

        // Group venues by normalized name
        const venueGroups = new Map();

        venues.forEach(venue => {
            const normalized = normalizeVenueName(venue.name);
            if (!venueGroups.has(normalized)) {
                venueGroups.set(normalized, []);
            }
            venueGroups.get(normalized).push(venue);
        });

        // Find duplicates
        const duplicates = [];
        venueGroups.forEach((group, normalizedName) => {
            if (group.length > 1) {
                duplicates.push({ normalizedName, venues: group });
            }
        });

        // Display results
        if (duplicates.length === 0) {
            console.log('✅ No duplicates found!');
        } else {
            console.log(`⚠️  Found ${duplicates.length} potential duplicate groups:\n`);
            console.log('='.repeat(80));

            duplicates.forEach((dup, index) => {
                console.log(`\n${index + 1}. Normalized: "${dup.normalizedName}"`);
                console.log('-'.repeat(80));
                dup.venues.forEach(v => {
                    console.log(`   ID: ${v.id.toString().padEnd(4)} | Name: "${v.name}" | City: ${v.city || 'N/A'} | Postcode: ${v.postcode || 'N/A'} | Capacity: ${v.capacity || 'N/A'}`);
                });
            });

            console.log('\n' + '='.repeat(80));
            console.log(`\n📊 Summary:`);
            console.log(`   Total venues: ${venues.length}`);
            console.log(`   Duplicate groups: ${duplicates.length}`);
            console.log(`   Total duplicate entries: ${duplicates.reduce((sum, d) => sum + d.venues.length, 0)}`);
            console.log(`   Potential savings: ${duplicates.reduce((sum, d) => sum + (d.venues.length - 1), 0)} venues could be merged\n`);
        }

        // Check for events linked to these venues
        if (duplicates.length > 0) {
            console.log('\n🔗 Checking event associations...\n');

            for (const dup of duplicates) {
                const venueIds = dup.venues.map(v => v.id);
                const eventCheck = await client.query(`
                    SELECT venue_id, COUNT(*) as event_count
                    FROM events
                    WHERE venue_id = ANY($1)
                    GROUP BY venue_id
                `, [venueIds]);

                if (eventCheck.rows.length > 0) {
                    console.log(`Group: "${dup.normalizedName}"`);
                    eventCheck.rows.forEach(row => {
                        const venue = dup.venues.find(v => v.id === row.venue_id);
                        console.log(`   - "${venue.name}" (ID: ${venue.id}): ${row.event_count} events`);
                    });
                    console.log('');
                }
            }
        }

    } finally {
        client.release();
        await pool.end();
    }
}

scanVenueDuplicates().catch(console.error);
