// Check Phase 2A: QR code generation for manual bookings
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkPhase2A() {
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
    });

    try {
        console.log('🔍 Phase 2A Test: Checking QR Code Generation\n');
        console.log('═'.repeat(70));

        // Check for specific test booking
        console.log('\n📋 Test 1: Looking for "Test User Phase2A" booking...\n');

        const testResult = await pool.query(`
            SELECT 
                id,
                customer_name,
                customer_email,
                qr_code,
                event_id,
                payment_intent_id,
                created_at
            FROM bookings
            WHERE customer_name = 'Test User Phase2A'
            ORDER BY created_at DESC
            LIMIT 1
        `);

        if (testResult.rows.length === 0) {
            console.log('❌ No booking found for "Test User Phase2A"');
            console.log('\n💡 To test Phase 2A:');
            console.log('1. Go to any event guest list');
            console.log('2. Click "+ Add Guest Manually"');
            console.log('3. Name: Test User Phase2A');
            console.log('4. Email: your-email@example.com');
            console.log('5. Click "Add"');
            console.log('6. Run this script again\n');
        } else {
            const booking = testResult.rows[0];
            console.log('✅ Booking found!\n');
            console.log('Booking Details:');
            console.log('─'.repeat(70));
            console.log(`ID:              ${booking.id}`);
            console.log(`Name:            ${booking.customer_name}`);
            console.log(`Email:           ${booking.customer_email}`);
            console.log(`Event ID:        ${booking.event_id}`);
            console.log(`Payment Type:    ${booking.payment_intent_id ? 'Stripe' : 'Manual'}`);
            console.log(`Created:         ${booking.created_at}`);
            console.log(`QR Code:         ${booking.qr_code || '❌ NULL (BUG!)'}`);
            console.log('─'.repeat(70));

            // Validate QR code
            if (booking.qr_code) {
                console.log('\n✅ QR Code is populated (Phase 2A working!)');

                // Check format
                const qrRegex = /^GF-TICKET:\d+-\d+$/;
                if (qrRegex.test(booking.qr_code)) {
                    console.log('✅ QR Code format is correct: GF-TICKET:{bookingId}-{eventId}');

                    // Extract and validate IDs
                    const match = booking.qr_code.match(/GF-TICKET:(\d+)-(\d+)/);
                    if (match) {
                        const bookingIdFromQR = match[1];
                        const eventIdFromQR = match[2];
                        console.log(`   Booking ID from QR: ${bookingIdFromQR}`);
                        console.log(`   Event ID from QR:   ${eventIdFromQR}`);

                        if (bookingIdFromQR === booking.id.toString()) {
                            console.log('✅ Booking ID matches database!');
                        } else {
                            console.log(`❌ Booking ID mismatch! DB: ${booking.id}, QR: ${bookingIdFromQR}`);
                        }

                        if (eventIdFromQR === booking.event_id.toString()) {
                            console.log('✅ Event ID matches database!');
                        } else {
                            console.log(`❌ Event ID mismatch! DB: ${booking.event_id}, QR: ${eventIdFromQR}`);
                        }
                    }
                } else {
                    console.log(`❌ QR Code format is INVALID: ${booking.qr_code}`);
                    console.log('   Expected format: GF-TICKET:{bookingId}-{eventId}');
                }
            } else {
                console.log('\n❌ QR Code is NULL!');
                console.log('   This means Phase 2A bug fix is NOT working!');
                console.log('   Manual bookings should save QR codes to database.');
            }
        }

        // Check recent bookings
        console.log('\n\n📊 Test 2: Recent Bookings (last 10)...\n');
        console.log('═'.repeat(70));

        const recentResult = await pool.query(`
            SELECT 
                id,
                customer_name,
                qr_code,
                payment_intent_id,
                created_at
            FROM bookings
            ORDER BY created_at DESC
            LIMIT 10
        `);

        if (recentResult.rows.length === 0) {
            console.log('❌ No bookings found in database');
        } else {
            console.log(`Found ${recentResult.rows.length} recent bookings:\n`);

            let manualWithQR = 0;
            let manualWithoutQR = 0;
            let stripeWithQR = 0;
            let stripeWithoutQR = 0;

            recentResult.rows.forEach((booking, index) => {
                const qrStatus = booking.qr_code ? '✅' : '❌';
                const paymentType = booking.payment_intent_id ? 'Stripe' : 'Manual';
                const qrPreview = booking.qr_code ? booking.qr_code.substring(0, 30) + '...' : 'NULL';

                console.log(`${index + 1}. ${qrStatus} ID:${booking.id} | ${booking.customer_name.substring(0, 20).padEnd(20)} | ${paymentType.padEnd(6)} | ${qrPreview}`);

                // Count stats
                if (booking.payment_intent_id) {
                    if (booking.qr_code) stripeWithQR++;
                    else stripeWithoutQR++;
                } else {
                    if (booking.qr_code) manualWithQR++;
                    else manualWithoutQR++;
                }
            });

            console.log('\n' + '─'.repeat(70));
            console.log('Statistics:');
            console.log(`  Manual bookings with QR:    ${manualWithQR} ${manualWithQR > 0 ? '✅' : '❌'}`);
            console.log(`  Manual bookings without QR: ${manualWithoutQR} ${manualWithoutQR === 0 ? '✅' : '⚠️'}`);
            console.log(`  Stripe bookings with QR:    ${stripeWithQR} ${stripeWithQR > 0 ? '✅' : '❌'}`);
            console.log(`  Stripe bookings without QR: ${stripeWithoutQR} ${stripeWithoutQR === 0 ? '✅' : '⚠️'}`);
            console.log('─'.repeat(70));

            // Phase 2A success criteria
            console.log('\n🎯 Phase 2A Success Criteria:');
            if (manualWithQR > 0) {
                console.log('✅ Manual bookings ARE saving QR codes (bug fix working!)');
            } else if (manualWithoutQR > 0) {
                console.log('❌ Manual bookings are NOT saving QR codes (bug fix not working!)');
            } else {
                console.log('⚠️  No manual bookings found to test');
            }
        }

    } catch (error) {
        console.error('\n❌ Database error:', error.message);
        console.error('\nFull error:', error);
    } finally {
        await pool.end();
    }
}

checkPhase2A();
