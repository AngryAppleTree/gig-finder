require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkBookingsStructure() {
    try {
        // Get bookings table structure
        const tableInfo = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'bookings'
            ORDER BY ordinal_position
        `);

        console.log('\n📋 BOOKINGS TABLE STRUCTURE:\n');
        console.log('='.repeat(80));
        tableInfo.rows.forEach(col => {
            console.log(`   ${col.column_name}: ${col.data_type}`);
        });

        // Get all bookings
        const allBookings = await pool.query(`
            SELECT *
            FROM bookings
            ORDER BY created_at DESC
            LIMIT 20
        `);

        console.log('\n='.repeat(80));
        console.log(`\n📊 RECENT BOOKINGS (Last 20):\n`);
        console.log(`Total bookings: ${allBookings.rows.length}\n`);

        if (allBookings.rows.length === 0) {
            console.log('   No bookings found\n');
        } else {
            allBookings.rows.forEach((booking, i) => {
                console.log(`${i + 1}. Booking ID: ${booking.id}`);
                console.log(`   Event ID: ${booking.event_id}`);
                console.log(`   Email: ${booking.user_email || 'N/A'}`);
                console.log(`   Clerk User ID: ${booking.clerk_user_id || 'N/A'}`);
                console.log(`   Created: ${new Date(booking.created_at).toLocaleString('en-GB')}`);
                console.log('');
            });

            // Get unique clerk_user_ids
            const uniqueUsers = await pool.query(`
                SELECT DISTINCT clerk_user_id, COUNT(*) as booking_count
                FROM bookings
                WHERE clerk_user_id IS NOT NULL
                GROUP BY clerk_user_id
                ORDER BY booking_count DESC
            `);

            console.log('='.repeat(80));
            console.log('\n👥 UNIQUE USERS WHO MADE BOOKINGS:\n');
            if (uniqueUsers.rows.length === 0) {
                console.log('   No users with clerk_user_id found\n');
            } else {
                uniqueUsers.rows.forEach((user, i) => {
                    console.log(`   ${i + 1}. ${user.clerk_user_id}: ${user.booking_count} booking(s)`);
                });
            }
        }

        console.log('\n' + '='.repeat(80) + '\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkBookingsStructure();
