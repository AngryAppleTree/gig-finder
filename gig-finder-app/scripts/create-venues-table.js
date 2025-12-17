/**
 * Create venues table and migrate existing venue data
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('🔗 Connecting to database...');
    const client = await pool.connect();

    try {
        console.log('✅ Connected.');

        await client.query('BEGIN');

        // 1. Create venues table
        console.log('🛠  Creating venues table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS venues (
                id SERIAL PRIMARY KEY,
                name VARCHAR(200) NOT NULL UNIQUE,
                address TEXT,
                city VARCHAR(100),
                postcode VARCHAR(10),
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                capacity INTEGER,
                website VARCHAR(500),
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 2. Seed known venues
        console.log('🌱 Seeding known venues...');
        const knownVenues = [
            { name: 'The Banshee Labyrinth', city: 'Edinburgh', postcode: 'EH1 1SR', capacity: 200, lat: 55.9496, lon: -3.1882, website: 'https://www.thebansheelabyrinth.com' },
            { name: 'Sneaky Pete\'s', city: 'Edinburgh', postcode: 'EH1 1SR', capacity: 100, lat: 55.9506, lon: -3.1883, website: 'https://www.sneakypetes.co.uk' },
            { name: 'Leith Depot', city: 'Edinburgh', postcode: 'EH6 7EQ', capacity: 150, lat: 55.9765, lon: -3.1689, website: 'https://leithdepot.com' },
            { name: 'Stramash', city: 'Edinburgh', postcode: 'EH1 1QS', capacity: 250, lat: 55.9533, lon: -3.1883, website: 'https://stramashedinburgh.com' }
        ];

        for (const venue of knownVenues) {
            await client.query(`
                INSERT INTO venues (name, city, postcode, capacity, latitude, longitude, website)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (name) DO NOTHING
            `, [venue.name, venue.city, venue.postcode, venue.capacity, venue.lat, venue.lon, venue.website]);
            console.log(`  ✓ Added: ${venue.name}`);
        }

        // 3. Extract unique venues from events table
        console.log('📊 Extracting unique venues from events...');
        const uniqueVenues = await client.query(`
            SELECT DISTINCT venue 
            FROM events 
            WHERE venue IS NOT NULL 
            AND venue NOT IN (SELECT name FROM venues)
        `);

        for (const row of uniqueVenues.rows) {
            await client.query(`
                INSERT INTO venues (name)
                VALUES ($1)
                ON CONFLICT (name) DO NOTHING
            `, [row.venue]);
            console.log(`  ✓ Migrated: ${row.venue}`);
        }

        // 4. Add venue_id column to events
        console.log('🔗 Adding venue_id column to events...');
        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS venue_id INTEGER REFERENCES venues(id);
        `);

        // 5. Populate venue_id for existing events
        console.log('🔄 Mapping existing events to venues...');
        await client.query(`
            UPDATE events e
            SET venue_id = v.id
            FROM venues v
            WHERE e.venue = v.name
            AND e.venue_id IS NULL;
        `);

        const mappedCount = await client.query(`
            SELECT COUNT(*) FROM events WHERE venue_id IS NOT NULL
        `);
        console.log(`  ✓ Mapped ${mappedCount.rows[0].count} events to venues`);

        await client.query('COMMIT');

        console.log('');
        console.log('✅ Migration successful!');
        console.log('📊 Summary:');
        console.log('   - Created venues table');
        console.log('   - Seeded 4 known venues');
        console.log(`   - Migrated ${uniqueVenues.rows.length} additional venues`);
        console.log('   - Added venue_id to events table');
        console.log('   - Mapped existing events to venues');
        console.log('');
        console.log('⚠️  Note: Old "venue" column still exists for backward compatibility');
        console.log('   You can drop it later with: ALTER TABLE events DROP COLUMN venue;');

        client.release();
        process.exit(0);
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Migration Failed:', e.message);
        client.release();
        process.exit(1);
    }
}

migrate();
