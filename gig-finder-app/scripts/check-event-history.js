// Check event creation time and any updates
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkEventHistory() {
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
    });

    try {
        console.log('🔍 Checking event history...\n');

        const result = await pool.query(`
            SELECT 
                id,
                name,
                approved,
                verified,
                user_id,
                created_at,
                updated_at
            FROM events
            WHERE id = 1218
        `);

        if (result.rows.length > 0) {
            const event = result.rows[0];
            console.log('📋 Event #1218 details:');
            console.log(`Name: ${event.name}`);
            console.log(`User ID: ${event.user_id}`);
            console.log(`Approved: ${event.approved}`);
            console.log(`Verified: ${event.verified}`);
            console.log(`Created: ${event.created_at}`);
            console.log(`Updated: ${event.updated_at || 'Never'}`);

            const now = new Date();
            const created = new Date(event.created_at);
            const minutesAgo = Math.floor((now - created) / 1000 / 60);

            console.log(`\n⏰ Created ${minutesAgo} minutes ago`);

            if (event.updated_at) {
                const updated = new Date(event.updated_at);
                const updateMinutesAgo = Math.floor((now - updated) / 1000 / 60);
                console.log(`⏰ Updated ${updateMinutesAgo} minutes ago`);
                console.log(`\n⚠️  Event was UPDATED after creation - this might have changed the approved status!`);
            }
        }

    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await pool.end();
    }
}

checkEventHistory();
