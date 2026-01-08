const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function checkLegacyEvents() {
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('=== Checking for Legacy Unapproved Events ===\n');

        // Find events that are not approved
        const unapprovedEvents = await pool.query(`
            SELECT 
                e.id,
                e.name,
                e.approved,
                e.verified,
                e.created_at,
                v.name as venue_name,
                v.approved as venue_approved,
                v.verified as venue_verified
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE e.approved = false
            ORDER BY e.created_at DESC
            LIMIT 10
        `);

        console.log(`Found ${unapprovedEvents.rows.length} unapproved events:\n`);

        if (unapprovedEvents.rows.length > 0) {
            unapprovedEvents.rows.forEach((e, i) => {
                console.log(`Event ${i + 1}:`);
                console.log(`  ID: ${e.id}`);
                console.log(`  Name: ${e.name}`);
                console.log(`  Approved: ${e.approved}`);
                console.log(`  Verified: ${e.verified}`);
                console.log(`  Venue: ${e.venue_name}`);
                console.log(`  Venue Approved: ${e.venue_approved}`);
                console.log(`  Venue Verified: ${e.venue_verified}`);
                console.log(`  Created: ${e.created_at}`);
                console.log('');
            });
        } else {
            console.log('✅ No unapproved events found\n');
        }

        // Check for events that are approved but not verified
        console.log('=== Checking for Approved but Unverified Events ===\n');

        const approvedUnverified = await pool.query(`
            SELECT 
                e.id,
                e.name,
                e.approved,
                e.verified,
                e.user_id,
                v.name as venue_name,
                v.verified as venue_verified
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE e.approved = true AND e.verified = false
            ORDER BY e.created_at DESC
            LIMIT 10
        `);

        console.log(`Found ${approvedUnverified.rows.length} approved but unverified events:\n`);

        if (approvedUnverified.rows.length > 0) {
            approvedUnverified.rows.forEach((e, i) => {
                const isManual = e.user_id && e.user_id.startsWith('user_');
                console.log(`Event ${i + 1}:`);
                console.log(`  ID: ${e.id}`);
                console.log(`  Name: ${e.name}`);
                console.log(`  Type: ${isManual ? 'Manual (Community)' : 'Scraped'}`);
                console.log(`  Approved: ${e.approved}`);
                console.log(`  Verified: ${e.verified}`);
                console.log(`  Venue: ${e.venue_name}`);
                console.log(`  Venue Verified: ${e.venue_verified}`);
                console.log('');
            });
        } else {
            console.log('✅ No approved-but-unverified events found\n');
        }

        // Check the admin events query behavior
        console.log('=== Simulating Admin Events Query ===\n');

        const adminQuery = await pool.query(`
            SELECT 
                e.id,
                e.name,
                e.approved,
                e.verified,
                v.name as venue_name
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE e.date >= NOW() - INTERVAL '7 days'
            ORDER BY 
                CASE WHEN e.approved = false THEN 0 ELSE 1 END,
                e.date ASC
            LIMIT 5
        `);

        console.log('First 5 events in admin view (sorted by approval status):\n');
        adminQuery.rows.forEach((e, i) => {
            console.log(`${i + 1}. ${e.name}`);
            console.log(`   Approved: ${e.approved}, Verified: ${e.verified}`);
            console.log('');
        });

        // Summary
        console.log('=== Summary ===\n');
        const totalUnapproved = unapprovedEvents.rows.length;
        const totalApprovedUnverified = approvedUnverified.rows.length;

        if (totalUnapproved > 0) {
            console.log(`⚠️  ${totalUnapproved} legacy unapproved events exist`);
            console.log('   These events will NOT appear in public feed');
            console.log('   Admin can approve them to make them live');
            console.log('');
        }

        if (totalApprovedUnverified > 0) {
            console.log(`⚠️  ${totalApprovedUnverified} events are live but unverified`);
            console.log('   These will show "Community Post" badge');
            console.log('   Admin can verify them to remove the warning');
            console.log('');
        }

        if (totalUnapproved === 0 && totalApprovedUnverified === 0) {
            console.log('✅ No legacy issues found - all events are properly approved and verified');
        }

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

checkLegacyEvents();
