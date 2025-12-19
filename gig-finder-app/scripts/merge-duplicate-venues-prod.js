require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function mergeDuplicateVenues() {
    const client = await pool.connect();
    try {
        console.log('🔧 Merging duplicate venues in PRODUCTION...\n');

        await client.query('BEGIN');

        // 1. Move Beat Generator Dundee events (93 → 100)
        console.log('1️⃣ Moving events from "Beat Generator Dundee" (93) to "Beat Generator" (100)...');
        let result = await client.query(
            'UPDATE events SET venue_id = $1 WHERE venue_id = $2 RETURNING id, name',
            [100, 93]
        );
        console.log(`   ✅ Moved ${result.rowCount} events:`);
        result.rows.forEach(e => console.log(`      - ${e.id}: ${e.name}`));

        // 2. Move Beat Generator Live events (102 → 100)
        console.log('\n2️⃣ Moving events from "Beat Generator Live" (102) to "Beat Generator" (100)...');
        result = await client.query(
            'UPDATE events SET venue_id = $1 WHERE venue_id = $2 RETURNING id, name',
            [100, 102]
        );
        console.log(`   ✅ Moved ${result.rowCount} events:`);
        result.rows.forEach(e => console.log(`      - ${e.id}: ${e.name}`));

        // 3. Check Bannerman's Biggar events - some might be Arcadia Music Cafe
        console.log('\n3️⃣ Checking Bannerman\'s Biggar events...');
        const biggarEvents = await client.query(
            'SELECT id, name FROM events WHERE venue_id = 43'
        );

        console.log(`   Found ${biggarEvents.rowCount} events:`);
        biggarEvents.rows.forEach(e => {
            console.log(`      - ${e.id}: ${e.name}`);
            if (e.name.toLowerCase().includes('arcadia')) {
                console.log(`        ⚠️  This mentions "Arcadia" - might need a different venue!`);
            }
        });

        // For now, let's create Arcadia Music Cafe venue and move those events
        console.log('\n4️⃣ Creating "Arcadia Music Cafe" venue in Biggar...');
        const arcadiaVenue = await client.query(`
            INSERT INTO venues (name, city, address)
            VALUES ('Arcadia Music Cafe', 'Biggar', 'High Street')
            ON CONFLICT DO NOTHING
            RETURNING id
        `);

        let arcadiaId;
        if (arcadiaVenue.rowCount > 0) {
            arcadiaId = arcadiaVenue.rows[0].id;
            console.log(`   ✅ Created venue ID: ${arcadiaId}`);
        } else {
            // Venue already exists, get its ID
            const existing = await client.query(
                'SELECT id FROM venues WHERE name = $1 AND city = $2',
                ['Arcadia Music Cafe', 'Biggar']
            );
            arcadiaId = existing.rows[0].id;
            console.log(`   ℹ️  Venue already exists, ID: ${arcadiaId}`);
        }

        // Move Arcadia events to Arcadia venue
        console.log('\n5️⃣ Moving Arcadia events to correct venue...');
        result = await client.query(`
            UPDATE events 
            SET venue_id = $1 
            WHERE venue_id = 43 AND name ILIKE '%arcadia%'
            RETURNING id, name
        `, [arcadiaId]);
        console.log(`   ✅ Moved ${result.rowCount} events to Arcadia Music Cafe`);
        result.rows.forEach(e => console.log(`      - ${e.id}: ${e.name}`));

        // Move remaining Bannerman's events to Edinburgh
        console.log('\n6️⃣ Moving remaining events from Bannerman\'s Biggar to Edinburgh...');
        result = await client.query(
            'UPDATE events SET venue_id = $1 WHERE venue_id = $2 RETURNING id, name',
            [10, 43]
        );
        console.log(`   ✅ Moved ${result.rowCount} events to Bannermans Edinburgh`);
        result.rows.forEach(e => console.log(`      - ${e.id}: ${e.name}`));

        // Delete empty duplicate venues
        console.log('\n7️⃣ Deleting empty duplicate venues...');
        await client.query('DELETE FROM venues WHERE id IN (93, 102, 43)');
        console.log('   ✅ Deleted venues: 93 (Beat Generator Dundee), 102 (Beat Generator Live), 43 (Bannerman\'s Biggar)');

        await client.query('COMMIT');
        console.log('\n✅ All duplicates merged successfully!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

mergeDuplicateVenues().catch(console.error);
