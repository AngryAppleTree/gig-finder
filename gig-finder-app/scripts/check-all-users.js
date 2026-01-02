require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkAllUserActivity() {
    try {
        // Get all unique user_ids from events table
        const allUserIds = await pool.query(`
            SELECT DISTINCT user_id
            FROM events
            WHERE user_id LIKE 'user_%'
            ORDER BY user_id
        `);

        console.log('\n👥 ALL USERS WHO HAVE CREATED EVENTS:\n');
        console.log('='.repeat(80));

        if (allUserIds.rows.length === 0) {
            console.log('\n📭 No user-created events found\n');
        } else {
            console.log(`\n📊 Total Unique Users: ${allUserIds.rows.length}\n`);

            for (let i = 0; i < allUserIds.rows.length; i++) {
                const userId = allUserIds.rows[i].user_id;

                // Get all events for this user
                const userEvents = await pool.query(`
                    SELECT 
                        e.id,
                        e.name,
                        e.date,
                        e.approved,
                        e.created_at,
                        v.name as venue_name
                    FROM events e
                    LEFT JOIN venues v ON e.venue_id = v.id
                    WHERE e.user_id = $1
                    ORDER BY e.created_at DESC
                `, [userId]);

                const approvedCount = userEvents.rows.filter(e => e.approved).length;
                const pendingCount = userEvents.rows.filter(e => !e.approved).length;

                console.log(`${i + 1}. User ID: ${userId}`);
                console.log(`   Total Events: ${userEvents.rows.length}`);
                console.log(`   ✅ Approved: ${approvedCount}`);
                console.log(`   ⏳ Pending: ${pendingCount}`);
                console.log(`   First Event: ${new Date(userEvents.rows[userEvents.rows.length - 1].created_at).toLocaleString('en-GB')}`);
                console.log(`   Latest Event: ${new Date(userEvents.rows[0].created_at).toLocaleString('en-GB')}`);
                console.log('\n   Events:');

                userEvents.rows.forEach((event, idx) => {
                    const status = event.approved ? '✅' : '⏳';
                    const eventDate = new Date(event.date).toLocaleDateString('en-GB');
                    console.log(`      ${idx + 1}. ${status} [${event.id}] ${event.name}`);
                    console.log(`         Venue: ${event.venue_name || 'Unknown'}`);
                    console.log(`         Event Date: ${eventDate}`);
                    console.log(`         Created: ${new Date(event.created_at).toLocaleString('en-GB')}`);
                });
                console.log('');
            }
        }

        console.log('='.repeat(80));

        // Check for any events with user_id that might be NULL or empty
        const nullUserEvents = await pool.query(`
            SELECT COUNT(*) as count
            FROM events
            WHERE user_id IS NULL OR user_id = '' OR (user_id NOT LIKE 'user_%' AND user_id NOT LIKE 'scraper_%')
        `);

        if (parseInt(nullUserEvents.rows[0].count) > 0) {
            console.log(`\n⚠️  WARNING: ${nullUserEvents.rows[0].count} events with NULL/empty/unknown user_id`);
        }

        // Summary of all events by type
        const eventSummary = await pool.query(`
            SELECT 
                CASE 
                    WHEN user_id LIKE 'user_%' THEN 'User-Created'
                    WHEN user_id LIKE 'scraper_%' THEN 'Scraper'
                    ELSE 'Unknown/NULL'
                END as event_type,
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE approved = true) as approved,
                COUNT(*) FILTER (WHERE approved = false) as pending
            FROM events
            GROUP BY event_type
            ORDER BY total DESC
        `);

        console.log('\n📊 EVENT SUMMARY BY TYPE:\n');
        eventSummary.rows.forEach(row => {
            console.log(`   ${row.event_type}:`);
            console.log(`      Total: ${row.total}`);
            console.log(`      ✅ Approved: ${row.approved}`);
            console.log(`      ⏳ Pending: ${row.pending}`);
            console.log('');
        });

        console.log('='.repeat(80) + '\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkAllUserActivity();
