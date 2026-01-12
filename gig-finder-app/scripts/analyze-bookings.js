// Check all bookings for event 1223 to understand the discrepancy
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function analyzeBookings() {
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
    });

    try {
        console.log('🔍 Analyzing bookings for event 1223 (sdwfgh)...\n');

        const result = await pool.query(`
            SELECT 
                id,
                customer_name,
                customer_email,
                quantity,
                status,
                payment_intent_id,
                created_at
            FROM bookings
            WHERE event_id = 1223
            ORDER BY created_at DESC
        `);

        console.log(`📊 Total bookings found: ${result.rows.length}\n`);

        if (result.rows.length === 0) {
            console.log('❌ No bookings found for event 1223');
        } else {
            // Categorize bookings
            const paidBookings = result.rows.filter(b => b.payment_intent_id);
            const guestListBookings = result.rows.filter(b => !b.payment_intent_id);

            console.log('📋 BREAKDOWN:');
            console.log(`💳 Paid tickets (via Stripe): ${paidBookings.length}`);
            console.log(`🎟️  Guest list (manual): ${guestListBookings.length}`);
            console.log('━'.repeat(80));

            console.log('\n💳 PAID TICKETS:');
            if (paidBookings.length === 0) {
                console.log('   (none - Stripe webhooks not working on localhost)');
            } else {
                paidBookings.forEach((b, i) => {
                    console.log(`\n${i + 1}. ${b.customer_name} (${b.customer_email})`);
                    console.log(`   Quantity: ${b.quantity} | Status: ${b.status}`);
                    console.log(`   Payment Intent: ${b.payment_intent_id}`);
                    console.log(`   Created: ${b.created_at}`);
                });
            }

            console.log('\n\n🎟️  GUEST LIST (Manual):');
            if (guestListBookings.length === 0) {
                console.log('   (none)');
            } else {
                guestListBookings.forEach((b, i) => {
                    console.log(`\n${i + 1}. ${b.customer_name} (${b.customer_email})`);
                    console.log(`   Quantity: ${b.quantity} | Status: ${b.status}`);
                    console.log(`   Created: ${b.created_at}`);
                });
            }

            console.log('\n\n💡 EXPLANATION:');
            console.log('The test expected 12 guests but found only 3.');
            console.log('This suggests:');
            console.log('1. Previous test runs added guests that are still in the database');
            console.log('2. The guest list page is showing all bookings (both paid + manual)');
            console.log('3. The count changed between when the test read it and when it verified');
            console.log('\nOR:');
            console.log('The test might be looking at a different event or the data was cleared.');
        }

    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await pool.end();
    }
}

analyzeBookings();
