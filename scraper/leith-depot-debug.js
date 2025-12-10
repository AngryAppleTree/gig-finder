// Leith Depot Scraper - Debug Version
// Inspects the page structure to find the correct selectors

const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeLeithDepotDebug() {
    console.log('🎸 Starting Leith Depot scraper (debug mode)...');

    const browser = await puppeteer.launch({
        headless: 'new',
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

        // Wait for content to load
        await page.waitForTimeout(3000);

        // Take a screenshot for debugging
        await page.screenshot({ path: './leith-depot-debug.png', fullPage: true });
        console.log('📸 Screenshot saved to leith-depot-debug.png');

        // Extract ALL text content to see what's on the page
        const pageContent = await page.evaluate(() => {
            return {
                bodyText: document.body.innerText.substring(0, 2000),
                allH3: Array.from(document.querySelectorAll('h3')).map(h => h.innerText),
                allH4: Array.from(document.querySelectorAll('h4')).map(h => h.innerText),
                allLinks: Array.from(document.querySelectorAll('a')).slice(0, 50).map(a => ({
                    text: a.innerText.trim(),
                    href: a.href
                })).filter(l => l.text.length > 0)
            };
        });

        console.log('\n📄 Page Content Sample:');
        console.log(pageContent.bodyText);

        console.log('\n📌 H3 Headers:', pageContent.allH3.slice(0, 10));
        console.log('\n📌 H4 Headers:', pageContent.allH4.slice(0, 10));

        console.log('\n🔗 Links (first 20):');
        pageContent.allLinks.slice(0, 20).forEach(link => {
            console.log(`  - ${link.text} → ${link.href}`);
        });

        // Try to extract events using multiple selector strategies
        const events = await page.evaluate(() => {
            const results = [];

            // Strategy 1: Look for any element with "event" in the class name
            const eventElements = document.querySelectorAll('[class*="event"]');
            console.log(`Found ${eventElements.length} elements with 'event' in class name`);

            // Strategy 2: Look for date patterns
            const allText = document.body.innerText;
            const datePattern = /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\\s+\\d{1,2}\\s+(January|February|March|April|May|June|July|August|September|October|November|December)/gi;
            const dates = allText.match(datePattern) || [];

            // Strategy 3: Look for ticket links
            const ticketLinks = Array.from(document.querySelectorAll('a')).filter(a =>
                a.href.includes('ticket') ||
                a.href.includes('eventbrite') ||
                a.href.includes('wegottickets') ||
                a.innerText.toLowerCase().includes('ticket')
            );

            return {
                eventElementsCount: eventElements.length,
                datesFound: dates,
                ticketLinksCount: ticketLinks.length,
                ticketLinks: ticketLinks.slice(0, 5).map(a => ({
                    text: a.innerText.trim(),
                    href: a.href
                }))
            };
        });

        console.log('\n🔍 Analysis:');
        console.log(`  - Event elements found: ${events.eventElementsCount}`);
        console.log(`  - Dates found: ${events.datesFound.length}`);
        console.log(`  - Ticket links found: ${events.ticketLinksCount}`);

        if (events.ticketLinks.length > 0) {
            console.log('\n🎟️  Sample ticket links:');
            events.ticketLinks.forEach(link => {
                console.log(`  - ${link.text} → ${link.href}`);
            });
        }

        await browser.close();

    } catch (error) {
        console.error('❌ Scraper error:', error);
        await browser.close();
        throw error;
    }
}

// Run the debug scraper
scrapeLeithDepotDebug()
    .then(() => {
        console.log('\n✅ Debug scrape complete!');
    })
    .catch(err => {
        console.error('Failed to scrape:', err);
        process.exit(1);
    });
