import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;

        const client = await getPool().connect();

        try {
            // Fetch event with venue information
            const result = await client.query(`
                SELECT 
                    e.*,
                    e.verified as event_verified,
                    v.name as venue_name,
                    v.capacity as venue_capacity,
                    v.latitude as venue_latitude,
                    v.longitude as venue_longitude,
                    v.city as venue_city,
                    v.postcode as venue_postcode,
                    v.address as venue_address,
                    v.verified as venue_verified
                FROM events e
                LEFT JOIN venues v ON e.venue_id = v.id
                WHERE e.id = $1 AND e.approved = true
            `, [eventId]);

            if (result.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Event not found' },
                    { status: 404 }
                );
            }

            const e = result.rows[0];

            // Format the event data (same as /api/events)
            const venueName = e.venue_name || 'Unknown Venue';
            const venueCity = e.venue_city || 'Edinburgh';
            const venueLat = e.venue_latitude || 55.9533;
            const venueLon = e.venue_longitude || -3.1883;
            const venueCapacity = e.venue_capacity || null;

            const event = {
                id: e.id,
                name: e.name,
                location: venueName,
                venue: venueName,
                town: venueCity,
                coords: { lat: venueLat, lon: venueLon },
                capacity: venueCapacity,
                dateObj: e.date,
                date: new Date(e.date).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                }),
                time: e.date.toString().match(/\d{2}:\d{2}/)?.[0] || 'TBA',
                priceVal: parseFloat(e.price) || 0,
                price: e.price,
                vibe: e.genre || 'all',
                ticketUrl: e.ticket_url || null,
                description: e.description,
                imageUrl: e.image_url || '',
                source: e.user_id && e.user_id.startsWith('user_') ? 'manual' : 'scraped',
                priority: 1,
                isInternalTicketing: e.is_internal_ticketing || false,
                sellTickets: e.sell_tickets || false,
                ticketsSold: e.tickets_sold || 0,
                maxCapacity: e.max_capacity || venueCapacity || 100,
                ticketPrice: e.ticket_price || 0,
                presale_price: e.presale_price || null,
                presale_caption: e.presale_caption || null,
                isVerified: e.event_verified && e.venue_verified
            };

            return NextResponse.json({ event });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error fetching event:', error);
        return NextResponse.json(
            { error: 'Failed to fetch event' },
            { status: 500 }
        );
    }
}
