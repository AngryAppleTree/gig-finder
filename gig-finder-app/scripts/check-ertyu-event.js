require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkEvent() {
    const client = await pool.connect();
    try {
        console.log('🔍 Checking ERTYU event...\n');

        const result = await client.query(`
            SELECT 
                e.id,
                e.name,
                e.sell_tickets,
                e.is_internal_ticketing,
                e.ticket_price,
                e.price,
                e.user_id,
                v.name as venue_name
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE UPPER(e.name) LIKE '%ERTYU%'
            ORDER BY e.created_at DESC
            LIMIT 1
        `);

        if (result.rows.length === 0) {
            console.log('❌ No event found with name containing "ERTYU"');
        } else {
            const event = result.rows[0];
            console.log('📊 Event Details:');
            console.log('─────────────────────────────────────');
            console.log(`ID: ${event.id}`);
            console.log(`Name: ${event.name}`);
            console.log(`Venue: ${event.venue_name}`);
            console.log(`User ID: ${event.user_id}`);
            console.log(`Price: ${event.price}`);
            console.log(`Ticket Price: ${event.ticket_price}`);
            console.log(`sell_tickets: ${event.sell_tickets}`);
            console.log(`is_internal_ticketing: ${event.is_internal_ticketing}`);
            console.log('─────────────────────────────────────');

            if (!event.sell_tickets && !event.is_internal_ticketing) {
                console.log('\n⚠️  ISSUE FOUND:');
                console.log('Both sell_tickets and is_internal_ticketing are FALSE');
                console.log('This is why no "Buy Tickets" button appears!\n');
                console.log('Would you like to update this event? (Y/N)');
            } else {
                console.log('\n✅ Event has ticketing enabled');
                console.log('The issue is likely that you\'re viewing the deployed site');
                console.log('which doesn\'t have the latest code changes yet.\n');
            }
        }

    } finally {
        client.release();
        await pool.end();
    }
}

checkEvent().catch(console.error);
