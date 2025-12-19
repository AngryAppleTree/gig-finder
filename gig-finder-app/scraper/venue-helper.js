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
    return name
        .toLowerCase()
        .replace(/^the\s+/i, '')                    // Remove leading "The"
        .replace(/[^a-z0-9\s]/g, '')                 // Remove punctuation (matches PostgreSQL)
        .replace(/\s+/g, ' ')                        // Normalize whitespace
        .trim();
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
