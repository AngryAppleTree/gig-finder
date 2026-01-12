// Debug: Check what value is actually being passed for approved
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function debugApprovalLogic() {
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
    });

    try {
        console.log('🔍 Testing approval logic...\n');

        // Simulate the exact logic from manual/route.ts line 193-203
        const needsApproval = false;
        const isVerified = false;

        console.log(`needsApproval = ${needsApproval}`);
        console.log(`isVerified = ${isVerified}`);
        console.log(`\nIn the INSERT statement, parameter 17 should be: true`);
        console.log(`(because the code says: approved = true on line 203)\n`);

        // Check if there are any triggers on the events table
        const triggerResult = await pool.query(`
            SELECT 
                trigger_name,
                event_manipulation,
                action_statement
            FROM information_schema.triggers
            WHERE event_object_table = 'events'
        `);

        if (triggerResult.rows.length > 0) {
            console.log('⚠️  Found triggers on events table:');
            triggerResult.rows.forEach(row => {
                console.log(`\nTrigger: ${row.trigger_name}`);
                console.log(`Event: ${row.event_manipulation}`);
                console.log(`Action: ${row.action_statement}`);
            });
        } else {
            console.log('✅ No triggers found on events table\n');
        }

        // Check the actual event to see what user_id created it
        const eventResult = await pool.query(`
            SELECT user_id, approved, verified, created_at
            FROM events
            WHERE name LIKE '%GIG A%1767973093567%'
        `);

        if (eventResult.rows.length > 0) {
            console.log('📋 Event details:');
            console.log(`User ID: ${eventResult.rows[0].user_id}`);
            console.log(`Approved: ${eventResult.rows[0].approved}`);
            console.log(`Verified: ${eventResult.rows[0].verified}`);
            console.log(`Created: ${eventResult.rows[0].created_at}`);
        }

    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await pool.end();
    }
}

debugApprovalLogic();
