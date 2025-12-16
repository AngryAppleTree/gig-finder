/**
 * Clean Production Database
 * Deletes all events from the production database
 * USE WITH CAUTION - This will delete ALL events!
 */

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function cleanDatabase() {
    console.log('🧹 Starting database cleanup...');
    console.log('⚠️  WARNING: This will delete ALL events from production!');

    const client = await pool.connect();

    try {
        // Count events before deletion
        const countBefore = await client.query('SELECT COUNT(*) FROM events');
        console.log(`📊 Current events in database: ${countBefore.rows[0].count}`);

        // Delete all events
        const result = await client.query('DELETE FROM events');
        console.log(`✅ Deleted ${result.rowCount} events`);

        // Verify deletion
        const countAfter = await client.query('SELECT COUNT(*) FROM events');
        console.log(`📊 Events remaining: ${countAfter.rows[0].count}`);

        // Reset the sequence (so new IDs start from 1)
        await client.query('ALTER SEQUENCE events_id_seq RESTART WITH 1');
        console.log('🔄 Reset ID sequence to start from 1');

        console.log('✨ Database cleaned successfully!');

    } catch (error) {
        console.error('❌ Error cleaning database:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the cleanup
cleanDatabase()
    .then(() => {
        console.log('✅ Cleanup complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    });
