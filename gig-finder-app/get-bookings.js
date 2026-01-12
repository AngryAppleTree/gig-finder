// Quick script to get booking IDs from database
import { getPool } from './lib/db.js';

async function getBookings() {
    const pool = getPool();
    try {
        const result = await pool.query(`
            SELECT 
                b.id,
                b.event_id,
                b.customer_email,
                b.status,
                b.quantity,
                b.price_paid,
                e.name as event_name
            FROM bookings b
            LEFT JOIN events e ON b.event_id = e.id
            ORDER BY b.created_at DESC
            LIMIT 10
        `);

        console.log('\n=== Recent Bookings ===\n');
        if (result.rows.length === 0) {
            console.log('No bookings found in database.');
        } else {
            result.rows.forEach(booking => {
                console.log(`ID: ${booking.id}`);
                console.log(`Event: ${booking.event_name || 'Unknown'}`);
                console.log(`Email: ${booking.customer_email}`);
                console.log(`Status: ${booking.status}`);
                console.log(`Quantity: ${booking.quantity}`);
                console.log(`Price: £${booking.price_paid || 0}`);
                console.log(`URL: http://localhost:3000/gigfinder/my-bookings/cancel/${booking.id}`);
                console.log('---');
            });
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

getBookings();
