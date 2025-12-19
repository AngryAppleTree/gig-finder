require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function listDuplicateEvents() {
    const client = await pool.connect();
    try {
        console.log('📋 Events for duplicate venues:\n');

        // Beat Generator Dundee (ID 93)
        console.log('═══════════════════════════════════════════════════════');
        console.log('BEAT GENERATOR DUNDEE (ID 93) - 2 events');
        console.log('Should be moved to: Beat Generator (ID 100)');
        console.log('═══════════════════════════════════════════════════════');
        let result = await client.query(`
            SELECT id, name, date, price
            FROM events
            WHERE venue_id = 93
            ORDER BY date
        `);
        result.rows.forEach(e => {
            console.log(`  ${e.id}: ${e.name} | ${new Date(e.date).toLocaleDateString()} | ${e.price}`);
        });

        // Beat Generator Live (ID 102)
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('BEAT GENERATOR LIVE (ID 102) - 1 event');
        console.log('Should be moved to: Beat Generator (ID 100)');
        console.log('═══════════════════════════════════════════════════════');
        result = await client.query(`
            SELECT id, name, date, price
            FROM events
            WHERE venue_id = 102
            ORDER BY date
        `);
        result.rows.forEach(e => {
            console.log(`  ${e.id}: ${e.name} | ${new Date(e.date).toLocaleDateString()} | ${e.price}`);
        });

        // Bannerman's Biggar (ID 43)
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('BANNERMAN\'S BIGGAR (ID 43) - 3 events');
        console.log('Should be moved to: Bannermans Edinburgh (ID 10)');
        console.log('═══════════════════════════════════════════════════════');
        result = await client.query(`
            SELECT id, name, date, price
            FROM events
            WHERE venue_id = 43
            ORDER BY date
        `);
        result.rows.forEach(e => {
            console.log(`  ${e.id}: ${e.name} | ${new Date(e.date).toLocaleDateString()} | ${e.price}`);
        });

        console.log('\n\n📊 Summary:');
        console.log('Total events to reassign: 6');
        console.log('  - 3 from Beat Generator duplicates → Beat Generator (ID 100)');
        console.log('  - 3 from Bannerman\'s Biggar → Bannermans Edinburgh (ID 10)');

    } finally {
        client.release();
        await pool.end();
    }
}

listDuplicateEvents().catch(console.error);
