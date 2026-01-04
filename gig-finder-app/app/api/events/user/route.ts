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
            // Fetch single event with booking counts
            const result = await client.query(
                `SELECT 
                    e.*,
                    v.name as venue_name,
                    COALESCE(
                        (SELECT COUNT(*) FROM bookings WHERE event_id = e.id AND status = 'confirmed'),
                        0
                    ) as tickets_sold,
                    COALESCE(
                        (SELECT COUNT(*) FROM bookings WHERE event_id = e.id AND status = 'confirmed' AND amount = 0),
                        0
                    ) as guests_registered
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

        return NextResponse.json({ events: result.rows });

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
                    venue = $2,
                    venue_id = $3,
                    date = $4, 
                    genre = $5, 
                    description = $6, 
                    price = $7,
                    presale_price = $8,
                    presale_caption = $9,
                    fingerprint = $10,
                    is_internal_ticketing = $11,
                    sell_tickets = $12,
                    image_url = $13
                 WHERE id = $14 AND user_id = $15
                 RETURNING id`,
                [
                    name,
                    venue,
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
