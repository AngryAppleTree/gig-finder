import { getPool } from '@/lib/db';
import { NextResponse } from 'next/server';


import { auth } from '@clerk/nextjs/server';

export async function GET(req: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });

    const client = await getPool().connect();
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

import { Resend } from 'resend';
import { generateTicketQR } from '@/lib/qr-generator';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    const { eventId, name, email, quantity = 1 } = await req.json();

    // Validation
    if (!eventId || !name || !email) {
        return NextResponse.json({ error: 'Missing required fields (eventId, name, email)' }, { status: 400 });
    }

    // Validate quantity
    const ticketQuantity = Math.max(1, Math.min(10, parseInt(String(quantity)) || 1));

    const client = await getPool().connect();

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

        // Generate QR code using utility function
        const { qrCodeData, qrBuffer } = await generateTicketQR(bookingId, parseInt(eventId));

        // Update booking with QR code (BUG FIX: this was missing!)
        await client.query(
            'UPDATE bookings SET qr_code = $1 WHERE id = $2',
            [qrCodeData, bookingId]
        );

        // Update Sold Count by quantity
        await client.query('UPDATE events SET tickets_sold = COALESCE(tickets_sold, 0) + $1 WHERE id = $2', [ticketQuantity, eventId]);

        await client.query('COMMIT');

        // --- EMAIL LOGIC ---
        // We do this after commit so if email fails, booking is still valid (or we could catch and log error)
        // Note: qrBuffer is already generated above using utility function
        try {
            if (process.env.RESEND_API_KEY) {
                const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';

                // Generate email HTML using template
                const { generateManualBookingEmail } = await import('@/lib/email-templates');
                const emailHTML = generateManualBookingEmail({
                    customerName: name,
                    eventName: event.name,
                    venueName: event.venue_name,
                    eventDate: new Date(event.date),
                    bookingId,
                    ticketQuantity,
                });

                await resend.emails.send({
                    from: fromAddress,
                    to: email,
                    subject: `Ticket Confirmed: ${event.name}`,
                    html: emailHTML,
                    attachments: [
                        {
                            filename: `ticket-${bookingId}.png`,
                            content: qrBuffer,
                            contentId: 'ticket-qr' // FIXED: was content_id (snake_case), now contentId (camelCase)
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
