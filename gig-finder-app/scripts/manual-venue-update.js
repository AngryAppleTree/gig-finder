require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

// Sample venues to search for - we'll do a few at a time
const VENUES_TO_SEARCH = [
    { id: 100, name: 'Beat Generator', city: 'Dundee' },
    { id: 10, name: 'Bannermans Edinburgh', city: 'Edinburgh' },
    { id: 114, name: 'Arcadia Music Cafe', city: 'Biggar' },
];

async function searchAndUpdateVenue(venue) {
    console.log(`\n🔍 Searching for: ${venue.name}, ${venue.city}`);
    console.log(`   Please provide the following information:`);
    console.log(`   Search URL: https://www.google.com/search?q=${encodeURIComponent(venue.name + ' ' + venue.city + ' venue')}`);
    console.log('');
    console.log(`   Venue ID: ${venue.id}`);
    console.log(`   Name: ${venue.name}`);
    console.log(`   City: ${venue.city}`);
    console.log('');
    console.log('   Enter data (or press Enter to skip):');
    console.log('   Format: postcode|capacity|email|website|phone|address');
    console.log('   Example: EH1 1NQ|175|info@venue.com|https://venue.com|0131 123 4567|123 Main St');
    console.log('');
}

async function manualVenueUpdate() {
    console.log('📝 Manual Venue Information Update\n');
    console.log('This script will help you update venue information.');
    console.log('For each venue, search online and enter the data.\n');

    for (const venue of VENUES_TO_SEARCH) {
        await searchAndUpdateVenue(venue);
    }

    console.log('\n💡 Alternatively, use the admin panel Venue Management to edit venues directly!');
}

manualVenueUpdate().catch(console.error);
