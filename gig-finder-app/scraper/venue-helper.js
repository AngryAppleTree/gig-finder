/**
 * Venue lookup helper for scrapers
 * Finds venue by normalized name or creates it if it doesn't exist
 * Uses normalized_name column to prevent duplicates
 */

/**
 * Normalizes a venue name for duplicate detection
 * Must match the normalization logic in lib/venue-utils.ts
 */
function normalizeVenueName(name) {
    // Common Scottish cities to remove from venue names
    const cities = ['edinburgh', 'glasgow', 'aberdeen', 'dundee', 'inverness', 'perth', 'stirling', 'kirkcaldy', 'dunfermline'];

    let normalized = name
        .toLowerCase()
        .replace(/^upstairs\s+(at\s+)?/i, '')       // Remove "Upstairs" or "Upstairs at" first
        .replace(/^the\s+/i, '')                    // Then remove leading "The"
        .replace(/[^a-z0-9\s]/g, '')                 // Remove punctuation (including apostrophes)
        .replace(/\s+and\s+/g, ' ')                  // Normalize "and" to space
        .replace(/\s+n\s+/g, ' ')                    // Normalize "n" to space
        .replace(/\s+/g, ' ')                        // Normalize whitespace
        .trim();

    // Remove common venue type suffixes
    normalized = normalized.replace(/\s+(bar|pub|club|venue|hall|hotel|theatre|theater|lounge|room|warehouse)(\s+(bar|pub|club|venue|hall|hotel|theatre|theater|lounge|room|warehouse))*$/i, '');

    // Remove trailing 's' from each word to normalize possessives and plurals
    normalized = normalized.split(' ').map(word => word.replace(/s$/, '')).join(' ').trim();

    // Remove city names from the end
    cities.forEach(city => {
        const regex = new RegExp(`\\s+${city}$`, 'i');
        normalized = normalized.replace(regex, '');
    });

    return normalized.trim();
}

export async function getOrCreateVenue(client, venueName, city = null) {
    // Normalize the venue name
    const normalized = normalizeVenueName(venueName);

    // Try to find existing venue using normalized name
    const venueRes = await client.query(
        'SELECT id, name FROM venues WHERE normalized_name = $1 AND (city = $2 OR $2 IS NULL OR city IS NULL)',
        [normalized, city]
    );

    if (venueRes.rows.length > 0) {
        const venue = venueRes.rows[0];
        console.log(`  ♻️  Using existing venue: "${venue.name}" (ID: ${venue.id})`);
        return venue.id;
    }

    // Venue doesn't exist - create it with normalized_name
    const newVenue = await client.query(
        'INSERT INTO venues (name, normalized_name, city) VALUES ($1, $2, $3) RETURNING id',
        [venueName, normalized, city]
    );

    console.log(`  🆕 Created new venue: "${venueName}" (normalized: "${normalized}")`);
    return newVenue.rows[0].id;
}
