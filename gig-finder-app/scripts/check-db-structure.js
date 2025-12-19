/**
 * Quick check of production database structure
 * Verifies all required tables and columns exist
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

// Use POSTGRES_URL from environment or .env.local
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkDatabase() {
    console.log('🔍 Checking database structure...\n');
    console.log(`📊 Database: ${process.env.POSTGRES_URL?.split('@')[1]?.split('/')[0]}\n`);

    const client = await pool.connect();

    try {
        // Check venues table
        console.log('1️⃣  Checking venues table...');
        const venuesCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'venues'
            );
        `);

        if (venuesCheck.rows[0].exists) {
            const venueCount = await client.query('SELECT COUNT(*) FROM venues');
            console.log(`   ✅ venues table exists (${venueCount.rows[0].count} venues)`);
        } else {
            console.log('   ❌ venues table MISSING');
        }

        // Check events table columns
        console.log('\n2️⃣  Checking events table columns...');
        const columnsCheck = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'events'
            AND column_name IN ('venue_id', 'ticket_price', 'approved', 'fingerprint')
            ORDER BY column_name;
        `);

        const foundColumns = columnsCheck.rows.map(r => r.column_name);
        const requiredColumns = ['venue_id', 'ticket_price', 'approved', 'fingerprint'];

        requiredColumns.forEach(col => {
            if (foundColumns.includes(col)) {
                const colInfo = columnsCheck.rows.find(r => r.column_name === col);
                console.log(`   ✅ ${col} (${colInfo.data_type})`);
            } else {
                console.log(`   ❌ ${col} MISSING`);
            }
        });

        // Check for duplicate venues
        console.log('\n3️⃣  Checking for duplicate venues...');
        const duplicates = await client.query(`
            SELECT LOWER(name) as name_lower, COUNT(*) as count
            FROM venues
            GROUP BY LOWER(name)
            HAVING COUNT(*) > 1;
        `);

        if (duplicates.rows.length > 0) {
            console.log(`   ⚠️  Found ${duplicates.rows.length} duplicate venue name(s):`);
            duplicates.rows.forEach(d => {
                console.log(`      - "${d.name}" (${d.count} times)`);
            });
        } else {
            console.log('   ✅ No duplicate venues');
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        const allColumnsExist = requiredColumns.every(col => foundColumns.includes(col));
        const venuesExists = venuesCheck.rows[0].exists;

        if (allColumnsExist && venuesExists) {
            console.log('✅ DATABASE IS READY!');
            console.log('   All required tables and columns exist.');
            console.log('   Event persistence system will work correctly.\n');
        } else {
            console.log('❌ DATABASE NEEDS ATTENTION');
            console.log('   Some required structures are missing.');
            console.log('   Review the issues above.\n');
        }
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

checkDatabase();
