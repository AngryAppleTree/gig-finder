import * as cheerio from 'cheerio';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

export async function scrapeLeith() {
    console.log('🎸 Initiating Leith Depot Ingestion (Cheerio Selectors)...');

    if (!process.env.POSTGRES_URL) {
        throw new Error('POSTGRES_URL is not defined');
    }

    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
    });

    let client;
    let addedCount = 0;
    let skippedCount = 0;

    try {

        console.log('📡 Fetching Leith Depot Events HTML...');
        const res = await fetch('https://leithdepot.com/events.html');
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const html = await res.text();

        const $ = cheerio.load(html);
        const events = [];

        $('.menu-item').each((i, el) => {
            const dateStr = $(el).find('h5').text().trim(); // "Monday 1 December, 6:30pm"
            const title = $(el).find('h4').text().trim(); // "Band Name"
            const priceText = $(el).find('.text-left').text().trim(); // "Free - ..." or price
            const ticketLink = $(el).find('h4 a').attr('href') || $(el).find('.text-left a').attr('href');
            // Extract Image
            let imageUrl = $(el).find('img').attr('src');
            // Handle relative URLs if necessary (unlikely given it's usually CDN, but good practice)
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = `https://leithdepot.com${imageUrl}`;
            }

            if (dateStr && title) {
                events.push({
                    name: title,
                    dateInfo: parseDate(dateStr), // Custom parser
                    priceText: priceText,
                    ticketUrl: ticketLink,
                    imageUrl: imageUrl
                });
            }
        });

        console.log(`✅ Extracted ${events.length} events via Selectors.`);

        // Connect DB
        client = await pool.connect();

        const currentYear = new Date().getFullYear();
        const currentMonthIndex = new Date().getMonth();

        const monthMap = {
            'January': 0, 'February': 1, 'March': 2, 'April': 3,
            'May': 4, 'June': 5, 'July': 6, 'August': 7,
            'September': 8, 'October': 9, 'November': 10, 'December': 11
        };

        for (const evt of events) {
            if (!evt.dateInfo) continue;

            const eventMonthIndex = monthMap[evt.dateInfo.month];

            // Year Logic
            let year = currentYear;
            if (eventMonthIndex < currentMonthIndex && (currentMonthIndex - eventMonthIndex) > 6) {
                year = currentYear + 1;
            }

            const monthNum = (eventMonthIndex + 1).toString().padStart(2, '0');
            const dayNum = evt.dateInfo.day.toString().padStart(2, '0');
            const dateStr = `${year}-${monthNum}-${dayNum}`;
            // Time Logic "6:30pm" to "18:30"
            let timeStr = convertTime12to24(evt.dateInfo.time);

            // Date comparison
            const eventDateObj = new Date(dateStr);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (eventDateObj < yesterday) {
                // console.log(`   . Skipped (Past): ${evt.name}`);
                continue;
            }

            const timestamp = `${dateStr} ${timeStr}:00`;

            const fingerprint = `${dateStr}|leith depot|${evt.name.toLowerCase().trim()}`;

            // Check existence
            const checkRes = await client.query('SELECT id FROM events WHERE fingerprint = $1', [fingerprint]);

            if (checkRes.rows.length === 0) {
                await client.query(`
                    INSERT INTO events (
                        name, venue, date, genre, price, description, 
                        user_id, created_at, fingerprint, ticket_url, approved, image_url
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10, $11)
                 `, [
                    evt.name,
                    'Leith Depot',
                    timestamp,
                    'Indie',
                    evt.priceText || '12.00',
                    `Live at Leith Depot. ${evt.priceText}`,
                    'scraper_v1',
                    fingerprint,
                    evt.ticketUrl || null,
                    true,
                    evt.imageUrl || null
                ]);
                console.log(`   + Added: ${evt.name} @ ${dateStr}`);
                addedCount++;
            } else {
                skippedCount++;
            }
        }

        console.log(`🎉 Added ${addedCount} new events.`);
        return { success: true, count: addedCount, skipped: skippedCount };

    } catch (err) {
        console.error('❌ Error:', err);
        throw err;
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

function parseDate(str) {
    // "Monday 1 December, 6:30pm"
    const regex = /([a-zA-Z]+)\s+(\d{1,2})\s+([a-zA-Z]+),?\s*(.+)?/i;
    const match = str.match(regex);
    if (!match) return null;
    return {
        dow: match[1],
        day: parseInt(match[2]),
        month: match[3],
        time: match[4] || '19:30'
    };
}

function convertTime12to24(time12h) {
    if (!time12h) return '19:30';

    // Check if it's a valid simple time string (e.g. 7:30pm, 7pm, 19:30)
    // If it contains "tbc" or "tba" or is very long, default out.
    if (time12h.toLowerCase().includes('tbc') || time12h.toLowerCase().includes('tba') || time12h.length > 10) {
        return '19:30';
    }

    // e.g. "6:30pm"
    const [time, modifier] = time12h.split(/(am|pm)/i);
    let [hours, minutes] = time.trim().split(':');
    if (!minutes) minutes = '00';

    // Safety check for numbers
    if (isNaN(parseInt(hours))) return '19:30';

    if (hours === '12') hours = '00';
    if (modifier && modifier.toLowerCase() === 'pm') {
        hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
}

// Allow standalone execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    import('dotenv').then(dotenv => {
        dotenv.config({ path: '.env.local' });
        scrapeLeith()
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
    });
}
