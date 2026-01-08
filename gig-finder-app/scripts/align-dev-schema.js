#!/usr/bin/env node

/**
 * Align Dev Database Schema with Production
 * 
 * This script checks for schema differences and adds missing columns to dev database
 * for all tables: venues, events, bookings, audit_logs
 */

const { Pool } = require('pg');

const TABLES_TO_ALIGN = ['venues', 'events', 'bookings', 'audit_logs'];

async function alignTableSchema(tableName, prodPool, devPool) {
    console.log(`\n📊 Checking ${tableName} table...`);

    // Get production schema
    const prodSchema = await prodPool.query(`
        SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
    `, [tableName]);

    if (prodSchema.rows.length === 0) {
        console.log(`   ⚠️  Table '${tableName}' does not exist in production, skipping`);
        return { missing: 0, added: 0 };
    }

    // Get dev schema
    const devSchema = await devPool.query(`
        SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
    `, [tableName]);

    if (devSchema.rows.length === 0) {
        console.log(`   ⚠️  Table '${tableName}' does not exist in dev, skipping`);
        return { missing: 0, added: 0 };
    }

    const prodColumns = prodSchema.rows.map(r => r.column_name);
    const devColumns = devSchema.rows.map(r => r.column_name);

    // Find missing columns
    const missingColumns = prodColumns.filter(col => !devColumns.includes(col));

    if (missingColumns.length === 0) {
        console.log(`   ✅ ${tableName}: Schema aligned (${prodColumns.length} columns)`);
        return { missing: 0, added: 0 };
    }

    console.log(`   ⚠️  ${tableName}: Found ${missingColumns.length} missing column(s):`);

    for (const colName of missingColumns) {
        const prodCol = prodSchema.rows.find(r => r.column_name === colName);
        console.log(`      - ${colName} (${prodCol.data_type})`);
    }

    console.log(`\n   🔧 Adding missing columns to ${tableName}...`);

    let addedCount = 0;
    for (const colName of missingColumns) {
        const prodCol = prodSchema.rows.find(r => r.column_name === colName);

        let dataType = prodCol.data_type.toUpperCase();

        // Handle specific data types
        if (prodCol.data_type === 'character varying' && prodCol.character_maximum_length) {
            dataType = `VARCHAR(${prodCol.character_maximum_length})`;
        } else if (prodCol.data_type === 'character' && prodCol.character_maximum_length) {
            dataType = `CHAR(${prodCol.character_maximum_length})`;
        } else if (prodCol.data_type === 'text') {
            dataType = 'TEXT';
        } else if (prodCol.data_type === 'integer') {
            dataType = 'INTEGER';
        } else if (prodCol.data_type === 'bigint') {
            dataType = 'BIGINT';
        } else if (prodCol.data_type === 'boolean') {
            dataType = 'BOOLEAN';
        } else if (prodCol.data_type === 'timestamp without time zone') {
            dataType = 'TIMESTAMP';
        } else if (prodCol.data_type === 'timestamp with time zone') {
            dataType = 'TIMESTAMPTZ';
        } else if (prodCol.data_type === 'jsonb') {
            dataType = 'JSONB';
        } else if (prodCol.data_type === 'numeric') {
            dataType = 'NUMERIC';
        }

        // Build ALTER TABLE query
        let alterQuery = `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${colName} ${dataType}`;

        // Add default value if exists
        if (prodCol.column_default) {
            alterQuery += ` DEFAULT ${prodCol.column_default}`;
        }

        // Add NOT NULL constraint if needed (but only if there's a default or table is empty)
        if (prodCol.is_nullable === 'NO') {
            // Check if dev table is empty or has a default
            const countResult = await devPool.query(`SELECT COUNT(*) FROM ${tableName}`);
            const rowCount = parseInt(countResult.rows[0].count);

            if (rowCount === 0 || prodCol.column_default) {
                alterQuery += ' NOT NULL';
            } else {
                console.log(`      ⚠️  Skipping NOT NULL for ${colName} (table has data and no default)`);
            }
        }

        try {
            console.log(`      Adding: ${colName} ${dataType}`);
            await devPool.query(alterQuery);
            console.log(`      ✅ Added ${colName}`);
            addedCount++;
        } catch (error) {
            console.log(`      ❌ Failed to add ${colName}: ${error.message}`);
        }
    }

    return { missing: missingColumns.length, added: addedCount };
}

async function alignSchemas() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  Align Dev Database Schema with Production                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const prodUrl = process.env.PROD_POSTGRES_URL;
    const devUrl = process.env.DEV_POSTGRES_URL;

    if (!prodUrl || !devUrl) {
        console.error('❌ ERROR: PROD_POSTGRES_URL and DEV_POSTGRES_URL must be set');
        process.exit(1);
    }

    const prodPool = new Pool({ connectionString: prodUrl, ssl: { rejectUnauthorized: false } });
    const devPool = new Pool({ connectionString: devUrl, ssl: { rejectUnauthorized: false } });

    try {
        let totalMissing = 0;
        let totalAdded = 0;

        for (const tableName of TABLES_TO_ALIGN) {
            const result = await alignTableSchema(tableName, prodPool, devPool);
            totalMissing += result.missing;
            totalAdded += result.added;
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Summary:');
        console.log('='.repeat(60));
        console.log(`   Total missing columns found: ${totalMissing}`);
        console.log(`   Total columns added: ${totalAdded}`);

        if (totalMissing === 0) {
            console.log('\n✅ All schemas are aligned!\n');
        } else if (totalAdded === totalMissing) {
            console.log('\n✅ Schema alignment complete!\n');
            console.log('You can now run the sync script:\n');
            console.log('   node scripts/sync-prod-to-preview.js\n');
        } else {
            console.log('\n⚠️  Some columns could not be added. Check errors above.\n');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await prodPool.end();
        await devPool.end();
    }
}

alignSchemas();
