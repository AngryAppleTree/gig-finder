// Test script to check what the API returns for ERTYU event
async function testAPI() {
    console.log('🧪 Testing /api/events for ERTYU...\n');

    const response = await fetch('http://localhost:3000/api/events?keyword=ERTYU');
    const data = await response.json();

    console.log('API Response:', data);

    if (data.events && data.events.length > 0) {
        const event = data.events[0];
        console.log('\n📊 First Event:');
        console.log('─────────────────────────────────────');
        console.log('Name:', event.name);
        console.log('Source:', event.source);
        console.log('isInternalTicketing:', event.isInternalTicketing);
        console.log('sellTickets:', event.sellTickets);
        console.log('ticketUrl:', event.ticketUrl);
        console.log('priceVal:', event.priceVal);
        console.log('─────────────────────────────────────');

        const shouldShow = (event.isInternalTicketing || event.sellTickets) && event.source === 'manual';
        console.log('\n✅ Should show Buy Tickets button:', shouldShow);

        if (!shouldShow) {
            console.log('\n❌ ISSUE: Button won\'t show because:');
            if (!event.sellTickets && !event.isInternalTicketing) {
                console.log('  - Both sellTickets and isInternalTicketing are false');
            }
            if (event.source !== 'manual') {
                console.log('  - Source is not "manual", it\'s:', event.source);
            }
        }
    } else {
        console.log('❌ No events found');
    }
}

testAPI().catch(console.error);
