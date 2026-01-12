// Check exact gig name and ticketing status
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkGigDetails() {
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
    });

    try {
        console.log('🔍 Checking gig details for ID 1223...\n');

        const result = await pool.query(`
            SELECT 
                id,
                name,
                is_internal_ticketing,
                sell_tickets,
                user_id
            FROM events
            WHERE id = 1223
        `);

        if (result.rows.length > 0) {
            const gig = result.rows[0];
            console.log('📋 Gig Details:');
            console.log(`ID: ${gig.id}`);
            console.log(`Name: "${gig.name}" (exact string)`);
            console.log(`is_internal_ticketing: ${gig.is_internal_ticketing}`);
            console.log(`sell_tickets: ${gig.sell_tickets}`);
            console.log(`user_id: ${gig.user_id}`);

            console.log('\n🔍 Guest List Button Visibility:');
            if (gig.is_internal_ticketing || gig.sell_tickets) {
                console.log('✅ Button SHOULD be visible');
            } else {
                console.log('❌ Button will NOT be visible (neither ticketing option enabled)');
                console.log('\n💡 To fix, run:');
                console.log(`UPDATE events SET is_internal_ticketing = true WHERE id = 1223;`);
            }
        } else {
            console.log('❌ Gig 1223 not found');
        }

    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await pool.end();
    }
}

checkGigDetails();
