require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

// Merge configuration based on analysis
const MERGES = [
    {
        keep: 1,
        merge: [36],
        name: "The Banshee Labyrinth",
        reason: "Scraper source of truth (ingest-banshee.js)"
    },
    {
        keep: 2,
        merge: [40],
        name: "Sneaky Pete's",
        reason: "Has full data (postcode, capacity)"
    },
    {
        keep: 3,
        merge: [27],
        name: "Leith Depot",
        reason: "Has postcode, confirmed same venue"
    },
    {
        keep: 60,
        merge: [61],
        name: "The Blue Dog",
        reason: "More events (10 vs 3)"
    },
    {
        keep: 97,
        merge: [95],
        name: "Music Hall Dundee",
        reason: "More events (3 vs 1)"
    },
];

// Bannerman's needs special handling - we'll rename one of the existing venues
const BANNERMANS_RENAME = {
    renameId: 43, // "Bannerman's Bar" → "Bannerman's"
    mergeId: 11,  // "Bannermans Edinburgh" → merge into renamed venue
    newName: "Bannerman's",
    reason: "Official canonical name"
};

async function mergeVenueDuplicates() {
    const client = await pool.connect();

    try {
        console.log('🔧 Starting Venue Duplicate Merge Process...\n');
        console.log('═'.repeat(80));

        await client.query('BEGIN');

        let totalEventsMoved = 0;
        let totalVenuesDeleted = 0;
        const auditLog = [];

        // Step 1: Handle standard merges
        console.log('\n📋 PHASE 1: Standard Merges\n');

        for (const merge of MERGES) {
            console.log(`\n🔄 Processing: ${merge.name}`);
            console.log(`   Keep: ID ${merge.keep}`);
            console.log(`   Merge: IDs [${merge.merge.join(', ')}]`);
            console.log(`   Reason: ${merge.reason}`);

            // Get current event counts
            const beforeCount = await client.query(
                'SELECT venue_id, COUNT(*) as count FROM events WHERE venue_id = ANY($1) GROUP BY venue_id',
                [[merge.keep, ...merge.merge]]
            );

            console.log('\n   Before merge:');
            beforeCount.rows.forEach(row => {
                console.log(`      Venue ${row.venue_id}: ${row.count} events`);
            });

            // Update events to point to canonical venue
            const updateResult = await client.query(
                'UPDATE events SET venue_id = $1 WHERE venue_id = ANY($2) RETURNING id',
                [merge.keep, merge.merge]
            );

            const movedCount = updateResult.rowCount;
            totalEventsMoved += movedCount;

            console.log(`   ✅ Moved ${movedCount} events to venue ${merge.keep}`);

            // Delete duplicate venues
            const deleteResult = await client.query(
                'DELETE FROM venues WHERE id = ANY($1) RETURNING id, name',
                [merge.merge]
            );

            totalVenuesDeleted += deleteResult.rowCount;

            deleteResult.rows.forEach(row => {
                console.log(`   🗑️  Deleted venue ${row.id}: "${row.name}"`);
            });

            // Verify after merge
            const afterCount = await client.query(
                'SELECT COUNT(*) as count FROM events WHERE venue_id = $1',
                [merge.keep]
            );

            console.log(`   📊 Final count for venue ${merge.keep}: ${afterCount.rows[0].count} events`);

            auditLog.push({
                action: 'merge',
                kept: merge.keep,
                merged: merge.merge,
                name: merge.name,
                eventsMoved: movedCount,
                venuesDeleted: deleteResult.rowCount
            });
        }

        // Step 2: Handle Bannerman's (rename + merge)
        console.log('\n\n📋 PHASE 2: Bannerman\'s Special Case\n');
        console.log(`🔄 Processing: ${BANNERMANS_RENAME.newName}`);
        console.log(`   Rename: ID ${BANNERMANS_RENAME.renameId} → "${BANNERMANS_RENAME.newName}"`);
        console.log(`   Then merge: ID ${BANNERMANS_RENAME.mergeId} into renamed venue`);
        console.log(`   Reason: ${BANNERMANS_RENAME.reason}`);

        // Rename the venue
        await client.query(
            'UPDATE venues SET name = $1 WHERE id = $2',
            [BANNERMANS_RENAME.newName, BANNERMANS_RENAME.renameId]
        );
        console.log(`   ✅ Renamed venue ${BANNERMANS_RENAME.renameId} to "${BANNERMANS_RENAME.newName}"`);

        // Get event counts before merge
        const bannerBefore = await client.query(
            'SELECT venue_id, COUNT(*) as count FROM events WHERE venue_id = ANY($1) GROUP BY venue_id',
            [[BANNERMANS_RENAME.renameId, BANNERMANS_RENAME.mergeId]]
        );

        console.log('\n   Before merge:');
        bannerBefore.rows.forEach(row => {
            console.log(`      Venue ${row.venue_id}: ${row.count} events`);
        });

        // Merge events
        const bannerUpdate = await client.query(
            'UPDATE events SET venue_id = $1 WHERE venue_id = $2 RETURNING id',
            [BANNERMANS_RENAME.renameId, BANNERMANS_RENAME.mergeId]
        );

        const bannerMoved = bannerUpdate.rowCount;
        totalEventsMoved += bannerMoved;

        console.log(`   ✅ Moved ${bannerMoved} events to venue ${BANNERMANS_RENAME.renameId}`);

        // Delete the duplicate
        const bannerDelete = await client.query(
            'DELETE FROM venues WHERE id = $1 RETURNING id, name',
            [BANNERMANS_RENAME.mergeId]
        );

        totalVenuesDeleted += bannerDelete.rowCount;
        console.log(`   🗑️  Deleted venue ${bannerDelete.rows[0].id}: "${bannerDelete.rows[0].name}"`);

        // Verify
        const bannerAfter = await client.query(
            'SELECT COUNT(*) as count FROM events WHERE venue_id = $1',
            [BANNERMANS_RENAME.renameId]
        );

        console.log(`   📊 Final count for venue ${BANNERMANS_RENAME.renameId}: ${bannerAfter.rows[0].count} events`);

        auditLog.push({
            action: 'rename_and_merge',
            kept: BANNERMANS_RENAME.renameId,
            merged: [BANNERMANS_RENAME.mergeId],
            name: BANNERMANS_RENAME.newName,
            eventsMoved: bannerMoved,
            venuesDeleted: bannerDelete.rowCount
        });

        // Final verification
        console.log('\n\n═'.repeat(80));
        console.log('📊 FINAL VERIFICATION\n');

        const finalVenueCount = await client.query('SELECT COUNT(*) as count FROM venues');
        const finalEventCount = await client.query('SELECT COUNT(*) as count FROM events');
        const orphanCheck = await client.query(
            'SELECT COUNT(*) as count FROM events WHERE venue_id NOT IN (SELECT id FROM venues)'
        );

        console.log(`   Total venues remaining: ${finalVenueCount.rows[0].count} (was 111, removed ${totalVenuesDeleted})`);
        console.log(`   Total events: ${finalEventCount.rows[0].count}`);
        console.log(`   Orphaned events: ${orphanCheck.rows[0].count} (should be 0)`);

        if (orphanCheck.rows[0].count > 0) {
            throw new Error('❌ ORPHANED EVENTS DETECTED! Rolling back...');
        }

        // Show all canonical venues
        console.log('\n   Canonical venues created:');
        const canonicalVenues = await client.query(
            'SELECT id, name FROM venues WHERE id = ANY($1) ORDER BY id',
            [[1, 2, 3, BANNERMANS_RENAME.renameId, 60, 97]]
        );
        canonicalVenues.rows.forEach(v => {
            console.log(`      ID ${v.id}: "${v.name}"`);
        });

        console.log('\n═'.repeat(80));
        console.log('\n✅ All verifications passed! Committing transaction...\n');

        await client.query('COMMIT');

        console.log('═'.repeat(80));
        console.log('🎉 MERGE COMPLETE!\n');
        console.log(`   📊 Summary:`);
        console.log(`      • Events moved: ${totalEventsMoved}`);
        console.log(`      • Venues deleted: ${totalVenuesDeleted}`);
        console.log(`      • Venue groups merged: ${MERGES.length + 1}`);
        console.log(`      • Database integrity: ✅ Verified`);
        console.log('\n═'.repeat(80));

        // Save audit log
        console.log('\n📝 Audit Log:');
        console.log(JSON.stringify(auditLog, null, 2));

        return {
            success: true,
            eventsMoved: totalEventsMoved,
            venuesDeleted: totalVenuesDeleted,
            auditLog
        };

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('\n❌ ERROR: Merge failed, transaction rolled back');
        console.error(error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the merge
mergeVenueDuplicates()
    .then(result => {
        console.log('\n✅ Script completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Script failed');
        process.exit(1);
    });
