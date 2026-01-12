// Get the most recently created gig
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function getLatestGig() {
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
    });

    try {
        console.log('🔍 Fetching the most recently created gig...\n');

        const result = await pool.query(`
            SELECT 
                e.id,
                e.name,
                e.date,
                e.approved,
                e.verified,
                e.user_id,
                e.created_at,
                v.name as venue_name,
                v.city as venue_city
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            ORDER BY e.id DESC
            LIMIT 1
        `);

        if (result.rows.length > 0) {
            const gig = result.rows[0];
            const now = new Date();
            const created = new Date(gig.created_at);
            const minutesAgo = Math.floor((now - created) / 1000 / 60);
            const hoursAgo = Math.floor(minutesAgo / 60);
            const daysAgo = Math.floor(hoursAgo / 24);

            let timeAgo;
            if (daysAgo > 0) {
                timeAgo = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
            } else if (hoursAgo > 0) {
                timeAgo = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
            } else {
                timeAgo = `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
            }

            console.log('📋 LATEST GIG:');
            console.log('━'.repeat(60));
            console.log(`ID: ${gig.id}`);
            console.log(`Name: ${gig.name}`);
            console.log(`Venue: ${gig.venue_name || 'Unknown'} (${gig.venue_city || 'Unknown city'})`);
            console.log(`Event Date: ${new Date(gig.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`);
            console.log(`Created: ${gig.created_at.toLocaleString('en-GB')}`);
            console.log(`Time Ago: ${timeAgo}`);
            console.log(`User ID: ${gig.user_id}`);
            console.log(`Approved: ${gig.approved ? '✅ YES' : '❌ NO'}`);
            console.log(`Verified: ${gig.verified ? '✅ YES' : '❌ NO'}`);
            console.log('━'.repeat(60));

            if (!gig.approved) {
                console.log('\n⚠️  This gig is NOT APPROVED - it won\'t appear in search results!');
                console.log(`To approve it, run: UPDATE events SET approved = true WHERE id = ${gig.id};`);
            } else {
                console.log('\n✅ This gig is approved and should appear in search results');
            }
        } else {
            console.log('❌ No gigs found in database');
        }

    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await pool.end();
    }
}

getLatestGig();
