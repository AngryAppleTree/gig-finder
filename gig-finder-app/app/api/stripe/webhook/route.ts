import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { Resend } from 'resend';
import QRCode from 'qrcode';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-11-17.clover',
});

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Extract metadata
        const { eventId, quantity, customerName, customerEmail } = session.metadata!;

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Get event details
            const eventRes = await client.query(
                'SELECT name, venue, date, ticket_price FROM events WHERE id = $1',
                [eventId]
            );

            if (eventRes.rowCount === 0) {
                throw new Error('Event not found');
            }

            const eventData = eventRes.rows[0];

            // Create booking
            const bookingRes = await client.query(
                `INSERT INTO bookings (event_id, customer_name, customer_email, quantity, status, payment_intent_id)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id`,
                [eventId, customerName, customerEmail, parseInt(quantity), 'confirmed', session.payment_intent]
            );

            const bookingId = bookingRes.rows[0].id;

            // Update tickets sold
            await client.query(
                'UPDATE events SET tickets_sold = COALESCE(tickets_sold, 0) + $1 WHERE id = $2',
                [parseInt(quantity), eventId]
            );

            await client.query('COMMIT');

            // Send confirmation email
            if (process.env.RESEND_API_KEY) {
                const qrBuffer = await QRCode.toBuffer(
                    `GF-TICKET:${bookingId}-${eventId}`,
                    { width: 300, margin: 2 }
                );

                const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';
                const dateStr = new Date(eventData.date).toLocaleDateString();
                const totalPaid = (eventData.ticket_price * parseInt(quantity)).toFixed(2);

                await resend.emails.send({
                    from: fromAddress,
                    to: customerEmail,
                    subject: `Ticket Confirmed: ${eventData.name}`,
                    html: `
                        <div style="font-family: sans-serif; color: #333;">
                            <h1 style="color: #000;">Payment Successful! 🎉</h1>
                            <p>Hi ${customerName},</p>
                            <p>Your payment of <strong>£${totalPaid}</strong> has been confirmed.</p>
                            <p><strong>Event:</strong> ${eventData.name}<br>
                            <strong>Venue:</strong> ${eventData.venue}<br>
                            <strong>Date:</strong> ${dateStr}<br>
                            <strong>Tickets:</strong> ${quantity}</p>
                            
                            <div style="text-align: center; margin: 20px 0;">
                                <img src="cid:ticket-qr" alt="Your Entry QR Code" style="border: 4px solid #000; width: 250px; height: 250px;" />
                            </div>
                            
                            <p style="text-align: center; color: #666;">Booking Ref: #${bookingId}</p>
                            <p style="font-size: 12px; color: #888;">Show this QR code at the venue for entry.</p>
                        </div>
                    `,
                    attachments: [
                        {
                            filename: `ticket-${bookingId}.png`,
                            content: qrBuffer,
                            // @ts-ignore
                            content_id: 'ticket-qr'
                        }
                    ]
                });
            }

            client.release();

        } catch (error) {
            await client.query('ROLLBACK');
            client.release();
            console.error('Booking creation failed:', error);
            throw error;
        }
    }

    return NextResponse.json({ received: true });
}
