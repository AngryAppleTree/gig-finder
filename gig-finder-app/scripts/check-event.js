// Check for specific event in database
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkEvent() {
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
    });

    try {
        console.log('🔍 Searching for events with "GIG A" or "1767973093567"...\n');

        const result = await pool.query(`
            SELECT 
                e.id, 
                e.name, 
                e.date, 
                e.approved, 
                e.verified, 
                e.venue_id,
                v.name as venue_name
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE e.name LIKE '%GIG A%' OR e.name LIKE '%1767973093567%'
            ORDER BY e.date DESC
            LIMIT 10
        `);

        if (result.rows.length === 0) {
            console.log('❌ No events found matching the search criteria');
            console.log('\nLet me check the most recent events instead...\n');

            const recentResult = await pool.query(`
                SELECT 
                    e.id, 
                    e.name, 
                    e.date, 
                    e.approved, 
                    e.verified, 
                    e.venue_id,
                    v.name as venue_name
                FROM events e
                LEFT JOIN venues v ON e.venue_id = v.id
                ORDER BY e.id DESC
                LIMIT 5
            `);

            console.log('📋 Most recent 5 events:');
            recentResult.rows.forEach(row => {
                console.log(`\nID: ${row.id}`);
                console.log(`Name: ${row.name}`);
                console.log(`Venue: ${row.venue_name || 'Unknown'} (ID: ${row.venue_id})`);
                console.log(`Date: ${row.date}`);
                console.log(`Approved: ${row.approved}`);
                console.log(`Verified: ${row.verified}`);
            });
        } else {
            console.log(`✅ Found ${result.rows.length} matching event(s):\n`);
            result.rows.forEach(row => {
                console.log(`ID: ${row.id}`);
                console.log(`Name: ${row.name}`);
                console.log(`Venue: ${row.venue_name || 'Unknown'} (ID: ${row.venue_id})`);
                console.log(`Date: ${row.date}`);
                console.log(`Approved: ${row.approved} ← ${!row.approved ? '⚠️ NOT APPROVED - This is why it\'s not showing!' : '✅'}`);
                console.log(`Verified: ${row.verified}`);
                console.log('---');
            });
        }

    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await pool.end();
    }
}

checkEvent();
