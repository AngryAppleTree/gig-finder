// Leith Depot Scraper - Proof of Concept
// Scrapes event data from https://www.leithdepot.com/events

const puppeteer = require('puppeteer');

async function scrapeLeithDepot() {
    console.log('🎸 Starting Leith Depot scraper...');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    try {
        // Navigate to events page
        await page.goto('https://www.leithdepot.com/events', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        console.log('✅ Page loaded successfully');

        // Extract event data
        const events = await page.evaluate(() => {
            const eventElements = document.querySelectorAll('.eventlist-event');
            const results = [];

            eventElements.forEach((event) => {
                try {
                    // Extract event title
                    const titleElement = event.querySelector('.eventlist-title a');
                    const title = titleElement ? titleElement.innerText.trim() : null;

                    // Extract date/time
                    const dateElement = event.querySelector('.eventlist-datetag');
                    const timeElement = event.querySelector('.eventlist-meta-time');

                    const dateText = dateElement ? dateElement.innerText.trim() : null;
                    const timeText = timeElement ? timeElement.innerText.trim() : null;

                    // Extract ticket link
                    const ticketLink = event.querySelector('a[href*="ticket"]') ||
                        event.querySelector('a[href*="eventbrite"]') ||
                        event.querySelector('a[href*="wegottickets"]');

                    const ticketUrl = ticketLink ? ticketLink.href : null;

                    // Extract description
                    const descElement = event.querySelector('.eventlist-description');
                    const description = descElement ? descElement.innerText.trim() : null;

                    if (title && dateText) {
                        results.push({
                            name: title,
                            date: dateText,
                            time: timeText || 'TBA',
                            ticketUrl: ticketUrl,
                            description: description,
                            venue: 'Leith Depot',
                            location: 'Edinburgh',
                            source: 'https://www.leithdepot.com/events'
                        });
                    }
                } catch (err) {
                    console.error('Error parsing event:', err);
                }
            });

            return results;
        });

        console.log(`✅ Found ${events.length} events`);

        await browser.close();
        return events;

    } catch (error) {
        console.error('❌ Scraper error:', error);
        await browser.close();
        throw error;
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
            const fs = require('fs');
            fs.writeFileSync(
                '../public/leith-depot-events.json',
                JSON.stringify(events, null, 2)
            );
            console.log('💾 Saved to leith-depot-events.json');
        })
        .catch(err => {
            console.error('Failed to scrape:', err);
            process.exit(1);
        });
}

module.exports = { scrapeLeithDepot };
