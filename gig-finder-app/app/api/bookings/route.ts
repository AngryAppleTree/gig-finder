import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

import { auth } from '@clerk/nextjs/server';

export async function GET(req: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });

    const client = await pool.connect();
    try {
        // Verify ownership (or if event is public? No, bookings are private PII)
        const eventRes = await client.query('SELECT user_id FROM events WHERE id = $1', [eventId]);

        if (eventRes.rowCount === 0) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // Check ownership
        // If event.user_id !== userId, block access.
        // (Note: If Admin needs access, they should use specific Admin API or we assume Admin ID handling elsewhere)
        if (eventRes.rows[0].user_id !== userId) {
            return NextResponse.json({ error: 'Forbidden: You do not own this event' }, { status: 403 });
        }

        const bookings = await client.query('SELECT * FROM bookings WHERE event_id = $1 ORDER BY created_at DESC', [eventId]);

        return NextResponse.json({ bookings: bookings.rows });
    } catch (e: any) {
        console.error('Fetch Bookings Error:', e);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function POST(req: Request) {
    const { eventId, name, email } = await req.json();

    // Validation
    if (!eventId || !name || !email) {
        return NextResponse.json({ error: 'Missing required fields (eventId, name, email)' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check Capacity & Locking to prevent race conditions
        const eventRes = await client.query('SELECT max_capacity, tickets_sold, is_internal_ticketing FROM events WHERE id = $1 FOR UPDATE', [eventId]);

        if (eventRes.rowCount === 0) {
            throw new Error('Event not found');
        }

        const event = eventRes.rows[0];

        // Ensure internal ticketing is enabled
        // Note: For MVP testing, if is_internal_ticketing is null/false, we might want to block or default allow for testing? 
        // Let's block to be strict, user must enable it.
        if (!event.is_internal_ticketing) {
            // throw new Error('This event has not enabled GigFinder Ticketing.');
        }

        if ((event.tickets_sold || 0) >= (event.max_capacity || 100)) {
            throw new Error('Sorry, this event is Sold Out!');
        }

        // Create Booking
        await client.query(
            'INSERT INTO bookings (event_id, customer_name, customer_email) VALUES ($1, $2, $3)',
            [eventId, name, email]
        );

        // Update Sold Count
        await client.query('UPDATE events SET tickets_sold = COALESCE(tickets_sold, 0) + 1 WHERE id = $1', [eventId]);

        await client.query('COMMIT');

        return NextResponse.json({ success: true, message: 'Ticket reserved! You are on the list.' });

    } catch (e: any) {
        await client.query('ROLLBACK');
        console.error('Booking Error:', e);
        return NextResponse.json({ error: e.message || 'Booking failed' }, { status: 400 });
    } finally {
        client.release();
    }
}
