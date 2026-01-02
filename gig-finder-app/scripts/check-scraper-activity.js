require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkRecentScraperEvents() {
    try {
        console.log('\n🤖 RECENT SCRAPER ACTIVITY\n');
        console.log('='.repeat(80));

        // Get events from each scraper in the last 24 hours
        const scrapers = [
            { id: 'scraper_v1', name: 'Leith Depot' },
            { id: 'scraper_sneaky', name: 'Sneaky Pete\'s' },
            { id: 'scraper_banshee', name: 'Banshee Labyrinth' },
            { id: 'scraper_stramash', name: 'Stramash' }
        ];

        for (const scraper of scrapers) {
            console.log(`\n📍 ${scraper.name.toUpperCase()} (${scraper.id}):\n`);

            // Get events added in last 24 hours
            const recentEvents = await pool.query(`
                SELECT 
                    e.id,
                    e.name,
                    e.date,
                    e.created_at,
                    v.name as venue_name
                FROM events e
                LEFT JOIN venues v ON e.venue_id = v.id
                WHERE e.user_id = $1
                  AND e.created_at >= NOW() - INTERVAL '24 hours'
                ORDER BY e.created_at DESC
                LIMIT 20
            `, [scraper.id]);

            if (recentEvents.rows.length === 0) {
                console.log('   ⚠️  No events added in the last 24 hours\n');
            } else {
                console.log(`   ✅ ${recentEvents.rows.length} event(s) added in last 24 hours:\n`);
                recentEvents.rows.forEach((event, i) => {
                    const eventDate = new Date(event.date).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    });
                    const addedTime = new Date(event.created_at).toLocaleString('en-GB');

                    console.log(`   ${i + 1}. [${event.id}] ${event.name}`);
                    console.log(`      Event Date: ${eventDate}`);
                    console.log(`      Added: ${addedTime}`);
                    console.log('');
                });
            }

            // Get total count for this scraper
            const totalCount = await pool.query(
                'SELECT COUNT(*) FROM events WHERE user_id = $1',
                [scraper.id]
            );
            console.log(`   📊 Total events from this scraper: ${totalCount.rows[0].count}`);
            console.log('   ' + '-'.repeat(76));
        }

        // Overall summary
        console.log('\n' + '='.repeat(80));
        console.log('\n📈 OVERALL SUMMARY:\n');

        const last24Hours = await pool.query(`
            SELECT COUNT(*) as count
            FROM events
            WHERE user_id LIKE 'scraper_%'
              AND created_at >= NOW() - INTERVAL '24 hours'
        `);

        const lastWeek = await pool.query(`
            SELECT COUNT(*) as count
            FROM events
            WHERE user_id LIKE 'scraper_%'
              AND created_at >= NOW() - INTERVAL '7 days'
        `);

        const totalScraped = await pool.query(`
            SELECT COUNT(*) as count
            FROM events
            WHERE user_id LIKE 'scraper_%'
        `);

        console.log(`   Events added in last 24 hours: ${last24Hours.rows[0].count}`);
        console.log(`   Events added in last 7 days: ${lastWeek.rows[0].count}`);
        console.log(`   Total scraped events: ${totalScraped.rows[0].count}`);

        console.log('\n' + '='.repeat(80) + '\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkRecentScraperEvents();
