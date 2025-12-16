import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-11-17.clover',
});

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

export async function POST(req: NextRequest) {
    try {
        const { eventId, quantity, customerName, customerEmail } = await req.json();

        // Validate inputs
        if (!eventId || !quantity || !customerName || !customerEmail) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const client = await pool.connect();

        try {
            // Get event details
            const eventRes = await client.query(
                'SELECT name, venue, date, ticket_price, max_capacity, tickets_sold FROM events WHERE id = $1',
                [eventId]
            );

            if (eventRes.rowCount === 0) {
                return NextResponse.json({ error: 'Event not found' }, { status: 404 });
            }

            const event = eventRes.rows[0];

            // Check if event has a price
            if (!event.ticket_price || event.ticket_price <= 0) {
                return NextResponse.json(
                    { error: 'This event is free - no payment required' },
                    { status: 400 }
                );
            }

            // Check capacity
            const availableTickets = (event.max_capacity || 100) - (event.tickets_sold || 0);
            if (availableTickets < quantity) {
                return NextResponse.json(
                    { error: `Only ${availableTickets} ticket(s) remaining` },
                    { status: 400 }
                );
            }

            // Calculate total amount (in pence for GBP)
            const unitAmount = Math.round(event.ticket_price * 100);
            const totalAmount = unitAmount * quantity;

            // Create Stripe Checkout Session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'gbp',
                            product_data: {
                                name: event.name,
                                description: `${event.venue} - ${new Date(event.date).toLocaleDateString()}`,
                            },
                            unit_amount: unitAmount,
                        },
                        quantity: quantity,
                    },
                ],
                mode: 'payment',
                success_url: `${req.nextUrl.origin}/gigfinder/booking-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.nextUrl.origin}/gigfinder/booking-cancelled`,
                customer_email: customerEmail,
                metadata: {
                    eventId: eventId.toString(),
                    quantity: quantity.toString(),
                    customerName: customerName,
                    customerEmail: customerEmail,
                },
            });

            client.release();

            return NextResponse.json({
                sessionId: session.id,
                url: session.url,
            });

        } catch (error) {
            client.release();
            throw error;
        }

    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Payment setup failed' },
            { status: 500 }
        );
    }
}
