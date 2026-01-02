require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function generateUserReport() {
    try {
        console.log('\n' + '='.repeat(80));
        console.log('📊 COMPREHENSIVE USER ACTIVITY REPORT');
        console.log('='.repeat(80));

        // 1. Users who created events
        console.log('\n1️⃣  USERS WHO CREATED EVENTS:\n');
        const eventCreators = await pool.query(`
            SELECT DISTINCT user_id
            FROM events
            WHERE user_id LIKE 'user_%'
        `);

        if (eventCreators.rows.length === 0) {
            console.log('   ❌ No users have created events\n');
        } else {
            console.log(`   ✅ ${eventCreators.rows.length} user(s) have created events:\n`);
            for (const user of eventCreators.rows) {
                const events = await pool.query(`
                    SELECT id, name, approved, created_at
                    FROM events
                    WHERE user_id = $1
                    ORDER BY created_at DESC
                `, [user.user_id]);

                console.log(`   👤 ${user.user_id}`);
                console.log(`      Events: ${events.rows.length}`);
                events.rows.forEach((e, i) => {
                    const status = e.approved ? '✅' : '⏳';
                    console.log(`         ${i + 1}. ${status} [${e.id}] ${e.name}`);
                });
                console.log('');
            }
        }

        // 2. Users who made bookings (by email)
        console.log('='.repeat(80));
        console.log('\n2️⃣  USERS WHO MADE BOOKINGS:\n');
        const bookingEmails = await pool.query(`
            SELECT DISTINCT customer_email, COUNT(*) as booking_count
            FROM bookings
            WHERE customer_email IS NOT NULL AND customer_email != ''
            GROUP BY customer_email
            ORDER BY booking_count DESC
        `);

        if (bookingEmails.rows.length === 0) {
            console.log('   ❌ No bookings with email addresses found\n');
        } else {
            console.log(`   ✅ ${bookingEmails.rows.length} unique email(s) made bookings:\n`);
            bookingEmails.rows.forEach((user, i) => {
                console.log(`   ${i + 1}. 📧 ${user.customer_email}`);
                console.log(`      Bookings: ${user.booking_count}`);
            });
            console.log('');
        }

        // 3. Check if there are any bookings without emails
        const bookingsWithoutEmail = await pool.query(`
            SELECT COUNT(*) as count
            FROM bookings
            WHERE customer_email IS NULL OR customer_email = ''
        `);

        if (parseInt(bookingsWithoutEmail.rows[0].count) > 0) {
            console.log(`   ⚠️  ${bookingsWithoutEmail.rows[0].count} booking(s) without email addresses\n`);
        }

        // 4. Summary
        console.log('='.repeat(80));
        console.log('\n📈 SUMMARY:\n');

        const totalEvents = await pool.query(`SELECT COUNT(*) FROM events WHERE user_id LIKE 'user_%'`);
        const totalBookings = await pool.query(`SELECT COUNT(*) FROM bookings`);
        const totalApprovedEvents = await pool.query(`SELECT COUNT(*) FROM events WHERE user_id LIKE 'user_%' AND approved = true`);
        const totalPendingEvents = await pool.query(`SELECT COUNT(*) FROM events WHERE user_id LIKE 'user_%' AND approved = false`);

        console.log(`   Total user-created events: ${totalEvents.rows[0].count}`);
        console.log(`      ✅ Approved: ${totalApprovedEvents.rows[0].count}`);
        console.log(`      ⏳ Pending: ${totalPendingEvents.rows[0].count}`);
        console.log(`   Total bookings: ${totalBookings.rows[0].count}`);
        console.log(`   Unique users (event creators): ${eventCreators.rows.length}`);
        console.log(`   Unique emails (booking customers): ${bookingEmails.rows.length}`);

        // 5. Answer the key question
        console.log('\n' + '='.repeat(80));
        console.log('\n🎯 ANSWER TO YOUR QUESTION:\n');

        if (eventCreators.rows.length === 0) {
            console.log('   ❌ NO users have attempted to create events\n');
        } else if (eventCreators.rows.length === 1) {
            console.log('   ✅ Only ONE user has created events');
            console.log(`      User ID: ${eventCreators.rows[0].user_id}`);
            console.log(`      Total events: ${totalEvents.rows[0].count}`);
            console.log('\n   ⚠️  If another user signed up but you can\'t see their event,');
            console.log('      it means they either:');
            console.log('         1. Never submitted an event');
            console.log('         2. Started the form but didn\'t complete it');
            console.log('         3. Got an error during submission (check logs)');
        } else {
            console.log(`   ✅ ${eventCreators.rows.length} users have created events\n`);
        }

        console.log('\n' + '='.repeat(80) + '\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err);
    } finally {
        await pool.end();
    }
}

generateUserReport();
