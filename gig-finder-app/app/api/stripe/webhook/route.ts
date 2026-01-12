import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getPool } from '@/lib/db';
import { safeLog, redactEmail } from '@/lib/logger';
import { generateTicketQR } from '@/lib/qr-generator';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-11-17.clover',
    })
    : null;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
    // Check if Stripe is configured
    if (!stripe) {
        return NextResponse.json(
            { error: 'Webhook handler not configured' },
            { status: 503 }
        );
    }

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
        const { eventId, quantity, recordsQuantity, recordsPrice, platformFee, customerName, customerEmail } = session.metadata!;

        const client = await getPool().connect();

        try {
            await client.query('BEGIN');

            // Get event details
            const eventRes = await client.query(
                `SELECT e.name, e.date, e.ticket_price, v.name as venue_name
                 FROM events e
                 LEFT JOIN venues v ON e.venue_id = v.id
                 WHERE e.id = $1`,
                [eventId]
            );

            if (eventRes.rowCount === 0) {
                throw new Error('Event not found');
            }

            const eventData = eventRes.rows[0];

            // Parse records data
            const recordsQty = recordsQuantity ? parseInt(recordsQuantity) : 0;
            const recordsPriceNum = recordsPrice ? parseFloat(recordsPrice) : 0;
            const platformFeeNum = platformFee ? parseFloat(platformFee) : 0;

            // Create booking with records data (QR code will be added after we have the booking ID)
            const bookingRes = await client.query(
                `INSERT INTO bookings (event_id, customer_name, customer_email, quantity, records_quantity, records_price, platform_fee, status, payment_intent_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING id`,
                [eventId, customerName, customerEmail, parseInt(quantity), recordsQty, recordsPriceNum, platformFeeNum, 'confirmed', session.payment_intent]
            );

            const bookingId = bookingRes.rows[0].id;

            // Generate QR code using utility function
            const { qrCodeData, qrBuffer } = await generateTicketQR(bookingId, parseInt(eventId));

            // Update booking with QR code
            await client.query(
                'UPDATE bookings SET qr_code = $1 WHERE id = $2',
                [qrCodeData, bookingId]
            );

            // Update tickets sold
            await client.query(
                'UPDATE events SET tickets_sold = COALESCE(tickets_sold, 0) + $1 WHERE id = $2',
                [parseInt(quantity), eventId]
            );


            await client.query('COMMIT');

            // Send confirmation email
            if (process.env.RESEND_API_KEY && resend) {
                const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';

                // Generate email HTML using template
                const { generatePaymentConfirmationEmail } = await import('@/lib/email-templates');
                const emailHTML = generatePaymentConfirmationEmail({
                    customerName,
                    eventName: eventData.name,
                    venueName: eventData.venue_name,
                    eventDate: new Date(eventData.date),
                    bookingId,
                    ticketQuantity: parseInt(quantity),
                    ticketPrice: eventData.ticket_price,
                    recordsQuantity: recordsQty,
                    recordsPrice: recordsPriceNum,
                    platformFee: platformFeeNum,
                });

                try {
                    await resend.emails.send({
                        from: fromAddress,
                        to: customerEmail,
                        subject: `Ticket Confirmed: ${eventData.name}`,
                        html: emailHTML,
                        attachments: [
                            {
                                filename: `ticket-${bookingId}.png`,
                                content: qrBuffer,
                                contentId: 'ticket-qr'
                            }
                        ]
                    });
                    safeLog(`✅ Confirmation email sent to ${redactEmail(customerEmail)} for booking #${bookingId}`);
                } catch (emailError: any) {
                    console.error('❌ Failed to send confirmation email:', emailError);
                    console.error('Email error details:', {
                        message: emailError.message,
                        statusCode: emailError.statusCode,
                        name: emailError.name,
                        bookingId,
                        customerEmail: redactEmail(customerEmail)
                    });
                    // Don't throw - booking is already saved
                }
            } else {
                console.warn('⚠️ Email not sent - RESEND_API_KEY not configured');
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
