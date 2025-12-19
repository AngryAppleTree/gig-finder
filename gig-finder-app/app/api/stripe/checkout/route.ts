import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { calculatePlatformFee } from '@/lib/platform-fee';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-11-17.clover',
    })
    : null;

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

export async function POST(req: NextRequest) {
    try {
        // Check if Stripe is configured
        if (!stripe) {
            return NextResponse.json(
                { error: 'Payment system not configured. Please contact support.' },
                { status: 503 }
            );
        }

        const { eventId, quantity, recordsQuantity, recordsPrice, customerName, customerEmail } = await req.json();

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
                `SELECT e.name, e.date, e.ticket_price, e.max_capacity, e.tickets_sold, v.name as venue_name
                 FROM events e
                 LEFT JOIN venues v ON e.venue_id = v.id
                 WHERE e.id = $1`,
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

            // Parse prices to numbers
            const ticketPrice = typeof event.ticket_price === 'number'
                ? event.ticket_price
                : parseFloat(event.ticket_price);

            const recordPrice = recordsPrice && recordsQuantity > 0
                ? (typeof recordsPrice === 'number' ? recordsPrice : parseFloat(recordsPrice))
                : 0;

            // Calculate subtotals
            const ticketsSubtotal = ticketPrice * quantity;
            const recordsSubtotal = recordPrice * (recordsQuantity || 0);

            // Calculate platform fee
            const feeCalculation = calculatePlatformFee({
                ticketsSubtotal,
                recordsSubtotal
            });

            // Build line items for Stripe
            const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
                // Tickets
                {
                    price_data: {
                        currency: 'gbp',
                        product_data: {
                            name: `${event.name} - Tickets`,
                            description: `${event.venue_name || 'TBA'} - ${new Date(event.date).toLocaleDateString()}`,
                        },
                        unit_amount: Math.round(ticketPrice * 100), // Convert to pence
                    },
                    quantity: quantity,
                }
            ];

            // Add records if purchased
            if (recordsQuantity && recordsQuantity > 0 && recordPrice > 0) {
                lineItems.push({
                    price_data: {
                        currency: 'gbp',
                        product_data: {
                            name: `${event.name} - Vinyl Records`,
                            description: 'Presale vinyl record',
                        },
                        unit_amount: Math.round(recordPrice * 100), // Convert to pence
                    },
                    quantity: recordsQuantity,
                });
            }

            // Add platform fee
            lineItems.push({
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: 'Platform Fee',
                        description: 'GigFinder service fee',
                    },
                    unit_amount: Math.round(feeCalculation.platformFee * 100), // Convert to pence
                },
                quantity: 1,
            });

            // Create Stripe Checkout Session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `${req.nextUrl.origin}/gigfinder/booking-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.nextUrl.origin}/gigfinder/booking-cancelled`,
                customer_email: customerEmail,
                metadata: {
                    eventId: eventId.toString(),
                    quantity: quantity.toString(),
                    recordsQuantity: (recordsQuantity || 0).toString(),
                    recordsPrice: recordPrice.toString(),
                    platformFee: feeCalculation.platformFee.toString(),
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
