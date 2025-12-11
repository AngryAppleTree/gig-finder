import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { auth } from '@clerk/nextjs/server';
import { Resend } from 'resend';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { eventId, subject, message } = await req.json();

        if (!eventId || !subject || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await pool.connect();

        try {
            // Verify ownership
            const eventRes = await client.query('SELECT user_id, name, venue, date FROM events WHERE id = $1', [eventId]);
            if (eventRes.rowCount === 0) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
            if (eventRes.rows[0].user_id !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

            const event = eventRes.rows[0];

            // Fetch Guests
            const guestsRes = await client.query('SELECT customer_email, customer_name FROM bookings WHERE event_id = $1 AND status = $2', [eventId, 'confirmed']);
            const guests = guestsRes.rows;

            if (guests.length === 0) {
                return NextResponse.json({ error: 'No confirmed guests to email' }, { status: 400 });
            }

            const recipients = guests.map(g => g.customer_email);

            // Checking for API Key presence
            if (!process.env.RESEND_API_KEY) {
                console.log('------------------------------------------------');
                console.log(`[MOCK EMAIL] Bcc: ${recipients.join(', ')}`);
                console.log(`Subject: ${subject}`);
                console.log(`Message: ${message}`);
                console.log('------------------------------------------------');
                return NextResponse.json({ success: true, message: `[DEV] Email logged to console. (Set RESEND_API_KEY to send real emails)` });
            }

            // Send via Resend
            // Note: 'from' domain must be verified in Resend dashboard.
            // Using onboarding@resend.dev allows sending to YOURSELF for testing.
            const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';

            await resend.emails.send({
                from: fromAddress,
                to: ['delivered@resend.dev'], // Use sink address, actual recipients in Bcc
                bcc: recipients,
                subject: `[GigFinder] ${event.name}: ${subject}`,
                text: `${message}\n\n--\nTicket for: ${event.name}\nVenue: ${event.venue}\nDate: ${new Date(event.date).toLocaleDateString()}\n\nSent via GigFinder`,
            });

            return NextResponse.json({ success: true, message: `Email queued for ${recipients.length} guests.` });

        } finally {
            client.release();
        }

    } catch (e: any) {
        console.error('Email Error:', e);
        return NextResponse.json({ error: 'Email Failed: ' + e.message }, { status: 500 });
    }
}
