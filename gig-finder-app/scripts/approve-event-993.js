const { Pool } = require('pg');

async function approveEvent() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        // Approve event 993
        await pool.query('UPDATE events SET approved = true WHERE id = 993');
        console.log('✅ Event 993 approved!');

        // Verify
        const check = await pool.query('SELECT id, name, approved FROM events WHERE id = 993');
        console.log('\nEvent details:');
        console.log(check.rows[0]);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

approveEvent();
