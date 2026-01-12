// Check if is_internal_ticketing column exists and what values it has
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkInternalTicketing() {
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
    });

    try {
        console.log('🔍 Checking is_internal_ticketing column...\n');

        // Check if column exists
        const schemaResult = await pool.query(`
            SELECT 
                column_name, 
                data_type, 
                column_default,
                is_nullable
            FROM information_schema.columns
            WHERE table_name = 'events' 
            AND column_name = 'is_internal_ticketing'
        `);

        if (schemaResult.rows.length === 0) {
            console.log('❌ Column "is_internal_ticketing" does NOT exist in events table!');
            console.log('\n📋 Available columns in events table:');

            const allColumns = await pool.query(`
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'events'
                ORDER BY ordinal_position
            `);

            allColumns.rows.forEach((row, i) => {
                console.log(`${i + 1}. ${row.column_name}`);
            });

            console.log('\n💡 SOLUTION: Run the migration to add this column!');
        } else {
            console.log('✅ Column exists in schema:');
            console.log(`   Type: ${schemaResult.rows[0].data_type}`);
            console.log(`   Default: ${schemaResult.rows[0].column_default || 'NULL'}`);
            console.log(`   Nullable: ${schemaResult.rows[0].is_nullable}\n`);

            // Check actual data
            const dataResult = await pool.query(`
                SELECT 
                    id,
                    name,
                    is_internal_ticketing,
                    sell_tickets
                FROM events
                WHERE user_id IS NOT NULL
                ORDER BY id DESC
                LIMIT 5
            `);

            console.log('📋 Sample of recent user events:');
            console.log('━'.repeat(80));
            dataResult.rows.forEach(row => {
                console.log(`ID: ${row.id} | ${row.name}`);
                console.log(`   is_internal_ticketing: ${row.is_internal_ticketing}`);
                console.log(`   sell_tickets: ${row.sell_tickets}`);
                console.log('');
            });
        }

    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await pool.end();
    }
}

checkInternalTicketing();
