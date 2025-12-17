/**
 * Venue lookup helper for scrapers
 * Finds venue by name or creates it if it doesn't exist
 */

export async function getOrCreateVenue(client, venueName) {
    // Try to find existing venue (case-insensitive)
    const venueRes = await client.query(
        'SELECT id FROM venues WHERE LOWER(name) = LOWER($1)',
        [venueName]
    );

    if (venueRes.rows.length > 0) {
        return venueRes.rows[0].id;
    }

    // Venue doesn't exist - create it
    const newVenue = await client.query(
        'INSERT INTO venues (name) VALUES ($1) RETURNING id',
        [venueName]
    );

    console.log(`  ℹ️  Created new venue: ${venueName}`);
    return newVenue.rows[0].id;
}
