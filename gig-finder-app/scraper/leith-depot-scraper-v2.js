// Leith Depot Scraper V2 - Production Ready
// Handles dynamic JavaScript content and extracts all events

const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeLeithDepot(retries = 3) {
    console.log('🎸 Starting Leith Depot scraper (v2)...');

    let browser;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu'
                ]
            });

            const page = await browser.newPage();

            // Set a realistic user agent
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            console.log(`📡 Attempt ${attempt}/${retries}: Loading page...`);

            // Navigate to events page
            await page.goto('https://www.leithdepot.com/events', {
                waitUntil: 'networkidle0',
                timeout: 60000
            });

            console.log('✅ Page loaded, waiting for content...');

            // Wait for events to load (adjust selector based on actual page structure)
            await page.waitForTimeout(5000);

            // Extract all events
            const events = await page.evaluate(() => {
                const results = [];

                // Find all text content and parse it manually
                const bodyText = document.body.innerText;

                // Split by common patterns to find events
                const lines = bodyText.split('\n');

                let currentEvent = null;
                let currentDate = null;

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();

                    // Skip empty lines
                    if (!line) continue;

                    // Check if this is a date line (e.g., "Saturday 7 December, 7:30pm")
                    const dateMatch = line.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December),?\s*(.+)?/i);

                    if (dateMatch) {
                        currentDate = {
                            dayOfWeek: dateMatch[1],
                            day: dateMatch[2],
                            month: dateMatch[3],
                            time: dateMatch[4] || 'TBA'
                        };
                        continue;
                    }

                    // Check if this line looks like an event title (not a navigation item)
                    if (line.length > 5 &&
                        line.length < 150 &&
                        !line.includes('GET TICKETS') &&
                        !line.includes('Opening hours') &&
                        !line.includes('Contact Us') &&
                        !line.includes('EVENTS') &&
                        currentDate) {

                        // This might be an event title
                        if (!currentEvent || currentEvent.name) {
                            // Start a new event
                            if (currentEvent && currentEvent.name) {
                                results.push(currentEvent);
                            }

                            currentEvent = {
                                name: line,
                                date: currentDate,
                                description: '',
                                ticketUrl: null
                            };
                        }
                    }
                }

                // Add the last event
                if (currentEvent && currentEvent.name) {
                    results.push(currentEvent);
                }

                // Now find ticket links
                const allLinks = Array.from(document.querySelectorAll('a'));
                const ticketLinks = allLinks.filter(a =>
                    a.href.includes('ticket') ||
                    a.href.includes('eventbrite') ||
                    a.href.includes('wegottickets') ||
                    a.href.includes('howlinfling') ||
                    a.href.includes('susan-mitchell')
                );

                // Try to match ticket links to events
                ticketLinks.forEach(link => {
                    const linkText = link.innerText.trim();
                    results.forEach(event => {
                        if (linkText.includes(event.name.substring(0, 20)) ||
                            link.previousElementSibling?.innerText?.includes(event.name.substring(0, 20))) {
                            event.ticketUrl = link.href;
                        }
                    });
                });

                return results;
            });

            console.log(`✅ Found ${events.length} events (raw)`);

            // Clean and format events
            const formattedEvents = events.map((event, index) => {
                const monthMap = {
                    'January': 0, 'February': 1, 'March': 2, 'April': 3,
                    'May': 4, 'June': 5, 'July': 6, 'August': 7,
                    'September': 8, 'October': 9, 'November': 10, 'December': 11
                };

                const year = event.date.month === 'January' ? 2025 : 2024;
                const dateObj = new Date(year, monthMap[event.date.month], parseInt(event.date.day));

                return {
                    id: 200 + index,
                    name: event.name,
                    location: 'Leith Depot',
                    venue: 'Leith Depot',
                    coords: { lat: 55.9740, lon: -3.1720 },
                    capacity: 150,
                    dateObj: dateObj,
                    date: `${event.date.dayOfWeek.substring(0, 3)}, ${event.date.day} ${event.date.month.substring(0, 3)}`,
                    time: event.date.time || 'TBA',
                    priceVal: 12, // Default price
                    price: '£12.00',
                    vibe: 'indie_alt',
                    ticketUrl: event.ticketUrl,
                    description: event.description || 'Live event at Leith Depot',
                    source: 'https://www.leithdepot.com/events',
                    scrapedAt: new Date().toISOString()
                };
            });

            await browser.close();

            console.log(`✅ Successfully scraped ${formattedEvents.length} events`);
            return formattedEvents;

        } catch (error) {
            console.error(`❌ Attempt ${attempt} failed:`, error.message);

            if (browser) {
                await browser.close();
            }

            if (attempt === retries) {
                throw new Error(`Failed after ${retries} attempts: ${error.message}`);
            }

            console.log(`⏳ Retrying in 3 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
}

// Run the scraper
if (require.main === module) {
    scrapeLeithDepot()
        .then(events => {
            console.log('\n📋 Scraped Events:\n');
            events.forEach((event, index) => {
                console.log(`${index + 1}. ${event.name}`);
                console.log(`   📅 ${event.date} at ${event.time}`);
                console.log(`   🎟️  ${event.ticketUrl || 'No ticket link'}`);
                console.log('');
            });

            // Save to JSON file
            fs.writeFileSync(
                './leith-depot-events-full.json',
                JSON.stringify(events, null, 2)
            );
            console.log(`💾 Saved ${events.length} events to leith-depot-events-full.json`);
        })
        .catch(err => {
            console.error('Failed to scrape:', err);
            process.exit(1);
        });
}

module.exports = { scrapeLeithDepot };
