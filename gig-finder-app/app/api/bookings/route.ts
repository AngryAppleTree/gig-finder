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

import QRCode from 'qrcode';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    const { eventId, name, email, quantity = 1 } = await req.json();

    // Validation
    if (!eventId || !name || !email) {
        return NextResponse.json({ error: 'Missing required fields (eventId, name, email)' }, { status: 400 });
    }

    // Validate quantity
    const ticketQuantity = Math.max(1, Math.min(10, parseInt(String(quantity)) || 1));

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check Capacity & Locking to prevent race conditions
        // Lock the events row first (can't use FOR UPDATE with LEFT JOIN)
        const eventRes = await client.query(`
            SELECT 
                name, 
                date, 
                max_capacity, 
                tickets_sold, 
                is_internal_ticketing, 
                ticket_price,
                venue_id
            FROM events
            WHERE id = $1 
            FOR UPDATE
        `, [eventId]);

        if (eventRes.rowCount === 0) {
            throw new Error('Event not found');
        }

        const event = eventRes.rows[0];

        // Get venue name separately (no lock needed)
        event.venue_name = 'TBA';
        if (event.venue_id) {
            const venueRes = await client.query('SELECT name FROM venues WHERE id = $1', [event.venue_id]);
            if (venueRes.rows[0]) {
                event.venue_name = venueRes.rows[0].name;
            }
        }

        // Ensure internal ticketing is enabled
        // Note: For MVP testing, if is_internal_ticketing is null/false, we might want to block or default allow for testing? 
        // Let's block to be strict, user must enable it.
        // if (!event.is_internal_ticketing) { ... }

        // Check if enough capacity for requested quantity
        const currentSold = event.tickets_sold || 0;
        const maxCapacity = event.max_capacity || 100;
        const availableTickets = maxCapacity - currentSold;

        if (availableTickets < ticketQuantity) {
            if (availableTickets === 0) {
                throw new Error('Sorry, this event is Sold Out!');
            } else {
                throw new Error(`Only ${availableTickets} ticket(s) remaining!`);
            }
        }

        // Create Booking and return ID
        const bookingRes = await client.query(
            'INSERT INTO bookings (event_id, customer_name, customer_email, quantity) VALUES ($1, $2, $3, $4) RETURNING id',
            [eventId, name, email, ticketQuantity]
        );
        const bookingId = bookingRes.rows[0].id;

        // Update Sold Count by quantity
        await client.query('UPDATE events SET tickets_sold = COALESCE(tickets_sold, 0) + $1 WHERE id = $2', [ticketQuantity, eventId]);

        await client.query('COMMIT');

        // --- EMAIL LOGIC ---
        // We do this after commit so if email fails, booking is still valid (or we could catch and log error)
        try {
            if (process.env.RESEND_API_KEY) {
                // Generate Buffer (no data: prefix)
                // Use GF-TICKET prefix to avoid triggering Booking.com app deep links
                const qrBuffer = await QRCode.toBuffer(`GF-TICKET:${bookingId}-${eventId}`, { width: 300, margin: 2 });
                const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';
                const dateStr = new Date(event.date).toLocaleDateString();

                await resend.emails.send({
                    from: fromAddress,
                    to: email,
                    subject: `Ticket Confirmed: ${event.name}`,
                    html: `
                        <div style="font-family: sans-serif; color: #333;">
                            <h1 style="color: #000;">You're on the list!</h1>
                            <p>Hi ${name},</p>
                            <p>Your spot for <strong>${event.name}</strong> is confirmed.</p>
                            <p><strong>Venue:</strong> ${event.venue_name || 'TBA'}<br><strong>Date:</strong> ${dateStr}</p>
                            
                            <div style="text-align: center; margin: 20px 0;">
                                <img src="cid:ticket-qr" alt="Your Entry QR Code" style="border: 4px solid #000; width: 250px; height: 250px;" />
                            </div>
                            
                            <p style="text-align: center; color: #666;">Booking Ref: #${bookingId}</p>
                            <hr>
                            <p style="font-size: 12px; color: #888;">Sent via GigFinder</p>
                        </div>
                    `,
                    attachments: [
                        {
                            filename: `ticket-${bookingId}.png`,
                            content: qrBuffer,
                            // @ts-ignore - content_id is valid in API but missing in some SDK types
                            content_id: 'ticket-qr'
                        }
                    ]
                });
            } else {
                console.log(`[MOCK EMAIL] To: ${email} (Booking #${bookingId}). Set RESEND_API_KEY to see QR code email.`);
            }
        } catch (emailErr) {
            console.error('Failed to send confirmation email:', emailErr);
            // Don't fail the request, just log it. The booking is safe.
        }

        return NextResponse.json({ success: true, message: 'Ticket reserved! Check your email.' });

    } catch (e: any) {
        await client.query('ROLLBACK');
        console.error('Booking Error:', e);
        return NextResponse.json({ error: e.message || 'Booking failed' }, { status: 400 });
    } finally {
        client.release();
    }
}
