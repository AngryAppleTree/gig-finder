require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkRecentBookings() {
    const client = await pool.connect();
    try {
        console.log('🔍 Checking recent bookings and email status...\n');

        // Get most recent bookings
        const bookings = await client.query(`
            SELECT 
                b.id,
                b.customer_name,
                b.customer_email,
                b.quantity,
                b.records_quantity,
                b.status,
                b.qr_code,
                b.created_at,
                e.name as event_name
            FROM bookings b
            LEFT JOIN events e ON b.event_id = e.id
            ORDER BY b.created_at DESC
            LIMIT 5
        `);

        if (bookings.rows.length === 0) {
            console.log('❌ No bookings found in database');
            console.log('\nPossible issues:');
            console.log('1. Webhook not configured in Stripe');
            console.log('2. Webhook secret incorrect');
            console.log('3. Payment succeeded but webhook failed');
            return;
        }

        console.log(`✅ Found ${bookings.rows.length} recent booking(s):\n`);

        bookings.rows.forEach((booking, index) => {
            console.log(`${index + 1}. Booking #${booking.id}`);
            console.log(`   Event: ${booking.event_name}`);
            console.log(`   Customer: ${booking.customer_name} (${booking.customer_email})`);
            console.log(`   Tickets: ${booking.quantity}`);
            console.log(`   Records: ${booking.records_quantity || 0}`);
            console.log(`   Status: ${booking.status}`);
            console.log(`   QR Code: ${booking.qr_code ? '✅ Generated' : '❌ Missing'}`);
            console.log(`   Created: ${booking.created_at}`);
            console.log('');
        });

        // Check environment variables
        console.log('📧 Email Configuration:');
        console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing'}`);
        console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM || 'onboarding@resend.dev (default)'}`);
        console.log('');

        // Check Stripe webhook
        console.log('🔗 Stripe Configuration:');
        console.log(`   STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing'}`);
        console.log(`   STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing'}`);
        console.log('');

        console.log('🔍 Troubleshooting Steps:');
        console.log('');
        console.log('1. Check Stripe Dashboard → Webhooks');
        console.log('   URL: https://dashboard.stripe.com/test/webhooks');
        console.log('   Verify webhook endpoint is: https://gig-finder.co.uk/api/stripe/webhook');
        console.log('   Check recent webhook deliveries for errors');
        console.log('');
        console.log('2. Check Vercel Logs');
        console.log('   URL: https://vercel.com/your-project/logs');
        console.log('   Look for webhook errors or email sending failures');
        console.log('');
        console.log('3. Check Resend Dashboard');
        console.log('   URL: https://resend.com/emails');
        console.log('   Verify emails were sent (or failed)');
        console.log('');
        console.log('4. Test webhook locally:');
        console.log('   stripe listen --forward-to localhost:3000/api/stripe/webhook');
        console.log('');

    } finally {
        client.release();
        await pool.end();
    }
}

checkRecentBookings().catch(console.error);
