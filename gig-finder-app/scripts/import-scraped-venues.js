/**
 * Import scraped venues into the database
 * Reads venue-scrape-results.json and uses the findOrCreateVenue utility
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function findOrCreateVenue(venueData, client) {
    // Check if venue exists
    const existing = await client.query(
        'SELECT id, name FROM venues WHERE LOWER(name) = LOWER($1)',
        [venueData.name]
    );

    if (existing.rows.length > 0) {
        return { id: existing.rows[0].id, name: existing.rows[0].name, isNew: false };
    }

    // Create new venue
    const result = await client.query(
        `INSERT INTO venues (name, city, latitude, longitude)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name`,
        [venueData.name, venueData.city, venueData.latitude, venueData.longitude]
    );

    return { id: result.rows[0].id, name: result.rows[0].name, isNew: true };
}

async function importVenues() {
    const inputPath = path.resolve(__dirname, '../venue-scrape-results.json');

    if (!fs.existsSync(inputPath)) {
        console.error('❌ venue-scrape-results.json not found!');
        console.log('   Run: node scripts/scrape-skiddle-venues.js first');
        process.exit(1);
    }

    const venues = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
    console.log(`📥 Importing ${venues.length} venues...\n`);

    const client = await pool.connect();
    let newCount = 0;
    let existingCount = 0;
    const newVenues = [];

    try {
        for (const venueData of venues) {
            const result = await findOrCreateVenue(venueData, client);

            if (result.isNew) {
                newCount++;
                newVenues.push(result.name);
                console.log(`  ✨ Created: ${result.name}`);
            } else {
                existingCount++;
                console.log(`  ⏭️  Exists: ${result.name}`);
            }
        }

        console.log(`\n\n📊 Import Summary:`);
        console.log(`   New venues created: ${newCount}`);
        console.log(`   Already existed: ${existingCount}`);
        console.log(`   Total processed: ${venues.length}`);

        if (newVenues.length > 0) {
            console.log(`\n\n📝 New venues that need capacity data:`);
            newVenues.forEach(name => console.log(`   - ${name}`));

            console.log(`\n💡 Tip: Add capacity data via the admin console or database`);
            console.log(`   As you add capacity, venue size filtering will improve!`);
        }

    } finally {
        client.release();
        await pool.end();
    }

    console.log('\n✅ Import complete!\n');
}

importVenues().catch(err => {
    console.error('❌ Import failed:', err);
    process.exit(1);
});
