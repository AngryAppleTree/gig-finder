const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testPhase2ABooking() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('🔍 Checking for Test User Phase2A booking...\n');

        const result = await pool.query(`
      SELECT id, customer_name, customer_email, qr_code, created_at 
      FROM bookings 
      WHERE customer_name = 'Test User Phase2A'
      ORDER BY created_at DESC 
      LIMIT 1
    `);

        if (result.rows.length === 0) {
            console.log('❌ No booking found for "Test User Phase2A"');
            console.log('   Please add a manual guest with this name first.\n');
        } else {
            const booking = result.rows[0];
            console.log('✅ Booking found!\n');
            console.log('Booking Details:');
            console.log('─'.repeat(60));
            console.log(`ID:           ${booking.id}`);
            console.log(`Name:         ${booking.customer_name}`);
            console.log(`Email:        ${booking.customer_email}`);
            console.log(`QR Code:      ${booking.qr_code || '❌ NULL (BUG!)'}`);
            console.log(`Created:      ${booking.created_at}`);
            console.log('─'.repeat(60));

            if (booking.qr_code) {
                console.log('\n✅ QR Code is populated (Phase 2A working!)');

                // Validate format
                const qrRegex = /^GF-TICKET:\d+-\d+$/;
                if (qrRegex.test(booking.qr_code)) {
                    console.log('✅ QR Code format is correct: GF-TICKET:{bookingId}-{eventId}');

                    // Extract IDs
                    const match = booking.qr_code.match(/GF-TICKET:(\d+)-(\d+)/);
                    if (match) {
                        const bookingIdFromQR = match[1];
                        const eventIdFromQR = match[2];
                        console.log(`   Booking ID: ${bookingIdFromQR}`);
                        console.log(`   Event ID:   ${eventIdFromQR}`);

                        if (bookingIdFromQR === booking.id.toString()) {
                            console.log('✅ Booking ID matches!');
                        } else {
                            console.log(`❌ Booking ID mismatch! Expected ${booking.id}, got ${bookingIdFromQR}`);
                        }
                    }
                } else {
                    console.log(`❌ QR Code format is invalid: ${booking.qr_code}`);
                }
            } else {
                console.log('\n❌ QR Code is NULL - Phase 2A bug fix not working!');
                console.log('   Expected: GF-TICKET:{bookingId}-{eventId}');
            }
        }

        // Also check recent bookings
        console.log('\n\n📊 Recent Bookings (last 5):');
        console.log('─'.repeat(80));
        const recentResult = await pool.query(`
      SELECT id, customer_name, qr_code, payment_intent_id, created_at 
      FROM bookings 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

        recentResult.rows.forEach((booking, index) => {
            const qrStatus = booking.qr_code ? '✅' : '❌';
            const paymentType = booking.payment_intent_id ? 'Stripe' : 'Manual';
            console.log(`${index + 1}. ${qrStatus} ID:${booking.id} | ${booking.customer_name} | ${paymentType} | ${booking.qr_code || 'NULL'}`);
        });
        console.log('─'.repeat(80));

    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await pool.end();
    }
}

testPhase2ABooking();
