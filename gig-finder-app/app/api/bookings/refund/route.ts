import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { Resend } from 'resend';
import { auth } from '@clerk/nextjs/server';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-11-17.clover',
    })
    : null;

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
    try {
        // Check if Stripe is configured
        if (!stripe) {
            return NextResponse.json(
                { error: 'Refund system not configured' },
                { status: 503 }
            );
        }

        const { bookingId } = await req.json();

        if (!bookingId) {
            return NextResponse.json(
                { error: 'Booking ID required' },
                { status: 400 }
            );
        }

        // Get authenticated user (for admin check)
        const { userId } = await auth();

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Get booking details
            const bookingRes = await client.query(
                `SELECT b.*, e.name as event_name, e.venue, e.date, e.ticket_price
                 FROM bookings b
                 JOIN events e ON b.event_id = e.id
                 WHERE b.id = $1`,
                [bookingId]
            );

            if (bookingRes.rowCount === 0) {
                await client.query('ROLLBACK');
                client.release();
                return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
            }

            const booking = bookingRes.rows[0];

            // Check if already refunded
            if (booking.status === 'refunded') {
                await client.query('ROLLBACK');
                client.release();
                return NextResponse.json({ error: 'Booking already refunded' }, { status: 400 });
            }

            // Check if payment exists
            if (!booking.payment_intent_id) {
                await client.query('ROLLBACK');
                client.release();
                return NextResponse.json({ error: 'No payment to refund (free booking)' }, { status: 400 });
            }

            // Process Stripe refund
            let refund;
            try {
                refund = await stripe.refunds.create({
                    payment_intent: booking.payment_intent_id,
                });
            } catch (stripeError: any) {
                await client.query('ROLLBACK');
                client.release();
                return NextResponse.json(
                    { error: `Stripe refund failed: ${stripeError.message}` },
                    { status: 500 }
                );
            }

            // Update booking status
            await client.query(
                `UPDATE bookings 
                 SET status = 'refunded', 
                     refund_id = $1,
                     refunded_at = NOW()
                 WHERE id = $2`,
                [refund.id, bookingId]
            );

            // Restore capacity
            await client.query(
                `UPDATE events 
                 SET tickets_sold = GREATEST(0, COALESCE(tickets_sold, 0) - $1)
                 WHERE id = $2`,
                [booking.quantity, booking.event_id]
            );

            await client.query('COMMIT');
            client.release();

            // Send refund confirmation email
            if (resend && booking.customer_email) {
                const refundAmount = (booking.ticket_price * booking.quantity).toFixed(2);
                const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';

                await resend.emails.send({
                    from: fromAddress,
                    to: booking.customer_email,
                    subject: `Refund Confirmed: ${booking.event_name}`,
                    html: `
                        <div style="font-family: sans-serif; color: #333;">
                            <h1 style="color: #000;">Refund Processed</h1>
                            <p>Hi ${booking.customer_name},</p>
                            <p>Your refund of <strong>£${refundAmount}</strong> has been processed.</p>
                            <p><strong>Event:</strong> ${booking.event_name}<br>
                            <strong>Venue:</strong> ${booking.venue}<br>
                            <strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}<br>
                            <strong>Tickets:</strong> ${booking.quantity}</p>
                            <p style="color: #666; font-size: 0.9rem;">
                                The refund will appear in your account within 5-10 business days.
                            </p>
                            <p style="color: #666; font-size: 0.9rem;">Booking Ref: #${bookingId}</p>
                        </div>
                    `
                });
            }

            return NextResponse.json({
                success: true,
                refundId: refund.id,
                amount: refund.amount / 100, // Convert from pence to pounds
                message: 'Refund processed successfully'
            });

        } catch (error) {
            await client.query('ROLLBACK');
            client.release();
            throw error;
        }

    } catch (error: any) {
        console.error('Refund error:', error);
        return NextResponse.json(
            { error: error.message || 'Refund failed' },
            { status: 500 }
        );
    }
}
