require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function exportVenuesToCSV() {
    const client = await pool.connect();
    try {
        console.log('📊 Exporting all venues to CSV...\n');

        const result = await client.query(`
            SELECT 
                v.id,
                v.name,
                v.city,
                v.address,
                v.postcode,
                v.capacity,
                v.latitude,
                v.longitude,
                v.email,
                v.phone,
                v.website,
                COUNT(e.id) as event_count
            FROM venues v
            LEFT JOIN events e ON e.venue_id = v.id
            GROUP BY v.id, v.name, v.city, v.address, v.postcode, v.capacity, 
                     v.latitude, v.longitude, v.email, v.phone, v.website
            ORDER BY v.city, v.name
        `);

        // Create CSV header
        const headers = [
            'ID',
            'Name',
            'City',
            'Address',
            'Postcode',
            'Capacity',
            'Latitude',
            'Longitude',
            'Email',
            'Phone',
            'Website',
            'Event Count'
        ];

        // Create CSV rows
        const csvRows = [headers.join(',')];

        for (const venue of result.rows) {
            const row = [
                venue.id,
                `"${(venue.name || '').replace(/"/g, '""')}"`,
                `"${(venue.city || '').replace(/"/g, '""')}"`,
                `"${(venue.address || '').replace(/"/g, '""')}"`,
                venue.postcode || '',
                venue.capacity || '',
                venue.latitude || '',
                venue.longitude || '',
                venue.email || '',
                venue.phone || '',
                venue.website || '',
                venue.event_count
            ];
            csvRows.push(row.join(','));
        }

        // Write to file
        const csvContent = csvRows.join('\n');
        const outputPath = path.join(__dirname, '..', 'venues-export.csv');
        fs.writeFileSync(outputPath, csvContent, 'utf8');

        console.log(`✅ Export complete!`);
        console.log(`   Total venues: ${result.rows.length}`);
        console.log(`   File: ${outputPath}`);
        console.log(`\n📈 Statistics:`);

        const withPostcode = result.rows.filter(v => v.postcode).length;
        const withEmail = result.rows.filter(v => v.email).length;
        const withPhone = result.rows.filter(v => v.phone).length;
        const withWebsite = result.rows.filter(v => v.website).length;
        const withCapacity = result.rows.filter(v => v.capacity).length;

        console.log(`   With postcode: ${withPostcode}/${result.rows.length} (${Math.round(withPostcode / result.rows.length * 100)}%)`);
        console.log(`   With email: ${withEmail}/${result.rows.length} (${Math.round(withEmail / result.rows.length * 100)}%)`);
        console.log(`   With phone: ${withPhone}/${result.rows.length} (${Math.round(withPhone / result.rows.length * 100)}%)`);
        console.log(`   With website: ${withWebsite}/${result.rows.length} (${Math.round(withWebsite / result.rows.length * 100)}%)`);
        console.log(`   With capacity: ${withCapacity}/${result.rows.length} (${Math.round(withCapacity / result.rows.length * 100)}%)`);

    } finally {
        client.release();
        await pool.end();
    }
}

exportVenuesToCSV().catch(console.error);
