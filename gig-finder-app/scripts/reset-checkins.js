require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function resetCheckIns() {
    const client = await pool.connect();

    try {
        console.log('🔄 Resetting all check-ins...\n');

        const result = await client.query(`
            UPDATE bookings 
            SET checked_in_at = NULL 
            WHERE checked_in_at IS NOT NULL
            RETURNING id, customer_name
        `);

        console.log(`✅ Reset ${result.rowCount} check-ins:\n`);

        result.rows.forEach((booking, idx) => {
            console.log(`   ${idx + 1}. ${booking.customer_name} (Booking #${booking.id})`);
        });

        console.log('\n✅ All tickets can now be scanned again!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

resetCheckIns();
