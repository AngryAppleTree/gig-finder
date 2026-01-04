const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.production.local') });
if (!process.env.POSTGRES_URL) {
    dotenv.config({ path: path.join(__dirname, '../.env.local') });
}

async function exportCleanEventsToCSV() {
    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔍 Querying database for events with clean details...');

        // Query for events with venue names
        const eventsRes = await pool.query(`
            SELECT 
                TO_CHAR(e.date, 'YYYY-MM-DD" "HH24:MI') as date,
                e.name as event_name,
                v.name as venue,
                COALESCE(e.price, 'Unknown') as price
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            ORDER BY e.date DESC
        `);

        const events = eventsRes.rows;
        console.log(`✅ Found ${events.length} total events.`);

        // Helper to convert array of objects to CSV
        const toCSV = (data) => {
            if (data.length === 0) return 'No data';
            const headers = ['Date', 'Event Name', 'Venue', 'Price'];
            const rows = data.map(row => [
                `"${String(row.date).replace(/"/g, '""')}"`,
                `"${String(row.event_name).replace(/"/g, '""')}"`,
                `"${String(row.venue).replace(/"/g, '""')}"`,
                `"${String(row.price).replace(/"/g, '""')}"`
            ].join(','));

            return [headers.join(','), ...rows].join('\n');
        };

        const eventCSV = toCSV(events);
        const fileName = 'events_report.csv';
        fs.writeFileSync(path.join(__dirname, '../', fileName), eventCSV);

        console.log(`\n📁 File saved: ${fileName}`);

    } catch (err) {
        console.error('❌ Export error:', err);
    } finally {
        await pool.end();
    }
}

exportCleanEventsToCSV();
