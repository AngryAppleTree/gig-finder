require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function fixSneakyPetes() {
    const client = await pool.connect();
    try {
        console.log('🔧 Fixing Sneaky Petes duplicate in production...\n');

        await client.query('BEGIN');

        // Check current state
        const check = await client.query(`
            SELECT id, name, city FROM venues 
            WHERE LOWER(name) LIKE '%sneaky%pete%'
            ORDER BY id
        `);

        console.log('Current Sneaky Pete venues:');
        check.rows.forEach(v => {
            console.log(`   ID ${v.id}: "${v.name}" (${v.city})`);
        });

        // Merge ID 34 into ID 2
        console.log('\n🔄 Merging ID 34 → ID 2...');

        const updateEvents = await client.query(
            'UPDATE events SET venue_id = 2 WHERE venue_id = 34 RETURNING id'
        );
        console.log(`✅ Moved ${updateEvents.rowCount} events`);

        const deleteVenue = await client.query(
            'DELETE FROM venues WHERE id = 34 RETURNING name'
        );
        console.log(`🗑️  Deleted venue: "${deleteVenue.rows[0].name}"`);

        await client.query('COMMIT');
        console.log('\n✅ Merge complete!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixSneakyPetes().catch(console.error);
