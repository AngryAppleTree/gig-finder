/**
 * Shared Venue Utilities
 * Reusable functions for managing venues across API scrapers (Skiddle, Ticketmaster, etc.)
 */

import { Pool } from 'pg';
import { sendNewVenueNotification } from './notifications';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

export interface VenueData {
    name: string;
    address?: string;
    city?: string;
    postcode?: string;
    latitude?: number;
    longitude?: number;
    capacity?: number;
    website?: string;
}

export interface VenueResult {
    id: number;
    name: string;
    capacity: number | null;
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    isNew: boolean;
}

/**
 * Find or create a venue in the database
 * Used by API scrapers to ensure venues exist before creating events
 * 
 * @param venueData - Venue information from API
 * @param source - Source of the venue data (e.g., 'skiddle', 'ticketmaster')
 * @returns Venue record with id and metadata
 */
export async function findOrCreateVenue(
    venueData: VenueData,
    source: string = 'api'
): Promise<VenueResult> {
    const client = await pool.connect();

    try {
        // 1. Check if venue already exists (case-insensitive name match)
        const existingVenue = await client.query(
            `SELECT id, name, capacity, latitude, longitude, city 
             FROM venues 
             WHERE LOWER(name) = LOWER($1)`,
            [venueData.name]
        );

        if (existingVenue.rows.length > 0) {
            // Venue exists - return it
            const venue = existingVenue.rows[0];
            return {
                id: venue.id,
                name: venue.name,
                capacity: venue.capacity,
                latitude: venue.latitude,
                longitude: venue.longitude,
                city: venue.city,
                isNew: false
            };
        }

        // 2. Venue doesn't exist - create it
        console.log(`🆕 Creating new venue from ${source}:`, venueData.name);

        const newVenue = await client.query(
            `INSERT INTO venues (name, address, city, postcode, latitude, longitude, capacity, website)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, name, capacity, latitude, longitude, city`,
            [
                venueData.name,
                venueData.address || null,
                venueData.city || null,
                venueData.postcode || null,
                venueData.latitude || null,
                venueData.longitude || null,
                venueData.capacity || null,
                venueData.website || null
            ]
        );

        const venue = newVenue.rows[0];

        // 3. Notify admin about new venue (async, don't wait)
        sendNewVenueNotification(
            venueData.name,
            venueData.city || 'Unknown',
            venueData.capacity ?? undefined,
            `system_${source}`
        ).then(result => {
            if (result.success) {
                console.log(`✅ Admin notified about new venue: ${venueData.name}`);
            } else {
                console.error(`❌ Failed to notify admin about venue: ${venueData.name}`, result.error);
            }
        }).catch(err => {
            console.error(`❌ Error notifying admin:`, err);
        });

        return {
            id: venue.id,
            name: venue.name,
            capacity: venue.capacity,
            latitude: venue.latitude,
            longitude: venue.longitude,
            city: venue.city,
            isNew: true
        };

    } finally {
        client.release();
    }
}

/**
 * Batch find or create multiple venues
 * Useful for scrapers that process multiple events at once
 * 
 * @param venues - Array of venue data
 * @param source - Source identifier
 * @returns Map of venue names to venue results
 */
export async function findOrCreateVenues(
    venues: VenueData[],
    source: string = 'api'
): Promise<Map<string, VenueResult>> {
    const results = new Map<string, VenueResult>();

    for (const venueData of venues) {
        try {
            const result = await findOrCreateVenue(venueData, source);
            results.set(venueData.name.toLowerCase(), result);
        } catch (error) {
            console.error(`Failed to process venue ${venueData.name}:`, error);
            // Continue with other venues even if one fails
        }
    }

    return results;
}

/**
 * Update venue information if new data is available
 * Used when API provides more complete data than what's in the database
 * 
 * @param venueId - Database ID of the venue
 * @param updates - Partial venue data to update
 */
export async function updateVenueData(
    venueId: number,
    updates: Partial<VenueData>
): Promise<void> {
    const client = await pool.connect();

    try {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        // Build dynamic UPDATE query for non-null fields
        if (updates.address !== undefined) {
            fields.push(`address = $${paramCount++}`);
            values.push(updates.address);
        }
        if (updates.city !== undefined) {
            fields.push(`city = $${paramCount++}`);
            values.push(updates.city);
        }
        if (updates.postcode !== undefined) {
            fields.push(`postcode = $${paramCount++}`);
            values.push(updates.postcode);
        }
        if (updates.latitude !== undefined) {
            fields.push(`latitude = $${paramCount++}`);
            values.push(updates.latitude);
        }
        if (updates.longitude !== undefined) {
            fields.push(`longitude = $${paramCount++}`);
            values.push(updates.longitude);
        }
        if (updates.capacity !== undefined) {
            fields.push(`capacity = $${paramCount++}`);
            values.push(updates.capacity);
        }
        if (updates.website !== undefined) {
            fields.push(`website = $${paramCount++}`);
            values.push(updates.website);
        }

        if (fields.length === 0) {
            return; // Nothing to update
        }

        values.push(venueId);
        const query = `UPDATE venues SET ${fields.join(', ')} WHERE id = $${paramCount}`;

        await client.query(query, values);
        console.log(`✅ Updated venue ID ${venueId}`);

    } finally {
        client.release();
    }
}
