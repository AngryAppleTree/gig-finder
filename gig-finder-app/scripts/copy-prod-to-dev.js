const { Pool } = require('pg');
require('dotenv').config({ path: '.env.production.local' });

const PROD_URL = process.env.POSTGRES_URL;

require('dotenv').config({ path: '.env.local' });
const DEV_URL = process.env.POSTGRES_URL;

async function copyProdToDev() {
    console.log('🔍 PRODUCTION DATABASE COPY SCRIPT');
    console.log('=====================================\n');

    // STEP 1: READ FROM PRODUCTION (READ-ONLY)
    console.log('📖 Step 1: Reading from PRODUCTION (read-only)...\n');

    const prodPool = new Pool({
        connectionString: PROD_URL,
        ssl: { rejectUnauthorized: false }
    });

    const prodClient = await prodPool.connect();

    let prodVenues, prodEvents, prodBookings;

    try {
        // READ ONLY - SELECT statements
        prodVenues = await prodClient.query('SELECT * FROM venues ORDER BY id');
        prodEvents = await prodClient.query('SELECT * FROM events ORDER BY id');
        prodBookings = await prodClient.query('SELECT * FROM bookings ORDER BY id');

        console.log(`  ✅ Read ${prodVenues.rows.length} venues from production`);
        console.log(`  ✅ Read ${prodEvents.rows.length} events from production`);
        console.log(`  ✅ Read ${prodBookings.rows.length} bookings from production`);
        console.log('  ✅ Production connection closed (read-only)\n');

    } finally {
        prodClient.release();
        await prodPool.end();
    }

    // STEP 2: CHECK CURRENT DEV STATE
    console.log('📊 Step 2: Checking current DEV database...\n');

    const devPool = new Pool({
        connectionString: DEV_URL,
        ssl: { rejectUnauthorized: false }
    });

    const devClient = await devPool.connect();

    try {
        const devVenues = await devClient.query('SELECT COUNT(*) FROM venues');
        const devEvents = await devClient.query('SELECT COUNT(*) FROM events');
        const devBookings = await devClient.query('SELECT COUNT(*) FROM bookings');

        console.log(`  Current dev: ${devVenues.rows[0].count} venues, ${devEvents.rows[0].count} events, ${devBookings.rows[0].count} bookings`);
        console.log(`  Will replace with: ${prodVenues.rows.length} venues, ${prodEvents.rows.length} events, 0 bookings (sanitized)\n`);

        // STEP 3: WIPE DEV DATA
        console.log('🗑️  Step 3: Wiping DEV database...\n');

        await devClient.query('DELETE FROM bookings');
        console.log('  ✅ Deleted all bookings from dev');

        await devClient.query('DELETE FROM events');
        console.log('  ✅ Deleted all events from dev');

        await devClient.query('DELETE FROM venues');
        console.log('  ✅ Deleted all venues from dev\n');

        // STEP 4: COPY PRODUCTION DATA TO DEV
        console.log('📥 Step 4: Copying production data to DEV...\n');

        // Insert venues
        for (const venue of prodVenues.rows) {
            const columns = Object.keys(venue).join(', ');
            const values = Object.values(venue);
            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

            await devClient.query(
                `INSERT INTO venues (${columns}) VALUES (${placeholders})`,
                values
            );
        }
        console.log(`  ✅ Copied ${prodVenues.rows.length} venues to dev`);

        // Insert events
        for (const event of prodEvents.rows) {
            const columns = Object.keys(event).join(', ');
            const values = Object.values(event);
            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

            await devClient.query(
                `INSERT INTO events (${columns}) VALUES (${placeholders})`,
                values
            );
        }
        console.log(`  ✅ Copied ${prodEvents.rows.length} events to dev`);

        // DO NOT copy bookings - sanitize by leaving empty
        console.log(`  ✅ Sanitized bookings (0 copied - removed real user data)\n`);

        // STEP 5: VERIFY
        console.log('✅ Step 5: Verifying DEV database...\n');

        const finalVenues = await devClient.query('SELECT COUNT(*) FROM venues');
        const finalEvents = await devClient.query('SELECT COUNT(*) FROM events');
        const finalBookings = await devClient.query('SELECT COUNT(*) FROM bookings');

        console.log(`  Final dev state: ${finalVenues.rows[0].count} venues, ${finalEvents.rows[0].count} events, ${finalBookings.rows[0].count} bookings\n`);

        console.log('🎉 SUCCESS! Dev database now matches production (with sanitized bookings)');
        console.log('=====================================\n');

    } finally {
        devClient.release();
        await devPool.end();
    }
}

copyProdToDev().catch(err => {
    console.error('❌ ERROR:', err);
    process.exit(1);
});
