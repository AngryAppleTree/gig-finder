import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

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

    const client = await pool.connect();
    try {
        // Fetch all future events + recent past with venue names
        const res = await client.query(`
            SELECT 
                e.*,
                v.name as venue_name
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE e.date >= NOW() - INTERVAL '7 days'
            ORDER BY e.date ASC
            LIMIT 200
        `);

        // Map venue_name to venue for frontend compatibility
        const eventsWithVenue = res.rows.map(event => ({
            ...event,
            venue: event.venue_name || 'Unknown Venue'
        }));

        return NextResponse.json({ events: eventsWithVenue });
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

        const client = await pool.connect();
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

        const client = await pool.connect();
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

        const client = await pool.connect();
        try {
            // Update Internal Ticketing
            if (isInternalTicketing !== undefined) {
                await client.query('UPDATE events SET is_internal_ticketing = $1 WHERE id = $2', [isInternalTicketing, id]);
            }

            // Update Approved Status
            if (approved !== undefined) {
                await client.query('UPDATE events SET approved = $1 WHERE id = $2', [approved, id]);
            }
            return NextResponse.json({ success: true, message: 'Updated' });
        } finally {
            client.release();
        }
    } catch (e: any) {
        console.error('Update error:', e);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
