/**
 * Public Events Search API
 * 
 * This endpoint ONLY queries the database.
 * It does NOT scrape or fetch from external APIs.
 * 
 * For data ingestion, use /api/admin/scrape-skiddle (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { mapGenreToVibe } from './genre-mapping';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { getPool } from '@/lib/db';

export async function GET(request: NextRequest) {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = checkRateLimit(clientIp, RATE_LIMITS.api);

    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
                    'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString()
                }
            }
        );
    }

    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get('location') || 'Edinburgh';
    const genre = searchParams.get('genre');
    const minDate = searchParams.get('minDate');
    const maxDate = searchParams.get('maxDate');
    const keyword = searchParams.get('keyword');

    // Fetch Manual Gigs (Database Only) with Venue Info
    let manualEvents: any[] = [];
    try {
        const client = await getPool().connect();
        // JOIN with venues table to get rich venue data
        let query = `
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
            WHERE e.date >= CURRENT_DATE AND e.approved = true
        `;
        const params: any[] = [];

        if (keyword) {
            query += ` AND (e.name ILIKE $1 OR v.name ILIKE $1)`;
            params.push(`%${keyword}%`);
        }

        query += ' ORDER BY e.date ASC';

        const res = await client.query(query, params);
        manualEvents = res.rows;
        client.release();
    } catch (e) {
        console.error('Failed to fetch events from DB:', e);
        return NextResponse.json(
            { error: 'Database error', success: false },
            { status: 500 }
        );
    }

    // Format events for display
    const formattedEvents = manualEvents.map(e => {
        const dateStr = new Date(e.date).toISOString().split('T')[0];
        const venueName = e.venue_name || e.venue || 'Unknown Venue';

        // Use venue data from JOIN or fallback to defaults
        const venueCity = e.venue_city || location;
        const venueLat = e.venue_latitude || 55.9533; // Default to Edinburgh center
        const venueLon = e.venue_longitude || -3.1883;
        const venueCapacity = e.venue_capacity || null;

        return {
            id: e.id,  // Use numeric ID directly
            name: e.name,
            location: venueName,
            venue: venueName,
            town: venueCity,
            coords: { lat: venueLat, lon: venueLon }, // Real coordinates from venues table
            capacity: venueCapacity || null, // Return as number from venues table
            dateObj: e.date, // Timestamp
            date: new Date(e.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
            time: e.date.toString().match(/\d{2}:\d{2}/)?.[0] || 'TBA', // Extract time from timestamp
            priceVal: parseFloat(e.price?.toString().replace(/[^\d.]/g, '')) || 0,
            price: e.price,
            vibe: e.genre ? mapGenreToVibe([{ name: e.genre }]) : 'all',
            ticketUrl: e.ticket_url || null, // Use DB ticket_url or null
            description: e.description,
            imageUrl: e.image_url || '', // Use stored image or empty
            // Determine source: user-created vs scraped
            // Scrapers use user_id like 'scraper_banshee', real users have Clerk IDs starting with 'user_'
            source: e.user_id && e.user_id.startsWith('user_') ? 'manual' : 'scraped',
            priority: 1,
            // Ticketing Fields
            isInternalTicketing: e.is_internal_ticketing || false,
            sellTickets: e.sell_tickets || false,
            ticketsSold: e.tickets_sold || 0,
            maxCapacity: e.max_capacity || venueCapacity || 100,
            ticketPrice: e.ticket_price || 0,  // Add numeric price for modal
            // Presale Fields
            presale_price: e.presale_price || null,
            presale_caption: e.presale_caption || null,
            // Verification status
            isVerified: e.event_verified && e.venue_verified
        };
    });

    // Sort by Date
    formattedEvents.sort((a, b) => new Date(a.dateObj).getTime() - new Date(b.dateObj).getTime());

    return NextResponse.json({
        success: true,
        count: formattedEvents.length,
        events: formattedEvents,
        source: 'database'
    }, {
        headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
        }
    });
}
