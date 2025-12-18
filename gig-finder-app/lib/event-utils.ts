/**
 * Shared Event Utilities
 * Reusable functions for managing events from API scrapers (Skiddle, Ticketmaster, etc.)
 */

import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

export interface EventData {
    name: string;
    venueId: number;
    date: string; // ISO timestamp or date string
    time?: string;
    genre?: string;
    description?: string;
    price?: string; // Display price (e.g., "£15.00", "Free")
    ticketPrice?: number; // Numeric price for filtering
    ticketUrl?: string;
    imageUrl?: string;
    source: string; // 'skiddle', 'ticketmaster', etc.
}

export interface EventResult {
    id: number;
    name: string;
    venueId: number;
    date: Date;
    isNew: boolean;
}

/**
 * Find or create an event in the database
 * Used by API scrapers to ensure events exist before displaying
 * 
 * @param eventData - Event information from API
 * @returns Event record with id and metadata
 */
export async function findOrCreateEvent(
    eventData: EventData
): Promise<EventResult> {
    const client = await pool.connect();

    try {
        // Create fingerprint for deduplication: date|venue_id|name
        const dateStr = new Date(eventData.date).toISOString().split('T')[0];
        const fingerprint = `${dateStr}|venue_${eventData.venueId}|${eventData.name.toLowerCase().trim()}`;

        // 1. Check if event already exists (by fingerprint)
        const existingEvent = await client.query(
            `SELECT id, name, venue_id, date 
             FROM events 
             WHERE fingerprint = $1`,
            [fingerprint]
        );

        if (existingEvent.rows.length > 0) {
            // Event exists - return it
            const event = existingEvent.rows[0];
            return {
                id: event.id,
                name: event.name,
                venueId: event.venue_id,
                date: event.date,
                isNew: false
            };
        }

        // 2. Event doesn't exist - create it
        console.log(`🆕 Creating new event from ${eventData.source}:`, eventData.name);

        // Build timestamp
        const timestamp = eventData.time
            ? `${eventData.date} ${eventData.time}:00`
            : `${eventData.date} 00:00:00`;

        // Parse price
        let displayPrice = eventData.price || 'TBA';
        let ticketPrice = eventData.ticketPrice || null;

        if (!ticketPrice && eventData.price) {
            // Try to extract numeric price from display price
            const numericPrice = eventData.price.replace(/[^\d.]/g, '');
            const parsedPrice = parseFloat(numericPrice);
            if (!isNaN(parsedPrice)) {
                ticketPrice = parsedPrice;
                displayPrice = parsedPrice === 0 ? 'Free' : `£${parsedPrice.toFixed(2)}`;
            }
        }

        const newEvent = await client.query(
            `INSERT INTO events (
                name, venue_id, date, genre, description, 
                price, ticket_price, price_currency, ticket_url, image_url,
                user_id, fingerprint, approved, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
            RETURNING id, name, venue_id, date`,
            [
                eventData.name,
                eventData.venueId,
                timestamp,
                eventData.genre || null,
                eventData.description || null,
                displayPrice,
                ticketPrice,
                'GBP',
                eventData.ticketUrl || null,
                eventData.imageUrl || null,
                `scraper_${eventData.source}`, // Mark as scraped event
                fingerprint,
                true // Auto-approve scraped events
            ]
        );

        const event = newEvent.rows[0];

        return {
            id: event.id,
            name: event.name,
            venueId: event.venue_id,
            date: event.date,
            isNew: true
        };

    } finally {
        client.release();
    }
}

/**
 * Batch find or create multiple events
 * Useful for scrapers that process multiple events at once
 * 
 * @param events - Array of event data
 * @returns Array of event results
 */
export async function findOrCreateEvents(
    events: EventData[]
): Promise<EventResult[]> {
    const results: EventResult[] = [];

    for (const eventData of events) {
        try {
            const result = await findOrCreateEvent(eventData);
            results.push(result);
        } catch (error) {
            console.error(`Failed to process event ${eventData.name}:`, error);
            // Continue with other events even if one fails
        }
    }

    return results;
}

/**
 * Update event information if new data is available
 * Used when API provides more complete data than what's in the database
 * 
 * @param eventId - Database ID of the event
 * @param updates - Partial event data to update
 */
export async function updateEventData(
    eventId: number,
    updates: Partial<EventData>
): Promise<void> {
    const client = await pool.connect();

    try {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        // Build dynamic UPDATE query for non-null fields
        if (updates.description !== undefined) {
            fields.push(`description = $${paramCount++}`);
            values.push(updates.description);
        }
        if (updates.price !== undefined) {
            fields.push(`price = $${paramCount++}`);
            values.push(updates.price);
        }
        if (updates.ticketPrice !== undefined) {
            fields.push(`ticket_price = $${paramCount++}`);
            values.push(updates.ticketPrice);
        }
        if (updates.ticketUrl !== undefined) {
            fields.push(`ticket_url = $${paramCount++}`);
            values.push(updates.ticketUrl);
        }
        if (updates.imageUrl !== undefined) {
            fields.push(`image_url = $${paramCount++}`);
            values.push(updates.imageUrl);
        }
        if (updates.genre !== undefined) {
            fields.push(`genre = $${paramCount++}`);
            values.push(updates.genre);
        }

        if (fields.length === 0) {
            return; // Nothing to update
        }

        values.push(eventId);
        const query = `UPDATE events SET ${fields.join(', ')} WHERE id = $${paramCount}`;

        await client.query(query, values);
        console.log(`✅ Updated event ID ${eventId}`);

    } finally {
        client.release();
    }
}

/**
 * Delete old events (cleanup utility)
 * Removes events older than a specified date
 * 
 * @param beforeDate - Delete events before this date
 * @param source - Optional: only delete from specific source
 */
export async function deleteOldEvents(
    beforeDate: Date,
    source?: string
): Promise<number> {
    const client = await pool.connect();

    try {
        let query = 'DELETE FROM events WHERE date < $1';
        const params: any[] = [beforeDate];

        if (source) {
            query += ' AND user_id = $2';
            params.push(`scraper_${source}`);
        }

        const result = await client.query(query, params);
        const deletedCount = result.rowCount || 0;

        console.log(`🗑️  Deleted ${deletedCount} old events`);
        return deletedCount;

    } finally {
        client.release();
    }
}
