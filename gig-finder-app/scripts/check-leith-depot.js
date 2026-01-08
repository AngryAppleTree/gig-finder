const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function checkLeithDepot() {
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('=== Checking for Leith Depot venues ===\n');

        // Find all Leith Depot venues
        const venues = await pool.query(`
            SELECT id, name, city, approved, verified, created_at, normalized_name
            FROM venues 
            WHERE name ILIKE '%leith%depot%'
            ORDER BY created_at DESC
        `);

        console.log(`Found ${venues.rows.length} Leith Depot venue(s):\n`);
        venues.rows.forEach((v, i) => {
            console.log(`Venue ${i + 1}:`);
            console.log(`  ID: ${v.id}`);
            console.log(`  Name: ${v.name}`);
            console.log(`  City: ${v.city || 'NULL'}`);
            console.log(`  Normalized: ${v.normalized_name}`);
            console.log(`  Approved: ${v.approved}`);
            console.log(`  Verified: ${v.verified}`);
            console.log(`  Created: ${v.created_at}`);
            console.log('');
        });

        // Find TEST GIG and check its venue
        console.log('=== Checking TEST GIG ===\n');
        const testGig = await pool.query(`
            SELECT e.id, e.name, e.venue_id, e.approved, e.verified as event_verified,
                   v.name as venue_name, v.verified as venue_verified, v.approved as venue_approved
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE e.name ILIKE '%test%gig%'
            ORDER BY e.created_at DESC
            LIMIT 1
        `);

        if (testGig.rows.length > 0) {
            const gig = testGig.rows[0];
            console.log('Found TEST GIG:');
            console.log(`  Event ID: ${gig.id}`);
            console.log(`  Event Name: ${gig.name}`);
            console.log(`  Event Approved: ${gig.approved}`);
            console.log(`  Event Verified: ${gig.event_verified}`);
            console.log(`  Venue ID: ${gig.venue_id}`);
            console.log(`  Venue Name: ${gig.venue_name}`);
            console.log(`  Venue Approved: ${gig.venue_approved}`);
            console.log(`  Venue Verified: ${gig.venue_verified}`);
        } else {
            console.log('No TEST GIG found');
        }

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

checkLeithDepot();
