// Check if a booking was created for event 1223
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkBookings() {
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
    });

    try {
        console.log('🔍 Checking bookings for event 1223 (sdwfgh)...\n');

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
            LIMIT 10
        `);

        if (result.rows.length === 0) {
            console.log('❌ No bookings found for event 1223');
            console.log('\n💡 This means the Stripe webhook did NOT create the booking.');
            console.log('\n🔧 REASON: Stripe webhooks cannot reach localhost without Stripe CLI');
            console.log('\nTo fix this for local testing:');
            console.log('1. Install Stripe CLI: brew install stripe/stripe-cli/stripe');
            console.log('2. Login: stripe login');
            console.log('3. Forward webhooks: stripe listen --forward-to localhost:3000/api/stripe/webhook');
            console.log('4. Copy the webhook signing secret to .env.local as STRIPE_WEBHOOK_SECRET');
        } else {
            console.log(`✅ Found ${result.rows.length} booking(s):\n`);
            result.rows.forEach((booking, i) => {
                console.log(`${i + 1}. Booking #${booking.id}`);
                console.log(`   Customer: ${booking.customer_name} (${booking.customer_email})`);
                console.log(`   Quantity: ${booking.quantity}`);
                console.log(`   Status: ${booking.status}`);
                console.log(`   Payment Intent: ${booking.payment_intent_id || 'N/A'}`);
                console.log(`   Created: ${booking.created_at}`);
                console.log('');
            });
        }

    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await pool.end();
    }
}

checkBookings();
