import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';


export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { qrData } = await req.json();

        if (!qrData || typeof qrData !== 'string') {
            return NextResponse.json({ error: 'No QR data provided' }, { status: 400 });
        }

        // Parse Format: GF-TICKET:{bookingId}-{eventId}
        // Example: GF-TICKET:105-24
        const regex = /GF-TICKET:(\d+)-(\d+)/;
        const match = qrData.match(regex);

        if (!match) {
            return NextResponse.json({ error: 'Invalid QR Code Format' }, { status: 400 });
        }

        const bookingId = match[1];
        const ticketEventId = match[2];

        const client = await getPool().connect();
        try {
            // 1. Verify Event Owner
            const eventRes = await client.query('SELECT user_id, name FROM events WHERE id = $1', [ticketEventId]);

            if (eventRes.rowCount === 0) {
                return NextResponse.json({ error: 'Event details not found' }, { status: 404 });
            }

            // Allow admins or owner? For now just owner.
            if (eventRes.rows[0].user_id !== userId) {
                return NextResponse.json({ error: 'Permission Denied: You do not own this event.' }, { status: 403 });
            }

            // 2. Fetch Booking
            const bookingRes = await client.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);

            if (bookingRes.rowCount === 0) {
                return NextResponse.json({ error: 'Ticket ID not found' }, { status: 404 });
            }

            const booking = bookingRes.rows[0];

            // 3. Security Cross-Check
            if (String(booking.event_id) !== String(ticketEventId)) {
                return NextResponse.json({ error: 'Fabricated Ticket (Event ID Mismatch)' }, { status: 400 });
            }

            // 4. Status Check
            if (booking.checked_in_at) {
                const time = new Date(booking.checked_in_at).toLocaleTimeString();
                return NextResponse.json({
                    success: false,
                    error: `ALREADY USED`,
                    details: `Checked in at ${time}`,
                    guest: booking.customer_name,
                    code: 'ALREADY_USED'
                }, { status: 409 });
            }

            // 5. Check-In
            await client.query('UPDATE bookings SET checked_in_at = NOW() WHERE id = $1', [bookingId]);

            return NextResponse.json({
                success: true,
                message: 'Check-In Successful',
                guest: booking.customer_name
            });

        } finally {
            client.release();
        }

    } catch (e: any) {
        console.error('Scan Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
