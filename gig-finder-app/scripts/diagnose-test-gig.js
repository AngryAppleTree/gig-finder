const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function diagnoseTestGig() {
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('=== Full Diagnostic for TEST GIG ===\n');

        // Get the exact query that the API uses
        const result = await pool.query(`
            SELECT 
                e.*,
                e.verified as event_verified,
                v.name as venue_name,
                v.capacity as venue_capacity,
                v.latitude as venue_latitude,
                v.longitude as venue_longitude,
                v.city as venue_city,
                v.postcode as venue_postcode,
                v.address as venue_address,
                v.verified as venue_verified,
                v.approved as venue_approved
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE e.name ILIKE '%test%gig%' AND e.approved = true
            ORDER BY e.created_at DESC
            LIMIT 1
        `);

        if (result.rows.length === 0) {
            console.log('❌ TEST GIG not found in approved events!');

            // Check if it exists but is not approved
            const unapproved = await pool.query(`
                SELECT id, name, approved, verified
                FROM events
                WHERE name ILIKE '%test%gig%'
            `);

            if (unapproved.rows.length > 0) {
                console.log('\n⚠️  Found TEST GIG but it is NOT APPROVED:');
                console.log(unapproved.rows[0]);
            }
            return;
        }

        const e = result.rows[0];

        console.log('Raw Database Row:');
        console.log('─'.repeat(50));
        console.log('Event Fields:');
        console.log(`  id: ${e.id}`);
        console.log(`  name: ${e.name}`);
        console.log(`  approved: ${e.approved}`);
        console.log(`  verified: ${e.verified}`);
        console.log(`  event_verified: ${e.event_verified}`);
        console.log(`  user_id: ${e.user_id}`);
        console.log('');
        console.log('Venue Fields:');
        console.log(`  venue_id: ${e.venue_id}`);
        console.log(`  venue_name: ${e.venue_name}`);
        console.log(`  venue_approved: ${e.venue_approved}`);
        console.log(`  venue_verified: ${e.venue_verified}`);
        console.log('');

        // Calculate what the API would return
        const isVerified = e.event_verified && e.venue_verified;
        const source = e.user_id && e.user_id.startsWith('user_') ? 'manual' : 'scraped';

        console.log('Calculated API Values:');
        console.log('─'.repeat(50));
        console.log(`  source: ${source}`);
        console.log(`  isVerified: ${isVerified}`);
        console.log(`  event_verified && venue_verified: ${e.event_verified} && ${e.venue_verified} = ${isVerified}`);
        console.log('');

        // Determine what badge should show
        const shouldShowVerified = source !== 'manual' || isVerified;
        console.log('Badge Logic:');
        console.log('─'.repeat(50));
        console.log(`  Condition: source !== 'manual' || isVerified`);
        console.log(`  Evaluation: '${source}' !== 'manual' || ${isVerified}`);
        console.log(`  Result: ${shouldShowVerified}`);
        console.log(`  Badge: ${shouldShowVerified ? '✓ Verified' : '⚠ Community Post'}`);

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

diagnoseTestGig();
