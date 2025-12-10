// Leith Depot Scraper - Lightweight Version
// Uses Cheerio (no headless browser needed)

const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeLeithDepotSimple() {
    console.log('🎸 Starting Leith Depot scraper (lightweight)...');

    try {
        // Fetch the HTML
        const response = await axios.get('https://www.leithdepot.com/events', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const events = [];

        // Parse events from the page structure
        $('.eventlist-event').each((index, element) => {
            try {
                const $event = $(element);

                // Extract title
                const title = $event.find('.eventlist-title a').text().trim();

                // Extract date
                const dateText = $event.find('.eventlist-datetag').text().trim();

                // Extract time
                const timeText = $event.find('.eventlist-meta-time').text().trim();

                // Extract ticket link
                let ticketUrl = null;
                $event.find('a').each((i, link) => {
                    const href = $(link).attr('href');
                    if (href && (href.includes('ticket') || href.includes('eventbrite') || href.includes('wegottickets'))) {
                        ticketUrl = href;
                    }
                });

                // Extract description
                const description = $event.find('.eventlist-description').text().trim();

                if (title && dateText) {
                    events.push({
                        name: title,
                        date: dateText,
                        time: timeText || 'TBA',
                        ticketUrl: ticketUrl,
                        description: description || 'No description available',
                        venue: 'Leith Depot',
                        location: 'Edinburgh',
                        capacity: 150, // Leith Depot capacity
                        vibe: 'indie_alt', // Default genre
                        source: 'https://www.leithdepot.com/events',
                        scrapedAt: new Date().toISOString()
                    });
                }
            } catch (err) {
                console.error('Error parsing event:', err.message);
            }
        });

        console.log(`✅ Found ${events.length} events`);
        return events;

    } catch (error) {
        console.error('❌ Scraper error:', error.message);
        throw error;
    }
}

// Run the scraper
if (require.main === module) {
    scrapeLeithDepotSimple()
        .then(events => {
            console.log('\n📋 Scraped Events:\n');
            events.forEach((event, index) => {
                console.log(`${index + 1}. ${event.name}`);
                console.log(`   📅 ${event.date} at ${event.time}`);
                console.log(`   🎟️  ${event.ticketUrl || 'No ticket link'}`);
                console.log('');
            });

            // Save to JSON file
            const fs = require('fs');
            fs.writeFileSync(
                './leith-depot-events.json',
                JSON.stringify(events, null, 2)
            );
            console.log('💾 Saved to leith-depot-events.json');
        })
        .catch(err => {
            console.error('Failed to scrape:', err);
            process.exit(1);
        });
}

module.exports = { scrapeLeithDepotSimple };
