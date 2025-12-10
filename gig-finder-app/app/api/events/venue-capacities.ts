// Venue Capacity Database
// Manually researched capacities for Edinburgh & Glasgow venues
// Update this as you discover new venues

export const venueCapacities: { [key: string]: number } = {
    // Edinburgh - Small (Max 150)
    "Sneaky Pete's": 100,
    "Sneaky Petes": 100,
    "The Jazz Bar": 80,
    "Bannermans": 150,
    "Voodoo Rooms": 150,

    // Edinburgh - Medium (151-1000)
    "The Caves": 450,
    "Summerhall": 300,
    "The Liquid Room": 420,
    "Cabaret Voltaire": 250,
    "La Belle Angele": 400,
    "Leith Depot": 150,
    "The Mash House": 500,
    "The Queen's Hall": 900,

    // Edinburgh - Large (1001-5000)
    "The Usher Hall": 2200,
    "Assembly Rooms": 840,
    "Corn Exchange": 3000,
    "O2 Academy Edinburgh": 2500,

    // Edinburgh - Massive (5001-25000)
    "Edinburgh Playhouse": 3000,

    // Edinburgh - Huge (25000+)
    "Murrayfield Stadium": 67000,
    "BT Murrayfield": 67000,

    // Glasgow - Small (Max 150)
    "Nice 'n' Sleazy": 150,
    "The Hug and Pint": 120,
    "Stereo": 150,
    "Broadcast": 100,

    // Glasgow - Medium (151-1000)
    "King Tut's Wah Wah Hut": 300,
    "King Tuts": 300,
    "Saint Luke's": 500,
    "The Garage": 600,
    "SWG3": 900,
    "The Art School": 450,
    "The Classic Grand": 400,
    "Oran Mor": 350,

    // Glasgow - Large (1001-5000)
    "Barrowland Ballroom": 1900,
    "Barrowland": 1900,
    "O2 Academy Glasgow": 2500,
    "The Pavilion Theatre": 1450,
    "The SSE Hydro": 14300,
    "OVO Hydro": 14300,

    // Glasgow - Massive (5001-25000)
    "SEC Armadillo": 3000,
    "SEC Centre": 10000,

    // Glasgow - Huge (25000+)
    "Hampden Park": 52000,
    "Celtic Park": 60000,
    "Ibrox Stadium": 50817,
};

// Helper function to get capacity with fuzzy matching
export function getVenueCapacity(venueName: string): number {
    // Direct match
    if (venueCapacities[venueName]) {
        return venueCapacities[venueName];
    }

    // Fuzzy match (case insensitive, partial match)
    const lowerVenue = venueName.toLowerCase();
    for (const [key, capacity] of Object.entries(venueCapacities)) {
        if (lowerVenue.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerVenue)) {
            return capacity;
        }
    }

    // Default fallback
    return 500;
}
