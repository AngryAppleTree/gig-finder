/**
 * Add approved column to events table
 * This allows auto-approval of scraped events
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('🔗 Connecting to database...');
    const client = await pool.connect();

    try {
        console.log('✅ Connected.');
        console.log(`📊 Database: ${process.env.POSTGRES_URL?.split('@')[1]}\n`);

        await client.query('BEGIN');

        // Add approved column
        console.log('🛠  Adding approved column to events table...');
        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;
        `);
        console.log('   ✅ approved column added');

        // Auto-approve existing events
        console.log('\n🔄 Auto-approving existing events...');
        const result = await client.query(`
            UPDATE events 
            SET approved = TRUE 
            WHERE approved IS NULL OR approved = FALSE;
        `);
        console.log(`   ✅ Approved ${result.rowCount} existing events`);

        await client.query('COMMIT');

        console.log('\n✅ Migration successful!');
        console.log('📊 Summary:');
        console.log('   - Added approved column to events table');
        console.log('   - Set default to FALSE for new events');
        console.log('   - Auto-approved all existing events\n');

        client.release();
        process.exit(0);
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Migration Failed:', e.message);
        client.release();
        process.exit(1);
    }
}

migrate();
