
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Use POSTGRES_URL from env
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function auditDataIntegrity() {
    const client = await pool.connect();
    console.log('🔍 Starting Data Integrity Audit...\n');

    try {
        // 1. Check for Orphaned Events (Events with venue_id that doesn't exist)
        // Note: FK constraints should prevent this, but legacy data might be weird
        const orphanedEvents = await client.query(`
            SELECT count(*) 
            FROM events e 
            LEFT JOIN venues v ON e.venue_id = v.id 
            WHERE v.id IS NULL AND e.venue_id IS NOT NULL
        `);
        console.log(`Checking Orphaned Events... Found: ${orphanedEvents.rows[0].count}`);

        // 2. Check for Duplicate Venues (Exact Name Match)
        const duplicateVenues = await client.query(`
            SELECT name, count(*) 
            FROM venues 
            GROUP BY name 
            HAVING count(*) > 1
        `);
        console.log(`Checking Duplicate Venues (Exact Name)... Found: ${duplicateVenues.rows.length}`);
        if (duplicateVenues.rows.length > 0) {
            console.log('Duplicates:', duplicateVenues.rows.map(r => `${r.name} (${r.count})`).join(', '));
        }

        // 3. Check Price Consistency
        // Events where price string contains '£' but priceVal is 0 (Potential parsing errors)
        // We know we fixed this logic, but does legacy data exist?
        const priceIssues = await client.query(`
            SELECT id, name, price 
            FROM events 
            WHERE (price LIKE '%£%' OR price LIKE '%POUNDS%') 
            AND (price NOT LIKE '%FREE%')
            AND ticket_price = 0
        `);
        console.log(`Checking Price Inconsistencies (Paid string, 0 value)... Found: ${priceIssues.rows.length}`);
        if (priceIssues.rows.length > 0) {
            console.log('Examples:', priceIssues.rows.slice(0, 3));
        }

        // 4. Check Events without Dates
        const invalidDates = await client.query(`
            SELECT count(*) FROM events WHERE date IS NULL
        `);
        console.log(`Checking Invalid Dates... Found: ${invalidDates.rows[0].count}`);

    } catch (err) {
        console.error('Audit Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

auditDataIntegrity();
