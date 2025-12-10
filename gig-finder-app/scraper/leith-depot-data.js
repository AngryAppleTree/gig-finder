// Leith Depot Events - Manually Parsed from Website
// Based on data scraped on 2024-12-05

const leithDepotEvents = [
    {
        id: 201,
        name: "Drink & Draw with Susan Mitchell",
        location: "Leith Depot",
        venue: "Leith Depot",
        coords: { lat: 55.9740, lon: -3.1720 },
        capacity: 150,
        dateObj: new Date("2024-12-07T14:00:00"),
        date: "Sat, 7 Dec",
        time: "14:00",
        priceVal: 15,
        price: "£15.00",
        vibe: "acoustic",
        ticketUrl: "https://www.susan-mitchell.com/drinkanddraw",
        description: "Afternoon Art Workshop - 2-4pm"
    },
    {
        id: 202,
        name: "Leith Kino - Seeking Mavis Beacon",
        location: "Leith Depot",
        venue: "Leith Depot",
        coords: { lat: 55.9740, lon: -3.1720 },
        capacity: 150,
        dateObj: new Date("2024-12-07T19:30:00"),
        date: "Sun, 7 Dec",
        time: "19:30",
        priceVal: 8,
        price: "£8.00",
        vibe: "acoustic",
        ticketUrl: "https://ticketlab.co.uk/promoter/leithkino",
        description: "Film Screening + Short Film - Palestine Fundraiser"
    },
    {
        id: 203,
        name: "The Sketch Show",
        location: "Leith Depot",
        venue: "Leith Depot",
        coords: { lat: 55.9740, lon: -3.1720 },
        capacity: 150,
        dateObj: new Date("2024-12-08T19:30:00"),
        date: "Mon, 8 Dec",
        time: "19:30",
        priceVal: 10,
        price: "£10.00",
        vibe: "acoustic",
        ticketUrl: "https://www.eventbrite.com/e/the-sketch-show-tickets-1968661380183",
        description: "Comedy sketch show"
    },
    {
        id: 204,
        name: "Rikki Abbott and The Disciples Of Bop",
        location: "Leith Depot",
        venue: "Leith Depot",
        coords: { lat: 55.9740, lon: -3.1720 },
        capacity: 150,
        dateObj: new Date("2024-12-10T19:30:00"),
        date: "Wed, 10 Dec",
        time: "19:30",
        priceVal: 12,
        price: "£12.00",
        vibe: "acoustic",
        ticketUrl: "https://www.eventbrite.co.uk/e/the-promised-return-rikki-abbott-and-the-disciples-of-bop-tickets-1974964598278",
        description: "The Promised Return!"
    },
    {
        id: 205,
        name: "Janice Burns & Jon Doran Festive Show",
        location: "Leith Depot",
        venue: "Leith Depot",
        coords: { lat: 55.9740, lon: -3.1720 },
        capacity: 150,
        dateObj: new Date("2024-12-11T19:00:00"),
        date: "Thu, 11 Dec",
        time: "19:00",
        priceVal: 15,
        price: "£15.00",
        vibe: "acoustic",
        ticketUrl: "https://wegottickets.com/event/677433",
        description: "Festive acoustic show"
    },
    {
        id: 206,
        name: "Diet of Worms and Macon Heights",
        location: "Leith Depot",
        venue: "Leith Depot",
        coords: { lat: 55.9740, lon: -3.1720 },
        capacity: 150,
        dateObj: new Date("2024-12-12T20:00:00"),
        date: "Fri, 12 Dec",
        time: "20:00",
        priceVal: 12,
        price: "£12.00",
        vibe: "indie_alt",
        ticketUrl: "https://www.eventbrite.com/e/other-other-music-presents-diet-of-worms-and-macon-heights-tickets-1972076607219",
        description: "Other Other Music presents"
    },
    {
        id: 207,
        name: "Trad Music Session",
        location: "Leith Depot",
        venue: "Leith Depot",
        coords: { lat: 55.9740, lon: -3.1720 },
        capacity: 150,
        dateObj: new Date("2024-12-13T13:00:00"),
        date: "Sat, 13 Dec",
        time: "13:00",
        priceVal: 0,
        price: "Free",
        vibe: "acoustic",
        ticketUrl: null,
        description: "Traditional music session"
    },
    {
        id: 208,
        name: "HUMBUG! Cricket Club Christmas Cracker",
        location: "Leith Depot",
        venue: "Leith Depot",
        coords: { lat: 55.9740, lon: -3.1720 },
        capacity: 150,
        dateObj: new Date("2024-12-13T18:00:00"),
        date: "Sat, 13 Dec",
        time: "18:00",
        priceVal: 20,
        price: "£20.00",
        vibe: "acoustic",
        ticketUrl: "https://www.howlinfling.com/shhh/p/humbug-2025",
        description: "Leith FAB Cricket Club Christmas event"
    }
];

module.exports = { leithDepotEvents };

// If run directly, display the events
if (require.main === module) {
    console.log('🎸 Leith Depot Events (Manually Parsed)\n');
    leithDepotEvents.forEach((event, index) => {
        console.log(`${index + 1}. ${event.name}`);
        console.log(`   📅 ${event.date} at ${event.time}`);
        console.log(`   💰 ${event.price}`);
        console.log(`   🎟️  ${event.ticketUrl || 'No tickets'}`);
        console.log('');
    });

    console.log(`\n✅ Total: ${leithDepotEvents.length} events`);

    // Save to JSON
    const fs = require('fs');
    fs.writeFileSync(
        './leith-depot-events.json',
        JSON.stringify(leithDepotEvents, null, 2)
    );
    console.log('💾 Saved to leith-depot-events.json');
}
