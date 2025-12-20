const { Pool } = require('pg');

function normalizeVenueName(name) {
    const cities = ['edinburgh', 'glasgow', 'aberdeen', 'dundee', 'inverness', 'perth', 'stirling', 'kirkcaldy', 'dunfermline'];

    let normalized = name
        .toLowerCase()
        .replace(/^upstairs\s+(at\s+)?/i, '')
        .replace(/^the\s+/i, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+and\s+/g, ' ')
        .replace(/\s+n\s+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    normalized = normalized.replace(/\s+(bar|pub|club|venue|hall|hotel|theatre|theater|lounge|room|warehouse)(\s+(bar|pub|club|venue|hall|hotel|theatre|theater|lounge|room|warehouse))*$/i, '');
    normalized = normalized.split(' ').map(word => word.replace(/s$/, '')).join(' ').trim();

    cities.forEach(city => {
        const regex = new RegExp(`\\s+${city}$`, 'i');
        normalized = normalized.replace(regex, '');
    });

    return normalized.trim();
}

async function mergeAllDuplicates() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('🧹 Cleaning all venue duplicates...\n');

        // Get all venues
        const allVenues = await pool.query('SELECT id, name, address, city FROM venues ORDER BY id');

        // Group by normalized name
        const groups = new Map();

        allVenues.rows.forEach(venue => {
            const normalized = normalizeVenueName(venue.name);
            if (!groups.has(normalized)) {
                groups.set(normalized, []);
            }
            groups.get(normalized).push(venue);
        });

        // Find duplicates
        const duplicates = Array.from(groups.entries()).filter(([_, venues]) => venues.length > 1);

        if (duplicates.length === 0) {
            console.log('✅ No duplicates found!\n');
            console.log(`Total venues: ${allVenues.rows.length}`);
            await pool.end();
            return;
        }

        console.log(`Found ${duplicates.length} groups of duplicates:\n`);

        let totalMerged = 0;

        for (const [normalized, venues] of duplicates) {
            // Keep the one with an address, or the first one
            const keepVenue = venues.find(v => v.address) || venues[0];
            const removeVenues = venues.filter(v => v.id !== keepVenue.id);

            console.log(`📍 "${normalized}"`);
            console.log(`   ✅ KEEP: ID ${keepVenue.id} - "${keepVenue.name}" (${keepVenue.address || 'no address'})`);

            for (const removeVenue of removeVenues) {
                console.log(`   ❌ REMOVE: ID ${removeVenue.id} - "${removeVenue.name}" (${removeVenue.address || 'no address'})`);

                // Move events
                const moved = await pool.query(
                    'UPDATE events SET venue_id = $1 WHERE venue_id = $2 RETURNING id',
                    [keepVenue.id, removeVenue.id]
                );

                if (moved.rows.length > 0) {
                    console.log(`      → Moved ${moved.rows.length} events`);
                }

                // Delete duplicate
                await pool.query('DELETE FROM venues WHERE id = $1', [removeVenue.id]);
                totalMerged++;
            }
            console.log();
        }

        console.log(`✅ Cleanup complete! Merged ${totalMerged} duplicates\n`);

        const finalCount = await pool.query('SELECT COUNT(*) FROM venues');
        console.log(`Final venue count: ${finalCount.rows[0].count}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

mergeAllDuplicates();
