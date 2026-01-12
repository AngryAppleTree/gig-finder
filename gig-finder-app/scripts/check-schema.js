// Check events table schema
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkSchema() {
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
    });

    try {
        console.log('🔍 Checking events table schema...\n');

        const result = await pool.query(`
            SELECT 
                column_name, 
                data_type, 
                column_default,
                is_nullable
            FROM information_schema.columns
            WHERE table_name = 'events' 
            AND column_name IN ('approved', 'verified')
            ORDER BY ordinal_position
        `);

        console.log('📋 Schema for approved/verified columns:');
        result.rows.forEach(row => {
            console.log(`\nColumn: ${row.column_name}`);
            console.log(`Type: ${row.data_type}`);
            console.log(`Default: ${row.column_default || 'NULL'}`);
            console.log(`Nullable: ${row.is_nullable}`);
        });

    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await pool.end();
    }
}

checkSchema();
