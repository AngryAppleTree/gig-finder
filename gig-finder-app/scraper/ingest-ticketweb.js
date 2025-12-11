require('dotenv').config({ path: '.env.local' });
const cheerio = require('cheerio');

async function scrapeTicketWeb() {
    console.log('🎸 Investigating TicketWeb Edinburgh...');
    try {
        const url = 'https://www.ticketweb.uk/search?q=edinburgh';
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const html = await res.text();
        const $ = cheerio.load(html);

        // Check for event list items
        // Common classes: .event-list, .results-list, li.event
        // Let's inspect generic list items

        const events = [];
        $('li').each((i, el) => {
            const text = $(el).text().trim();
            if (text.length > 10 && text.length < 100) {
                // Clean up whitespace
                const clean = text.replace(/\s+/g, ' ');
                // events.push(clean);
            }
        });

        // Try to find specific event titles
        // Often <a> tags with class 'event-name' or similar
        // Or inspect the HTML dump (I'll log length)

        console.log(`HTML Length: ${html.length}`);

        // Let's try to grab generic "pl" (place?) or "event" classes
        // (I'm flying blind without seeing the HTML, so I'll dump specific sections if this fails)

        // TicketWeb usually uses 'ul.events-list' -> 'li'
        const specificItems = $('.events-list li').length;
        console.log(`Found ${specificItems} items in .events-list`);

        if (specificItems === 0) {
            // Maybe it's a diff class?
            const genericItems = $('ul li').length;
            console.log(`Found ${genericItems} total list items.`);
        }

    } catch (err) {
        console.error(err);
    }
}

scrapeTicketWeb();
