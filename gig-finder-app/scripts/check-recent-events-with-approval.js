require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkRecentEvents() {
    try {
        const result = await pool.query(`
            SELECT 
                e.id, 
                e.name, 
                e.date, 
                e.approved,
                e.user_id, 
                e.created_at,
                v.name as venue_name,
                v.approved as venue_approved
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            ORDER BY e.created_at DESC 
            LIMIT 10
        `);

        console.log('\n📊 Last 10 Events Added:\n');
        console.log('='.repeat(80));

        result.rows.forEach((e, i) => {
            const eventStatus = e.approved ? '✅ APPROVED' : '⏳ PENDING APPROVAL';
            const venueStatus = e.venue_approved ? '✅' : '⏳';

            console.log(`\n${i + 1}. [ID: ${e.id}] ${e.name}`);
            console.log(`   Event Status: ${eventStatus}`);
            console.log(`   Venue: ${e.venue_name || 'Unknown'} ${venueStatus}`);
            console.log(`   Date: ${e.date}`);
            console.log(`   User ID: ${e.user_id}`);
            console.log(`   Created: ${e.created_at}`);
        });

        console.log('\n' + '='.repeat(80));

        // Count pending events
        const pendingCount = result.rows.filter(e => !e.approved).length;
        console.log(`\n📌 Summary: ${pendingCount} of 10 most recent events need approval\n`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkRecentEvents();
