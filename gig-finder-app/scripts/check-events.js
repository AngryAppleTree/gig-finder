require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkEvents() {
    const client = await pool.connect();
    try {
        // Get event count by venue
        const venueCount = await client.query(`
            SELECT 
                COALESCE(v.name, e.venue) as venue_name,
                COUNT(*) as event_count,
                MIN(e.date) as earliest_event,
                MAX(e.date) as latest_event
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE e.date >= CURRENT_DATE
            GROUP BY COALESCE(v.name, e.venue)
            ORDER BY event_count DESC
        `);

        console.log('\n📊 Events by Venue (Future Events Only):');
        console.log('='.repeat(80));
        venueCount.rows.forEach(row => {
            console.log(`${row.venue_name}: ${row.event_count} events`);
            console.log(`  Earliest: ${row.earliest_event}`);
            console.log(`  Latest: ${row.latest_event}`);
        });

        // Get total counts
        const totals = await client.query(`
            SELECT 
                COUNT(*) as total_events,
                COUNT(CASE WHEN date >= CURRENT_DATE THEN 1 END) as future_events,
                COUNT(CASE WHEN date < CURRENT_DATE THEN 1 END) as past_events,
                COUNT(CASE WHEN venue_id IS NULL THEN 1 END) as no_venue_id,
                COUNT(CASE WHEN venue_id IS NOT NULL THEN 1 END) as has_venue_id
            FROM events
        `);

        console.log('\n📈 Total Counts:');
        console.log('='.repeat(80));
        console.log(`Total Events: ${totals.rows[0].total_events}`);
        console.log(`Future Events: ${totals.rows[0].future_events}`);
        console.log(`Past Events: ${totals.rows[0].past_events}`);
        console.log(`Events with venue_id: ${totals.rows[0].has_venue_id}`);
        console.log(`Events without venue_id: ${totals.rows[0].no_venue_id}`);

        // Sample of future events
        const sample = await client.query(`
            SELECT 
                e.id,
                e.name,
                COALESCE(v.name, e.venue) as venue_name,
                e.date,
                e.user_id,
                e.venue_id
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE e.date >= CURRENT_DATE
            ORDER BY e.date ASC
            LIMIT 10
        `);

        console.log('\n🎫 Sample Future Events (First 10):');
        console.log('='.repeat(80));
        sample.rows.forEach(row => {
            console.log(`${row.name} @ ${row.venue_name}`);
            console.log(`  Date: ${row.date}`);
            console.log(`  venue_id: ${row.venue_id || 'NULL'}, user_id: ${row.user_id}`);
        });

    } finally {
        client.release();
        await pool.end();
    }
}

checkEvents().catch(console.error);
