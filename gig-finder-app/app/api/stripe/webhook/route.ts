import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import QRCode from 'qrcode';
import { getPool } from '@/lib/db';
import { safeLog, redactEmail } from '@/lib/logger';

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

            // Generate QR code data with correct format: GF-TICKET:{bookingId}-{eventId}
            const qrCodeData = `GF-TICKET:${bookingId}-${eventId}`;

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
                // Generate QR code image from saved data
                const qrBuffer = await QRCode.toBuffer(
                    qrCodeData,
                    { width: 300, margin: 2 }
                );

                // Convert to base64 for inline embedding
                const qrBase64 = qrBuffer.toString('base64');

                const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';
                const dateStr = new Date(eventData.date).toLocaleDateString();

                // Calculate totals
                const ticketsSubtotal = eventData.ticket_price * parseInt(quantity);
                const recordsSubtotal = recordsPriceNum * recordsQty;
                const totalPaid = (ticketsSubtotal + recordsSubtotal + platformFeeNum).toFixed(2);

                try {
                    await resend.emails.send({
                        from: fromAddress,
                        to: customerEmail,
                        subject: `Ticket Confirmed: ${eventData.name}`,
                        html: `
                            <div style="font-family: sans-serif; color: #333;">
                                <h1 style="color: #000;">Payment Successful! 🎉</h1>
                                <p>Hi ${customerName},</p>
                                <p>Your payment of <strong>£${totalPaid}</strong> has been confirmed.</p>
                                
                                <h2 style="color: #000; font-size: 18px;">Event Details</h2>
                                <p><strong>Event:</strong> ${eventData.name}<br>
                                <strong>Venue:</strong> ${eventData.venue_name || 'TBA'}<br>
                                <strong>Date:</strong> ${dateStr}<br>
                                <strong>Tickets:</strong> ${quantity}</p>
                                
                                ${recordsQty > 0 ? `
                                <h2 style="color: #000; font-size: 18px;">Presale Records</h2>
                                <p>💿 <strong>${recordsQty} vinyl record${recordsQty > 1 ? 's' : ''}</strong> - £${recordsSubtotal.toFixed(2)}<br>
                                <em style="color: #666; font-size: 14px;">Your record${recordsQty > 1 ? 's' : ''} will be available for collection at the venue.</em></p>
                                ` : ''}
                                
                                <h2 style="color: #000; font-size: 18px;">Payment Breakdown</h2>
                                <p>Tickets: £${ticketsSubtotal.toFixed(2)}<br>
                                ${recordsQty > 0 ? `Records: £${recordsSubtotal.toFixed(2)}<br>` : ''}
                                Platform Fee: £${platformFeeNum.toFixed(2)}<br>
                                <strong>Total: £${totalPaid}</strong></p>
                                
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
