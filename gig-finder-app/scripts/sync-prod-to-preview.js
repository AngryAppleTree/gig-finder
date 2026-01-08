#!/usr/bin/env node

/**
 * Sync Production Database to Preview/Dev Database
 * 
 * This script:
 * 1. Exports data from gig-finder-prod (Production)
 * 2. Anonymizes sensitive data (bookings, audit logs)
 * 3. Imports to gig-finder-dev (Preview/Dev)
 * 4. Resets sequences
 * 5. Verifies data integrity
 * 
 * Usage:
 *   node scripts/sync-prod-to-preview.js [--dry-run] [--skip-confirmation]
 * 
 * Environment Variables Required:
 *   PROD_POSTGRES_URL - Connection string for gig-finder-prod
 *   DEV_POSTGRES_URL  - Connection string for gig-finder-dev (or use POSTGRES_URL from .env.local)
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_CONFIRMATION = args.includes('--skip-confirmation');

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'bright');
    console.log('='.repeat(60));
}

// Database connections
let prodPool, devPool;

// Tables to sync (in order due to foreign key constraints)
const TABLES_TO_SYNC = [
    { name: 'venues', anonymize: false },
    { name: 'events', anonymize: false },
    { name: 'bookings', anonymize: true },
    { name: 'audit_logs', anonymize: true }
];

/**
 * Anonymize sensitive data in a row
 */
function anonymizeRow(tableName, row, index) {
    const anonymized = { ...row };

    if (tableName === 'bookings') {
        // Anonymize customer information
        anonymized.customer_name = `Test User ${index + 1}`;
        anonymized.customer_email = `test-booking-${index + 1}@example.com`;

        // Replace Stripe payment IDs if they exist
        if (anonymized.stripe_payment_intent_id) {
            anonymized.stripe_payment_intent_id = `pi_test_${Math.random().toString(36).substring(7)}`;
        }
        if (anonymized.stripe_session_id) {
            anonymized.stripe_session_id = `cs_test_${Math.random().toString(36).substring(7)}`;
        }
    }

    if (tableName === 'audit_logs') {
        // Anonymize user information in audit logs
        if (anonymized.user_email) {
            anonymized.user_email = `test-user-${index + 1}@example.com`;
        }
        if (anonymized.ip_address) {
            anonymized.ip_address = '127.0.0.1';
        }
        // Anonymize details JSON if it contains sensitive info
        if (anonymized.details && typeof anonymized.details === 'object') {
            const details = anonymized.details;
            if (details.email) details.email = `test-${index + 1}@example.com`;
            if (details.customerEmail) details.customerEmail = `test-${index + 1}@example.com`;
            if (details.customerName) details.customerName = `Test User ${index + 1}`;
            anonymized.details = details;
        }
    }

    return anonymized;
}

/**
 * Ask user for confirmation
 */
function askConfirmation(question) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`${colors.yellow}${question} (yes/no): ${colors.reset}`, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
        });
    });
}

/**
 * Initialize database connections
 */
