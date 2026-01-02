require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkPublicVisibility() {
    try {
        // This mimics the query from /app/api/events/route.ts line 70-82
        const publicEvents = await pool.query(`
            SELECT 
                e.*,
                v.name as venue_name,
                v.capacity as venue_capacity,
                v.latitude as venue_latitude,
                v.longitude as venue_longitude,
                v.city as venue_city,
                v.postcode as venue_postcode,
                v.address as venue_address
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE e.date >= CURRENT_DATE AND e.approved = true
            ORDER BY e.date ASC
        `);

        console.log('\n🌍 PUBLIC API VISIBLE EVENTS (date >= today, approved = true):\n');
        console.log('='.repeat(80));
        console.log(`\n📊 Total: ${publicEvents.rows.length} events visible to public\n`);

        // Show first 10
        const displayCount = Math.min(10, publicEvents.rows.length);
        console.log(`\nShowing first ${displayCount} events:\n`);

        publicEvents.rows.slice(0, displayCount).forEach((e, i) => {
            const isUserCreated = e.user_id && e.user_id.startsWith('user_');
            const source = isUserCreated ? '👤 USER' : '🤖 SCRAPER';

            console.log(`${i + 1}. [ID: ${e.id}] ${e.name}`);
            console.log(`   Venue: ${e.venue_name || 'Unknown'}`);
            console.log(`   Date: ${new Date(e.date).toLocaleDateString('en-GB')}`);
            console.log(`   Source: ${source} (${e.user_id})`);
            console.log(`   Created: ${new Date(e.created_at).toLocaleDateString('en-GB')}`);
            console.log('');
        });

        // Count by source
        const userEvents = publicEvents.rows.filter(e => e.user_id && e.user_id.startsWith('user_'));
        const scraperEvents = publicEvents.rows.filter(e => e.user_id && e.user_id.startsWith('scraper_'));

        console.log('='.repeat(80));
        console.log('\n📈 BREAKDOWN BY SOURCE:');
        console.log(`   👤 User-created events: ${userEvents.length}`);
        console.log(`   🤖 Scraper events: ${scraperEvents.length}`);
        console.log(`   ❓ Other/Unknown: ${publicEvents.rows.length - userEvents.length - scraperEvents.length}`);

        // Show all user-created events
        if (userEvents.length > 0) {
            console.log('\n' + '='.repeat(80));
            console.log('\n👤 ALL USER-CREATED EVENTS (visible to public):\n');
            userEvents.forEach((e, i) => {
                console.log(`${i + 1}. [ID: ${e.id}] ${e.name}`);
                console.log(`   Venue: ${e.venue_name}`);
                console.log(`   Date: ${new Date(e.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`);
                console.log(`   User: ${e.user_id}`);
                console.log('');
            });
        }

        console.log('='.repeat(80) + '\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkPublicVisibility();
