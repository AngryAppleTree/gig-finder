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
            // Fetch single event
            const result = await client.query(
                `SELECT * FROM events WHERE id = $1 AND user_id = $2`,
                [eventId, userId]
            );
            client.release();

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Event not found' }, { status: 404 });
            }
            return NextResponse.json({ event: result.rows[0] });
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
        const { id, name, venue, date, time, genre, description, price, isInternalTicketing } = body;

        if (!id || !name || !venue || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const fingerprint = `${date}|${venue.toLowerCase().trim()}|${name.toLowerCase().trim()}`;
        const timestamp = time ? `${date} ${time}` : `${date} 00:00:00`;

        const client = await getPool().connect();

        const result = await client.query(
            `UPDATE events SET 
                name = $1, 
                venue = $2, 
                date = $3, 
                genre = $4, 
                description = $5, 
                price = $6,
                fingerprint = $7,
                is_internal_ticketing = $8
             WHERE id = $9 AND user_id = $10
             RETURNING id`,
            [name, venue, timestamp, genre, description, price, fingerprint, isInternalTicketing || false, id, userId]
        );

        client.release();

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
