import { Gig } from './types';
import { venueLocations } from './constants';

export function generateFallbackGigs(): Gig[] {
    const gigs: Gig[] = [];
    const genres = ['rock_blues_punk', 'indie_alt', 'metal', 'pop', 'electronic', 'hiphop', 'acoustic', 'classical'];
    const locations = Object.keys(venueLocations);
    const bandPrefixes = ['The', 'Electric', 'Neon', 'Dark', 'Angry', 'Cosmic', 'Velvet', 'Massive', 'Tiny', 'Urban', 'Midnight', 'Twisted', 'Royal', 'Hidden'];
    const bandSuffixes = ['Apples', 'Badgers', 'Dreams', 'Riot', 'Waves', 'Echoes', 'Souls', 'Giants', 'Mice', 'Monkeys', 'Disco', 'Protocol', 'Stags', 'Thistles'];

    const today = new Date();

    // Gig 1: Tonight (Punk at Sneaky's)
    const date1 = new Date(today);
    gigs.push({
        id: 101,
        name: "The Angry Apple Trees",
        venue: "Sneaky Pete's",
        location: "Sneaky Pete's",
        town: "Edinburgh",
        capacity: 100,
        vibe: "rock_blues_punk",
        dateObj: date1.toISOString(),
        date: date1.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
        time: "20:00",
        price: "£15.00",
        priceVal: 15,
        isInternalTicketing: false,
        ticketUrl: "https://www.skiddle.com",
        imageUrl: "/images/band1.jpg", // Placeholder? Legacy had defaults in CSS or JS? Legacy didn't specify img url in fallback?
        // Legacy renderGigs had default image logic if missing? 
        // GigCard uses '/no-photo.png' if missing.
        description: "An energetic punk rock night."
    });

    // Gig 2: Tomorrow (Electronic at Liquid Room)
    const date2 = new Date(today);
    date2.setDate(today.getDate() + 1);
    gigs.push({
        id: 102,
        name: "Neon Dreams",
        venue: "The Liquid Room",
        location: "The Liquid Room",
        town: "Edinburgh",
        capacity: 800,
        vibe: "electronic",
        dateObj: date2.toISOString(),
        date: date2.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
        time: "23:00",
        price: "£12.50",
        priceVal: 12.50,
        isInternalTicketing: true,
        ticketUrl: "#",
        imageUrl: "/images/band2.jpg",
        description: "Late night electronic beats."
    });

    // Gig 3: This Weekend (Indie at King Tut's)
    const date3 = new Date(today);
    // Find next Saturday
    date3.setDate(today.getDate() + (6 - today.getDay() + 7) % 7);
    gigs.push({
        id: 103,
        name: "Velvet Echoes",
        venue: "King Tut's",
        location: "King Tut's",
        town: "Glasgow",
        capacity: 300,
        vibe: "indie_alt",
        dateObj: date3.toISOString(),
        date: date3.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
        time: "19:30",
        price: "£18.00",
        priceVal: 18,
        isInternalTicketing: false,
        ticketUrl: "https://www.ticketmaster.co.uk",
        imageUrl: "/images/band3.jpg",
        description: "Indie rock sensations."
    });

    // Random Generation
    for (let i = 0; i < 45; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + Math.floor(Math.random() * 200));

        const genre = genres[Math.floor(Math.random() * genres.length)];
        const priceVal = Math.floor(Math.random() * 60);
        const locName = locations[Math.floor(Math.random() * locations.length)];
        const venueData = venueLocations[locName];

        gigs.push({
            id: i + 200, // Avoid conflict
            name: `${bandPrefixes[Math.floor(Math.random() * bandPrefixes.length)]} ${bandSuffixes[Math.floor(Math.random() * bandSuffixes.length)]}`,
            venue: locName,
            location: locName,
            town: venueData.postcode.startsWith('G') ? 'Glasgow' : 'Edinburgh', // Basic inference
            capacity: venueData.capacity,
            vibe: genre,
            dateObj: date.toISOString(),
            date: date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
            time: `${19 + Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 2) === 0 ? '00' : '30'}`,
            price: priceVal === 0 ? 'Free' : `£${priceVal.toFixed(2)}`,
            priceVal: priceVal,
            isInternalTicketing: Math.random() > 0.7,
            ticketUrl: '#',
            description: `A generic ${genre} gig.`
            // Add extra fields needed for filtering if we filter in Wizard
        });
        // Add property 'vibe' to gig? Type definition needs it?
        // Legacy filtering used `gig.vibe`.
        // My `Gig` interface in `types.ts` is API response shape context.
        // If I filter by Vibe, I need `vibe` property on Gig?
        // Let's check `types.ts`.
    }

    return gigs.sort((a, b) => new Date(a.dateObj || 0).getTime() - new Date(b.dateObj || 0).getTime());
}
