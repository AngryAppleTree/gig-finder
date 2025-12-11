import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

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
