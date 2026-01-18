import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getPool } from '@/lib/db';
import { logAudit, AuditAction } from '@/lib/audit';
import { getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const eventId = searchParams.get('id');

        const client = await getPool().connect();

        if (eventId) {
            // Fetch single event with total booking count
            const result = await client.query(
                `SELECT 
                    e.*,
                    v.name as venue_name,
                    COALESCE(
                        (SELECT COUNT(*) FROM bookings WHERE event_id = e.id AND status = 'confirmed'),
                        0
                    ) as bookings_count
                FROM events e
                LEFT JOIN venues v ON e.venue_id = v.id
                WHERE e.id = $1 AND e.user_id = $2`,
                [eventId, userId]
            );
            client.release();

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Event not found' }, { status: 404 });
            }

            const event = result.rows[0];
            // Add venue name if available
            if (event.venue_name && !event.venue) {
                event.venue = event.venue_name;
            }

            return NextResponse.json({ event });
        }

        // Fetch all users gigs
        const result = await client.query(
            `SELECT * FROM events WHERE user_id = $1 ORDER BY date DESC, created_at DESC`,
            [userId]
        );
        client.release();

        // Transform snake_case to camelCase for consistency
        const events = result.rows.map(e => ({
            ...e,
            isInternalTicketing: e.is_internal_ticketing || false,
            sellTickets: e.sell_tickets || false,
        }));

        return NextResponse.json({ events });

    } catch (error: any) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            id,
            name,
            venue,
            venue_id,
            new_venue,
            date,
            time,
            genre,
            description,
            price,
            presale_price,
            presale_caption,
            is_internal_ticketing,
            sell_tickets,
            imageUrl
        } = body;

        if (!id || !name || !venue || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const fingerprint = `${date}|${venue.toLowerCase().trim()}|${name.toLowerCase().trim()}`;
        const timestamp = time ? `${date} ${time}` : `${date} 00:00:00`;

        const client = await getPool().connect();

        try {
            // Handle new venue creation if needed
            let finalVenueId = venue_id;

            if (new_venue && !venue_id) {
                // Create new venue
                const venueResult = await client.query(
                    `INSERT INTO venues (name, city, capacity, approved, verified)
                     VALUES ($1, $2, $3, true, false)
                     RETURNING id`,
                    [new_venue.name, new_venue.city, new_venue.capacity]
                );
                finalVenueId = venueResult.rows[0].id;
            }

            // Update event
            const result = await client.query(
                `UPDATE events SET 
                    name = $1, 
                    venue_id = $2,
                    date = $3, 
                    genre = $4, 
                    description = $5, 
                    price = $6,
                    presale_price = $7,
                    presale_caption = $8,
                    fingerprint = $9,
                    is_internal_ticketing = $10,
                    sell_tickets = $11,
                    image_url = $12
                 WHERE id = $13 AND user_id = $14
                 RETURNING id`,
                [
                    name,
                    finalVenueId,
                    timestamp,
                    genre,
                    description,
                    price,
                    presale_price || null,
                    presale_caption || null,
                    fingerprint,
                    is_internal_ticketing || false,
                    sell_tickets || false,
                    imageUrl || null,
                    id,
                    userId
                ]
            );

            if (result.rowCount === 0) {
                return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
            }

            // Audit log
            await logAudit({
                action: AuditAction.EVENT_UPDATED,
                userId,
                ipAddress: getClientIp(request),
                resourceType: 'event',
                resourceId: id,
                details: { name, venue, date },
                success: true
            });

            return NextResponse.json({ success: true, id });

        } finally {
            client.release();
        }

    } catch (error: any) {
        console.error('Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const eventId = searchParams.get('id');

        if (!eventId) {
            return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
        }

        const client = await getPool().connect();

        // Get event details before deletion for audit log
        const eventResult = await client.query(
            `SELECT name, venue, date FROM events WHERE id = $1 AND user_id = $2`,
            [eventId, userId]
        );

        // Security: ONLY delete if id matches AND user_id matches
        const result = await client.query(
            `DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING id`,
            [eventId, userId]
        );

        client.release();

        if (result.rowCount === 0) {
            await logAudit({
                action: AuditAction.EVENT_DELETED,
                userId,
                ipAddress: getClientIp(request),
                resourceType: 'event',
                resourceId: eventId,
                success: false,
                errorMessage: 'Event not found or unauthorized'
            });
            return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
        }

        // Audit log successful deletion
        await logAudit({
            action: AuditAction.EVENT_DELETED,
            userId,
            ipAddress: getClientIp(request),
            resourceType: 'event',
            resourceId: eventId,
            details: eventResult.rows[0] || {},
            success: true
        });

        return NextResponse.json({ success: true, deletedId: eventId });

    } catch (error: any) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
