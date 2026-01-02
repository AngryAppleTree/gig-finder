import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';


async function checkAdmin() {
    const user = await currentUser();
    if (!user) return false;

    // Check metadata role OR verified email address
    const isAdminRole = user.publicMetadata?.role === 'admin';
    const isAdminEmail = user.emailAddresses.some(email =>
        email.emailAddress === process.env.ADMIN_EMAIL
    );

    return isAdminRole || isAdminEmail;
}

export async function GET(req: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const client = await getPool().connect();
    try {
        // Get total count
        const countRes = await client.query(`
            SELECT COUNT(*) 
            FROM events e
            WHERE e.date >= NOW() - INTERVAL '7 days'
        `);
        const totalCount = parseInt(countRes.rows[0].count);

        // Fetch events with unapproved first, then by date
        const res = await client.query(`
            SELECT 
                e.*,
                v.name as venue_name
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE e.date >= NOW() - INTERVAL '7 days'
            ORDER BY 
                CASE WHEN e.approved = false THEN 0 ELSE 1 END,
                e.date ASC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        // Map venue_name to venue for frontend compatibility
        const eventsWithVenue = res.rows.map(event => ({
            ...event,
            venue: event.venue_name || 'Unknown Venue'
        }));

        return NextResponse.json({
            events: eventsWithVenue,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } finally {
        client.release();
    }
}

export async function DELETE(req: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { id } = body;

        const client = await getPool().connect();
        try {
            // Delete associated bookings first to prevent Foreign Key violation
            await client.query('DELETE FROM bookings WHERE event_id = $1', [id]);
            // Then delete the event
            await client.query('DELETE FROM events WHERE id = $1', [id]);
            return NextResponse.json({ message: 'Deleted' });
        } finally {
            client.release();
        }
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, venue, venueId, date, time, price, ticket_url, description, genre } = body;

        const dateTimeStr = `${date}T${time}:00`;
        const dateObj = new Date(dateTimeStr);

        const client = await getPool().connect();
        try {
            // If venueId provided, use it; otherwise try to find venue by name
            let finalVenueId = venueId;
            let venueName = venue;

            if (!finalVenueId && venue) {
                // Try to find venue by name
                const venueResult = await client.query('SELECT id, name FROM venues WHERE name = $1', [venue]);
                if (venueResult.rows[0]) {
                    finalVenueId = venueResult.rows[0].id;
                    venueName = venueResult.rows[0].name;
                }
            } else if (finalVenueId && !venueName) {
                // Get venue name for fingerprint
                const venueResult = await client.query('SELECT name FROM venues WHERE id = $1', [finalVenueId]);
                if (venueResult.rows[0]) {
                    venueName = venueResult.rows[0].name;
                }
            }

            const fingerprint = `${date}|${(venueName || 'unknown').toLowerCase()}|${name.toLowerCase().trim()}`;

            const res = await client.query(`
                INSERT INTO events (
                    name, venue_id, date, price, ticket_url, description, 
                    fingerprint, user_id, approved, created_at, genre
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)
                RETURNING id
            `, [
                name, finalVenueId || null, dateObj, price, ticket_url, description,
                fingerprint, 'admin', true, genre
            ]);
            return NextResponse.json({ message: 'Created', id: res.rows[0].id });
        } finally {
            client.release();
        }
    } catch (e: any) {
        console.error('Create error:', e);
        return NextResponse.json({ error: 'Failed to create event: ' + e.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { id, isInternalTicketing, approved } = body;

        const pool = getPool();
        const client = await pool.connect();

        let shouldNotifyUser = false;
        let userData: { eventName: string; userId: string } | null = null;

        try {
            // Update Internal Ticketing
            if (isInternalTicketing !== undefined) {
                await client.query('UPDATE events SET is_internal_ticketing = $1 WHERE id = $2', [isInternalTicketing, id]);
            }

            // Update Approved Status
            if (approved !== undefined) {
                if (approved === true) {
                    const eventRes = await client.query('SELECT user_id, name FROM events WHERE id = $1', [id]);
                    if (eventRes.rows[0]) {
                        const { user_id, name } = eventRes.rows[0];

                        // Check if user has any other approved events
                        const countRes = await client.query(
                            'SELECT COUNT(*) FROM events WHERE user_id = $1 AND approved = true AND id != $2',
                            [user_id, id]
                        );

                        const isFirst = parseInt(countRes.rows[0].count) === 0;

                        if (isFirst && user_id && user_id.startsWith('user_')) {
                            shouldNotifyUser = true;
                            userData = { userId: user_id, eventName: name };
                        }
                    }
                }

                await client.query('UPDATE events SET approved = $1 WHERE id = $2', [approved, id]);
            }
        } finally {
            // CRITICAL: Release the client before moving on to async/external calls
            client.release();
        }

        // Side effect: Notify user if first approval
        if (shouldNotifyUser && userData) {
            // Run in background, don't await to keep Admin UI snappy
            (async () => {
                try {
                    const { clerkClient } = await import('@clerk/nextjs/server');
                    const clerk = await clerkClient();
                    const user = await clerk.users.getUser(userData!.userId);
                    const email = user.emailAddresses[0]?.emailAddress;

                    if (email) {
                        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                        await fetch(`${appUrl}/api/admin/notify-event-approved`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userEmail: email,
                                eventName: userData!.eventName,
                                userId: userData!.userId
                            })
                        });
                        console.log(`✅ Triggered notification for ${email}`);
                    }
                } catch (err) {
                    console.error('Background notification error:', err);
                }
            })();
        }

        return NextResponse.json({ success: true, message: 'Updated' });

    } catch (e: any) {
        console.error('Update error:', e);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
