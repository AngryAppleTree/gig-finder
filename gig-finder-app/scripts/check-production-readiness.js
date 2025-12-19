/**
 * Check if production database is ready for event persistence system
 * Run this against production to see what migrations are needed
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load production env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.production.local') });

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkDatabase() {
    console.log('🔍 Checking production database readiness...\n');
    console.log(`📊 Database: ${process.env.POSTGRES_URL?.split('@')[1]}\n`);

    const client = await pool.connect();
    const issues = [];
    const ready = [];

    try {
        // 1. Check if venues table exists
        console.log('1️⃣  Checking venues table...');
        const venuesTable = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'venues'
            );
        `);

        if (venuesTable.rows[0].exists) {
            console.log('   ✅ venues table exists');
            ready.push('venues table');
        } else {
            console.log('   ❌ venues table MISSING');
            issues.push('venues table needs to be created');
        }

        // 2. Check events table structure
        console.log('\n2️⃣  Checking events table columns...');
        const eventsColumns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'events'
            ORDER BY column_name;
        `);

        const columnNames = eventsColumns.rows.map(r => r.column_name);

        // Check required columns
        const requiredColumns = {
            'venue_id': 'integer',
            'ticket_price': 'numeric',
            'approved': 'boolean',
            'fingerprint': 'character varying'
        };

        for (const [col, type] of Object.entries(requiredColumns)) {
            if (columnNames.includes(col)) {
                console.log(`   ✅ ${col} column exists`);
                ready.push(`${col} column`);
            } else {
                console.log(`   ❌ ${col} column MISSING`);
                issues.push(`${col} column needs to be added to events table`);
            }
        }

        // 3. Check if venue_id has foreign key constraint
        if (columnNames.includes('venue_id')) {
            console.log('\n3️⃣  Checking foreign key constraints...');
            const fkCheck = await client.query(`
                SELECT constraint_name 
                FROM information_schema.table_constraints 
                WHERE table_name = 'events' 
                AND constraint_type = 'FOREIGN KEY'
                AND constraint_name LIKE '%venue%';
            `);

            if (fkCheck.rows.length > 0) {
                console.log('   ✅ venue_id foreign key exists');
                ready.push('venue_id foreign key');
            } else {
                console.log('   ⚠️  venue_id foreign key missing (optional but recommended)');
            }
        }

        // 4. Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 SUMMARY\n');

        if (issues.length === 0) {
            console.log('✅ Production database is READY!');
            console.log('   All required tables and columns exist.');
            console.log('   The event persistence system will work correctly.\n');
        } else {
            console.log('❌ Production database needs migration!');
            console.log(`   Found ${issues.length} issue(s):\n`);
            issues.forEach((issue, i) => {
                console.log(`   ${i + 1}. ${issue}`);
            });
            console.log('\n💡 Next steps:');
            console.log('   Run the migration scripts in this order:');
            if (issues.some(i => i.includes('venues table'))) {
                console.log('   1. node scripts/create-venues-table.js');
            }
            if (issues.some(i => i.includes('ticket_price'))) {
                console.log('   2. node scripts/add-ticket-price.js');
            }
            if (issues.some(i => i.includes('approved'))) {
                console.log('   3. Create migration for approved column');
            }
            console.log('');
        }

        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('❌ Error checking database:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkDatabase();
