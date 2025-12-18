/**
 * Scrape Skiddle to populate venues table
 * This script fetches events from Skiddle for Scottish cities and creates venue records
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SKIDDLE_API_BASE = 'https://www.skiddle.com/api/v1';
const API_KEY = process.env.SKIDDLE_API_KEY;

// Scottish cities to scrape
const SCOTTISH_CITIES = [
    { name: 'Edinburgh', lat: '55.9533', lon: '-3.1883' },
    { name: 'Glasgow', lat: '55.8642', lon: '-4.2518' },
    { name: 'Aberdeen', lat: '57.1497', lon: '-2.0943' },
    { name: 'Dundee', lat: '56.4620', lon: '-2.9707' },
    { name: 'Inverness', lat: '57.4778', lon: '-4.2247' },
    { name: 'Stirling', lat: '56.1165', lon: '-3.9369' },
    { name: 'Perth', lat: '56.3960', lon: '-3.4370' }
];

async function scrapeVenues() {
    if (!API_KEY || API_KEY === 'your_skiddle_api_key_here') {
        console.error('❌ Skiddle API key not found in .env.local');
        process.exit(1);
    }

    console.log('🎸 Starting Skiddle venue scrape for Scotland...\n');

    const allVenues = new Map(); // venue name -> venue data

    for (const city of SCOTTISH_CITIES) {
        console.log(`\n📍 Fetching events from ${city.name}...`);

        try {
            const params = new URLSearchParams({
                api_key: API_KEY,
                latitude: city.lat,
                longitude: city.lon,
                radius: '30', // 30 miles radius
                order: 'date',
                limit: '100',
                eventcode: 'LIVE',
            });

            const url = `${SKIDDLE_API_BASE}/events/search/?${params.toString()}`;
            const response = await fetch(url);

            if (!response.ok) {
                console.error(`  ❌ API error for ${city.name}: ${response.status}`);
                continue;
            }

            const data = await response.json();
            const events = data.results || [];

            console.log(`  ✅ Found ${events.length} events`);

            // Extract unique venues
            for (const event of events) {
                if (!event.venue?.name) continue;

                const venueName = event.venue.name;
                const venueKey = venueName.toLowerCase();

                if (!allVenues.has(venueKey)) {
                    allVenues.set(venueKey, {
                        name: venueName,
                        city: event.venue.town || city.name,
                        latitude: event.venue.latitude ? parseFloat(event.venue.latitude) : null,
                        longitude: event.venue.longitude ? parseFloat(event.venue.longitude) : null,
                    });
                }
            }

            // Rate limiting - be nice to Skiddle API
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`  ❌ Error fetching ${city.name}:`, error.message);
        }
    }

    console.log(`\n\n📊 Summary:`);
    console.log(`   Total unique venues found: ${allVenues.size}`);

    // Display venues by city
    const venuesByCity = {};
    for (const venue of allVenues.values()) {
        if (!venuesByCity[venue.city]) {
            venuesByCity[venue.city] = [];
        }
        venuesByCity[venue.city].push(venue.name);
    }

    console.log('\n📍 Venues by city:');
    for (const [city, venues] of Object.entries(venuesByCity)) {
        console.log(`   ${city}: ${venues.length} venues`);
    }

    // Save to file for review
    const fs = await import('fs');
    const outputPath = path.resolve(__dirname, '../venue-scrape-results.json');
    const venuesArray = Array.from(allVenues.values());

    fs.writeFileSync(outputPath, JSON.stringify(venuesArray, null, 2));
    console.log(`\n💾 Venue data saved to: venue-scrape-results.json`);

    console.log('\n✨ Next steps:');
    console.log('   1. Review the venue-scrape-results.json file');
    console.log('   2. Run: node scripts/import-scraped-venues.js');
    console.log('   3. This will import venues and notify you about missing capacity data\n');
}

scrapeVenues().catch(err => {
    console.error('❌ Scrape failed:', err);
    process.exit(1);
});
