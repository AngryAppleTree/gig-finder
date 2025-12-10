// Leith Depot Parser - No Browser Required
// Parses the markdown/text content from read_url_content

const axios = require('axios');

async function parseLeithDepotEvents() {
    console.log('🎸 Fetching Leith Depot events...');

    try {
        // Fetch the page
        const response = await axios.get('https://www.leithdepot.com/events');
        const html = response.data;

        console.log('✅ Page fetched successfully');

        // Extract event data using regex patterns
        const events = [];

        // Pattern to match date lines like "Saturday 7 December, 7:30pm"
        const datePattern = /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December),?\s*([^<\n]+)?/gi;

        // Find all dates
        const dateMatches = [...html.matchAll(datePattern)];

        console.log(`Found ${dateMatches.length} date entries`);

        // For each date, try to find the associated event
        dateMatches.forEach((match, index) => {
            const dayOfWeek = match[1];
            const day = match[2];
            const month = match[3];
            const time = match[4] ? match[4].trim() : 'TBA';

            // Look backwards in the HTML to find the event title
            const beforeDate = html.substring(Math.max(0, match.index - 500), match.index);

            // Try to extract event title (usually in a heading tag before the date)
            const titleMatch = beforeDate.match(/<h[34][^>]*>([^<]+)<\/h[34]>/i) ||
                beforeDate.match(/>([A-Z][^<\n]{10,100})</);

            if (titleMatch) {
                const title = titleMatch[1].trim()
                    .replace(/\s+/g, ' ')
                    .replace(/GET TICKETS/gi, '')
                    .trim();

                // Look for ticket link near this event
                const afterDate = html.substring(match.index, match.index + 1000);
                const ticketMatch = afterDate.match(/href="([^"]*(?:ticket|eventbrite|wegottickets|howlinfling)[^"]*)"/i);

                if (title.length > 3 && title.length < 150) {
                    const monthMap = {
                        'January': 0, 'February': 1, 'March': 2, 'April': 3,
                        'May': 4, 'June': 5, 'July': 6, 'August': 7,
                        'September': 8, 'October': 9, 'November': 10, 'December': 11
                    };

                    const year = month === 'January' ? 2025 : 2024;
                    const dateObj = new Date(year, monthMap[month], parseInt(day));

                    events.push({
                        id: 200 + index,
                        name: title,
                        location: 'Leith Depot',
                        venue: 'Leith Depot',
                        coords: { lat: 55.9740, lon: -3.1720 },
                        capacity: 150,
                        dateObj: dateObj.toISOString(),
                        date: `${dayOfWeek.substring(0, 3)}, ${day} ${month.substring(0, 3)}`,
                        time: time,
                        priceVal: 12,
                        price: '£12.00',
                        vibe: 'indie_alt',
                        ticketUrl: ticketMatch ? ticketMatch[1] : null,
                        description: `Live event at Leith Depot`,
                        source: 'https://www.leithdepot.com/events',
                        scrapedAt: new Date().toISOString()
                    });
                }
            }
        });

        console.log(`✅ Parsed ${events.length} events`);
        return events;

    } catch (error) {
        console.error('❌ Parser error:', error.message);
        throw error;
    }
}

// Run the parser
if (require.main === module) {
    parseLeithDepotEvents()
        .then(events => {
            console.log('\n📋 Parsed Events:\n');
            events.forEach((event, index) => {
                console.log(`${index + 1}. ${event.name}`);
                console.log(`   📅 ${event.date} at ${event.time}`);
                console.log(`   🎟️  ${event.ticketUrl || 'No ticket link'}`);
                console.log('');
            });

            // Save to JSON file
            const fs = require('fs');
            fs.writeFileSync(
                './leith-depot-events-full.json',
                JSON.stringify(events, null, 2)
            );
            console.log(`💾 Saved ${events.length} events to leith-depot-events-full.json`);
        })
        .catch(err => {
            console.error('Failed to parse:', err);
            process.exit(1);
        });
}

module.exports = { parseLeithDepotEvents };
