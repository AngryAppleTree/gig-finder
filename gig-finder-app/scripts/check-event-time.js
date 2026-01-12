// Simple check of event creation time
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkEventTime() {
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
    });

    try {
        const result = await pool.query(`
            SELECT 
                id,
                name,
                approved,
                user_id,
                created_at
            FROM events
            WHERE id = 1218
        `);

        if (result.rows.length > 0) {
            const event = result.rows[0];
            console.log('📋 Event #1218:');
            console.log(`Name: ${event.name}`);
            console.log(`User ID: ${event.user_id}`);
            console.log(`Approved: ${event.approved}`);
            console.log(`Created: ${event.created_at}`);

            const now = new Date();
            const created = new Date(event.created_at);
            const minutesAgo = Math.floor((now - created) / 1000 / 60);

            console.log(`\n⏰ Created ${minutesAgo} minutes ago`);
            console.log(`\n💡 SOLUTION: This event has approved=false`);
            console.log(`To fix it and make it appear in search results, run:`);
            console.log(`\nUPDATE events SET approved = true WHERE id = 1218;`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkEventTime();
