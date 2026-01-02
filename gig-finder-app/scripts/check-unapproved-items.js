require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkUnapprovedEvents() {
    try {
        // Check for unapproved events
        const unapprovedEvents = await pool.query(`
            SELECT 
                e.id, 
                e.name, 
                e.date, 
                e.user_id, 
                e.created_at,
                v.name as venue_name,
                v.approved as venue_approved
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE e.approved = false
            ORDER BY e.created_at DESC
        `);

        console.log('\n⏳ UNAPPROVED EVENTS:\n');
        console.log('='.repeat(80));

        if (unapprovedEvents.rows.length === 0) {
            console.log('\n✅ No unapproved events found!\n');
        } else {
            unapprovedEvents.rows.forEach((e, i) => {
                const venueStatus = e.venue_approved ? '✅ Approved' : '⏳ Pending';
                console.log(`\n${i + 1}. [ID: ${e.id}] ${e.name}`);
                console.log(`   Venue: ${e.venue_name || 'Unknown'} (${venueStatus})`);
                console.log(`   Date: ${e.date}`);
                console.log(`   User ID: ${e.user_id}`);
                console.log(`   Created: ${e.created_at}`);
            });
            console.log(`\n📊 Total: ${unapprovedEvents.rows.length} unapproved events\n`);
        }

        console.log('='.repeat(80));

        // Check for unapproved venues
        const unapprovedVenues = await pool.query(`
            SELECT 
                v.id,
                v.name,
                v.city,
                v.created_at,
                COUNT(e.id) as event_count
            FROM venues v
            LEFT JOIN events e ON e.venue_id = v.id
            WHERE v.approved = false
            GROUP BY v.id, v.name, v.city, v.created_at
            ORDER BY v.created_at DESC
        `);

        console.log('\n⏳ UNAPPROVED VENUES:\n');
        console.log('='.repeat(80));

        if (unapprovedVenues.rows.length === 0) {
            console.log('\n✅ No unapproved venues found!\n');
        } else {
            unapprovedVenues.rows.forEach((v, i) => {
                console.log(`\n${i + 1}. [ID: ${v.id}] ${v.name}`);
                console.log(`   City: ${v.city || 'Unknown'}`);
                console.log(`   Events at this venue: ${v.event_count}`);
                console.log(`   Created: ${v.created_at}`);
            });
            console.log(`\n📊 Total: ${unapprovedVenues.rows.length} unapproved venues\n`);
        }

        console.log('='.repeat(80));

        // Check user event counts
        const userStats = await pool.query(`
            SELECT 
                user_id,
                COUNT(*) as total_events,
                COUNT(*) FILTER (WHERE approved = true) as approved_events,
                COUNT(*) FILTER (WHERE approved = false) as pending_events,
                MAX(created_at) as last_event_created
            FROM events
            WHERE user_id LIKE 'user_%'
            GROUP BY user_id
            ORDER BY last_event_created DESC
        `);

        console.log('\n👥 USER EVENT STATISTICS:\n');
        console.log('='.repeat(80));

        if (userStats.rows.length === 0) {
            console.log('\n📭 No user-created events found (only scraped events)\n');
        } else {
            userStats.rows.forEach((u, i) => {
                console.log(`\n${i + 1}. User: ${u.user_id}`);
                console.log(`   Total Events: ${u.total_events}`);
                console.log(`   Approved: ${u.approved_events} ✅`);
                console.log(`   Pending: ${u.pending_events} ⏳`);
                console.log(`   Last Event: ${u.last_event_created}`);
            });
        }

        console.log('\n' + '='.repeat(80) + '\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkUnapprovedEvents();