async function initConnections() {
    logSection('🔗 Initializing Database Connections');

    // Production connection
    const prodUrl = process.env.PROD_POSTGRES_URL;
    if (!prodUrl) {
        log('❌ ERROR: PROD_POSTGRES_URL environment variable not set', 'red');
        log('   Set it to your gig-finder-prod connection string', 'yellow');
        process.exit(1);
    }

    // Dev connection (use DEV_POSTGRES_URL or fall back to POSTGRES_URL from .env.local)
    const devUrl = process.env.DEV_POSTGRES_URL || process.env.POSTGRES_URL;
    if (!devUrl) {
        log('❌ ERROR: DEV_POSTGRES_URL or POSTGRES_URL environment variable not set', 'red');
        log('   Set it to your gig-finder-dev connection string', 'yellow');
        process.exit(1);
    }

    // Extract database names and hosts for verification
    const prodDbName = prodUrl.match(/\/([^/?]+)(\?|$)/)?.[1] || 'unknown';
    const devDbName = devUrl.match(/\/([^/?]+)(\?|$)/)?.[1] || 'unknown';

    // Extract host/project identifiers (Neon uses project-specific hosts)
    const prodHost = prodUrl.match(/@([^/]+)\//)?.[1] || 'unknown';
    const devHost = devUrl.match(/@([^/]+)\//)?.[1] || 'unknown';

    log(`Production DB: ${prodDbName} (host: ${prodHost})`, 'cyan');
    log(`Dev/Preview DB: ${devDbName} (host: ${devHost})`, 'cyan');

    // Safety check 1: ensure production and dev use different hosts/projects
    if (prodHost === devHost) {
        log('❌ ERROR: Production and Dev are using the SAME Neon project/host!', 'red');
        log(`   Both use host: ${prodHost}`, 'yellow');
        log('   This would sync a database to itself!', 'yellow');
        log('   Make sure PROD_POSTGRES_URL and DEV_POSTGRES_URL point to different projects.', 'yellow');
        process.exit(1);
    }

    // Safety check 2: ensure connection strings are actually different
    if (prodUrl === devUrl) {
        log('❌ ERROR: Production and Dev connection strings are IDENTICAL!', 'red');
        log('   This would wipe and re-import the same database!', 'yellow');
        process.exit(1);
    }

    // Safety check 3: Verify user intent by checking for expected patterns
    // Since both databases might be named 'neondb', we check the host contains project identifiers
    const prodProjectMatch = prodHost.match(/(prod|production|autumn-term-64001147)/i);
    const devProjectMatch = devHost.match(/(dev|preview|development|winter-bonus-91908088)/i);

    if (!prodProjectMatch && !devProjectMatch) {
        log('⚠️  WARNING: Cannot auto-detect which database is production vs dev', 'yellow');
        log(`   Production host: ${prodHost}`, 'yellow');
        log(`   Dev host: ${devHost}`, 'yellow');
        log('   Please verify you have set the correct connection strings!', 'yellow');
        console.log('\n');

        // Show a clear summary
        log('📋 Summary:', 'bright');
        log(`   PROD_POSTGRES_URL points to: ${prodDbName} @ ${prodHost}`, 'cyan');
        log(`   DEV_POSTGRES_URL points to: ${devDbName} @ ${devHost}`, 'cyan');
        console.log('\n');
    } else {
        log('✅ Database identification looks correct', 'green');
        if (prodProjectMatch) log(`   Production project detected: ${prodProjectMatch[0]}`, 'cyan');
        if (devProjectMatch) log(`   Dev project detected: ${devProjectMatch[0]}`, 'cyan');
    }

    prodPool = new Pool({
        connectionString: prodUrl,
        ssl: { rejectUnauthorized: false }
    });

    devPool = new Pool({
        connectionString: devUrl,
        ssl: { rejectUnauthorized: false }
    });

    // Test connections
    try {
        await prodPool.query('SELECT NOW()');
        log('✅ Connected to Production database', 'green');
    } catch (error) {
        log(`❌ Failed to connect to Production: ${error.message}`, 'red');
        process.exit(1);
    }

    try {
        await devPool.query('SELECT NOW()');
        log('✅ Connected to Dev/Preview database', 'green');
    } catch (error) {
        log(`❌ Failed to connect to Dev/Preview: ${error.message}`, 'red');
        process.exit(1);
    }

    return { prodDbName, devDbName };
}

/**
 * Get row counts from production
 */
async function getProductionCounts() {
    logSection('📊 Checking Production Data');

    const counts = {};
    for (const table of TABLES_TO_SYNC) {
        try {
            const result = await prodPool.query(`SELECT COUNT(*) FROM ${table.name}`);
            counts[table.name] = parseInt(result.rows[0].count);
            log(`  ${table.name}: ${counts[table.name]} rows`, 'cyan');
        } catch (error) {
            if (error.message.includes('does not exist')) {
                counts[table.name] = 0;
                log(`  ${table.name}: Table does not exist (will skip)`, 'yellow');
            } else {
                throw error;
            }
        }
    }

    return counts;
}

/**
 * Export data from production
 */
async function exportFromProduction() {
    logSection('📤 Exporting Data from Production');

    const exportedData = {};

    for (const table of TABLES_TO_SYNC) {
        try {
            const result = await prodPool.query(`SELECT * FROM ${table.name} ORDER BY id`);
            exportedData[table.name] = result.rows;
            log(`✅ Exported ${result.rows.length} rows from ${table.name}`, 'green');
        } catch (error) {
            if (error.message.includes('does not exist')) {
                exportedData[table.name] = [];
                log(`⚠️  Table ${table.name} does not exist, skipping`, 'yellow');
            } else {
                throw error;
            }
        }
    }

    return exportedData;
}

/**
 * Anonymize exported data
 */
function anonymizeData(exportedData) {
    logSection('🔒 Anonymizing Sensitive Data');

    const anonymizedData = {};

    for (const table of TABLES_TO_SYNC) {
        const rows = exportedData[table.name] || [];

        if (table.anonymize && rows.length > 0) {
            anonymizedData[table.name] = rows.map((row, index) =>
                anonymizeRow(table.name, row, index)
            );
            log(`✅ Anonymized ${rows.length} rows in ${table.name}`, 'green');
        } else {
            anonymizedData[table.name] = rows;
            log(`  Copied ${rows.length} rows from ${table.name} (no anonymization needed)`, 'cyan');
        }
    }

    return anonymizedData;
}

/**
 * Wipe dev database
 */
async function wipeDevDatabase() {
    logSection('🗑️  Wiping Dev/Preview Database');

    if (DRY_RUN) {
        log('  [DRY RUN] Would truncate all tables', 'yellow');
        return;
    }

    // Truncate in reverse order to respect foreign key constraints
    const reverseTables = [...TABLES_TO_SYNC].reverse();

    for (const table of reverseTables) {
        try {
            await devPool.query(`TRUNCATE TABLE ${table.name} CASCADE`);
            log(`✅ Truncated ${table.name}`, 'green');
        } catch (error) {
            if (error.message.includes('does not exist')) {
                log(`⚠️  Table ${table.name} does not exist, skipping`, 'yellow');
            } else {
                throw error;
            }
        }
    }
}

/**
 * Import data to dev database
 */
async function importToDevDatabase(anonymizedData) {
    logSection('📥 Importing Data to Dev/Preview Database');

    if (DRY_RUN) {
        log('  [DRY RUN] Would import data to dev database', 'yellow');
        for (const table of TABLES_TO_SYNC) {
            const rows = anonymizedData[table.name] || [];
            log(`    ${table.name}: ${rows.length} rows`, 'cyan');
        }
        return;
    }

    for (const table of TABLES_TO_SYNC) {
        const rows = anonymizedData[table.name] || [];

        if (rows.length === 0) {
            log(`  Skipping ${table.name} (no data)`, 'yellow');
            continue;
        }

        // Get column names from first row
        const columns = Object.keys(rows[0]);
        const columnList = columns.join(', ');
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        let imported = 0;
        for (const row of rows) {
            const values = columns.map(col => {
                const value = row[col];
                // Handle JSON/JSONB columns
                if (typeof value === 'object' && value !== null) {
                    return JSON.stringify(value);
                }
                return value;
            });

            try {
                await devPool.query(
                    `INSERT INTO ${table.name} (${columnList}) VALUES (${placeholders})`,
                    values
                );
                imported++;
            } catch (error) {
                log(`  ⚠️  Error importing row ${imported + 1} to ${table.name}: ${error.message}`, 'yellow');
            }
        }

        log(`✅ Imported ${imported}/${rows.length} rows to ${table.name}`, 'green');
    }
}

/**
 * Reset sequences
 */
async function resetSequences() {
    logSection('🔄 Resetting Database Sequences');

    if (DRY_RUN) {
        log('  [DRY RUN] Would reset sequences', 'yellow');
        return;
    }

    for (const table of TABLES_TO_SYNC) {
        try {
            // Check if table has any rows
            const countResult = await devPool.query(`SELECT COUNT(*) FROM ${table.name}`);
            const count = parseInt(countResult.rows[0].count);

            if (count > 0) {
                // Reset sequence to max ID
                await devPool.query(
                    `SELECT setval('${table.name}_id_seq', (SELECT MAX(id) FROM ${table.name}))`
                );
                log(`✅ Reset sequence for ${table.name}`, 'green');
            } else {
                log(`  Skipping ${table.name} (no rows)`, 'yellow');
            }
        } catch (error) {
            if (error.message.includes('does not exist')) {
                log(`  Skipping ${table.name} (table or sequence does not exist)`, 'yellow');
            } else {
                log(`  ⚠️  Error resetting sequence for ${table.name}: ${error.message}`, 'yellow');
            }
        }
    }
}

/**
 * Verify data integrity
 */
async function verifyDataIntegrity() {
    logSection('✅ Verifying Data Integrity');

    const results = {};

    for (const table of TABLES_TO_SYNC) {
        try {
            const result = await devPool.query(`SELECT COUNT(*) FROM ${table.name}`);
            results[table.name] = parseInt(result.rows[0].count);
            log(`  ${table.name}: ${results[table.name]} rows`, 'cyan');
        } catch (error) {
            results[table.name] = 0;
            log(`  ${table.name}: Error - ${error.message}`, 'yellow');
        }
    }

    // Check for orphaned records
    try {
        const orphanedEvents = await devPool.query(`
            SELECT COUNT(*) FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE e.venue_id IS NOT NULL AND v.id IS NULL
        `);
        const orphanedCount = parseInt(orphanedEvents.rows[0].count);
        if (orphanedCount > 0) {
            log(`  ⚠️  Found ${orphanedCount} orphaned events (no matching venue)`, 'yellow');
        } else {
            log(`  ✅ No orphaned events`, 'green');
        }
    } catch (error) {
        log(`  ⚠️  Could not check for orphaned events: ${error.message}`, 'yellow');
    }

    try {
        const orphanedBookings = await devPool.query(`
            SELECT COUNT(*) FROM bookings b
            LEFT JOIN events e ON b.event_id = e.id
            WHERE e.id IS NULL
        `);
        const orphanedCount = parseInt(orphanedBookings.rows[0].count);
        if (orphanedCount > 0) {
            log(`  ⚠️  Found ${orphanedCount} orphaned bookings (no matching event)`, 'yellow');
        } else {
            log(`  ✅ No orphaned bookings`, 'green');
        }
    } catch (error) {
        log(`  ⚠️  Could not check for orphaned bookings: ${error.message}`, 'yellow');
    }

    return results;
}

/**
 * Main execution
 */
async function main() {
    console.log('\n');
    log('╔════════════════════════════════════════════════════════════╗', 'bright');
    log('║  GigFinder: Sync Production to Preview/Dev Database       ║', 'bright');
    log('╚════════════════════════════════════════════════════════════╝', 'bright');

    if (DRY_RUN) {
        log('\n🔍 DRY RUN MODE - No changes will be made\n', 'yellow');
    }

    try {
        // Initialize connections
        const { prodDbName, devDbName } = await initConnections();

        // Get production counts
        const prodCounts = await getProductionCounts();

        // Confirmation
        if (!SKIP_CONFIRMATION && !DRY_RUN) {
            console.log('\n');
            log('⚠️  WARNING: This will WIPE all data in the Dev/Preview database!', 'red');
            log(`   Target database: ${devDbName}`, 'yellow');
            log(`   This action cannot be undone!`, 'yellow');
            console.log('\n');

            const confirmed = await askConfirmation('Are you sure you want to continue?');
            if (!confirmed) {
                log('\n❌ Operation cancelled by user', 'yellow');
                process.exit(0);
            }
        }

        // Export from production
        const exportedData = await exportFromProduction();

        // Anonymize data
        const anonymizedData = anonymizeData(exportedData);

        // Wipe dev database
        await wipeDevDatabase();

        // Import to dev database
        await importToDevDatabase(anonymizedData);

        // Reset sequences
        await resetSequences();

        // Verify integrity
        const devCounts = await verifyDataIntegrity();

        // Summary
        logSection('📊 Sync Summary');
        log('Production → Dev/Preview:', 'bright');
        for (const table of TABLES_TO_SYNC) {
            const prod = prodCounts[table.name] || 0;
            const dev = devCounts[table.name] || 0;
            const status = prod === dev ? '✅' : '⚠️';
            log(`  ${status} ${table.name}: ${prod} → ${dev}`, prod === dev ? 'green' : 'yellow');
        }

        console.log('\n');
        if (DRY_RUN) {
            log('✅ Dry run completed successfully!', 'green');
            log('   Run without --dry-run to perform actual sync', 'cyan');
        } else {
            log('✅ Sync completed successfully!', 'green');
            log('   Dev/Preview database now mirrors Production (with anonymized data)', 'cyan');
        }
        console.log('\n');

    } catch (error) {
        console.log('\n');
        log('❌ Sync failed!', 'red');
        log(`   Error: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    } finally {
        // Close connections
        if (prodPool) await prodPool.end();
        if (devPool) await devPool.end();
    }
}

// Run the script
main();
