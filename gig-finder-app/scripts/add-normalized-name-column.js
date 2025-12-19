require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function addNormalizedNameColumn() {
    const client = await pool.connect();
    try {
        console.log('🔧 Adding normalized_name column to venues table...\n');

        // Step 1: Add the column
        await client.query(`
            ALTER TABLE venues 
            ADD COLUMN IF NOT EXISTS normalized_name VARCHAR(200)
        `);
        console.log('✅ Added normalized_name column');

        // Step 2: Populate existing data with normalized names
        console.log('\n🔄 Populating normalized_name for existing venues...');

        const updateResult = await client.query(`
            UPDATE venues 
            SET normalized_name = LOWER(
                TRIM(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(name, '^The ', '', 'i'),
                        '[^a-zA-Z0-9\\s]', '', 'g'
                    )
                )
            )
            WHERE normalized_name IS NULL
        `);

        console.log(`✅ Updated ${updateResult.rowCount} venues with normalized names`);

        // Step 3: Create unique index
        console.log('\n🔒 Creating unique index on (normalized_name, city)...');

        try {
            await client.query(`
                CREATE UNIQUE INDEX IF NOT EXISTS idx_venues_normalized_unique 
                ON venues(normalized_name, city)
            `);
            console.log('✅ Created unique index');
        } catch (error) {
            if (error.code === '23505') {
                console.log('⚠️  Unique constraint violation detected!');
                console.log('   This means there are still duplicates that need to be merged.');

                // Show duplicates
                const dupes = await client.query(`
                    SELECT normalized_name, city, COUNT(*) as count, 
                           ARRAY_AGG(id) as ids, ARRAY_AGG(name) as names
                    FROM venues
                    WHERE normalized_name IS NOT NULL
                    GROUP BY normalized_name, city
                    HAVING COUNT(*) > 1
                `);

                if (dupes.rows.length > 0) {
                    console.log('\n   Duplicates found:');
                    dupes.rows.forEach(d => {
                        console.log(`   - "${d.normalized_name}" in ${d.city}: ${d.count} venues`);
                        console.log(`     IDs: ${d.ids.join(', ')}`);
                        console.log(`     Names: ${d.names.join(', ')}`);
                    });
                }
                throw error;
            } else {
                throw error;
            }
        }

        // Step 4: Verify the changes
        console.log('\n📊 Verification:');

        const stats = await client.query(`
            SELECT 
                COUNT(*) as total_venues,
                COUNT(DISTINCT normalized_name) as unique_normalized_names,
                COUNT(*) - COUNT(DISTINCT normalized_name) as potential_duplicates
            FROM venues
        `);

        console.log(`   Total venues: ${stats.rows[0].total_venues}`);
        console.log(`   Unique normalized names: ${stats.rows[0].unique_normalized_names}`);
        console.log(`   Potential duplicates: ${stats.rows[0].potential_duplicates}`);

        // Show sample normalized names
        const samples = await client.query(`
            SELECT id, name, normalized_name, city
            FROM venues
            ORDER BY id
            LIMIT 10
        `);

        console.log('\n   Sample venues:');
        samples.rows.forEach(v => {
            console.log(`   ID ${v.id}: "${v.name}" → "${v.normalized_name}" (${v.city})`);
        });

        console.log('\n✅ Migration complete!');

    } finally {
        client.release();
        await pool.end();
    }
}

addNormalizedNameColumn().catch(console.error);
