import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let name, venue, date, time, genre, description, priceBody, isInternalTicketing, sellTickets, imageUrl, maxCapacity, venueId, newVenue;

        const contentType = request.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');

        if (isJson) {
            const body = await request.json();
            ({ name, venue, date, time, genre, description, price: priceBody, imageUrl, venue_id: venueId, new_venue: newVenue } = body);
            isInternalTicketing = body.is_internal_ticketing;
            sellTickets = body.sell_tickets;
            maxCapacity = body.max_capacity;
        } else {
            // Handle standard form submission
            const formData = await request.formData();
            name = formData.get('name')?.toString();
            venue = formData.get('venue')?.toString();
            date = formData.get('date')?.toString();
            time = formData.get('time')?.toString();
            genre = formData.get('genre')?.toString();
            description = formData.get('description')?.toString();
            priceBody = formData.get('price')?.toString();
            isInternalTicketing = formData.get('is_internal_ticketing') === 'true';
            sellTickets = formData.get('sell_tickets') === 'true';
            maxCapacity = formData.get('max_capacity')?.toString();
            imageUrl = formData.get('imageUrl')?.toString();
        }

        // Basic validation
        if (!name || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate venue is provided
        if (!venueId && !newVenue) {
            return NextResponse.json({ error: 'Venue is required' }, { status: 400 });
        }

        const client = await pool.connect();

        try {
            // Handle new venue creation
            if (newVenue && !venueId) {
                console.log('Creating new venue:', newVenue);
                const venueResult = await client.query(
                    `INSERT INTO venues (name, city, capacity) 
                     VALUES ($1, $2, $3) 
                     ON CONFLICT (name) DO UPDATE SET city = EXCLUDED.city, capacity = EXCLUDED.capacity
                     RETURNING id, name`,
                    [newVenue.name, newVenue.city || null, newVenue.capacity || null]
                );
                venueId = venueResult.rows[0].id;
                venue = venueResult.rows[0].name; // For fingerprint
                console.log('New venue created with ID:', venueId);

                // Notify admin about new venue (fire and forget)
                fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/notify-new-venue`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        venueName: newVenue.name,
                        city: newVenue.city,
                        capacity: newVenue.capacity,
                        createdBy: userId
                    })
                }).catch(err => console.error('Failed to notify admin:', err));
            } else if (venueId && !venue) {
                // Get venue name for fingerprint
                const venueResult = await client.query('SELECT name FROM venues WHERE id = $1', [venueId]);
                if (venueResult.rows[0]) {
                    venue = venueResult.rows[0].name;
                }
            }

            // Validate capacity - use venue capacity if available, otherwise require it
            let eventCapacity = null;
            if (venueId) {
                // Get capacity from venue
                const venueResult = await client.query('SELECT capacity FROM venues WHERE id = $1', [venueId]);
                if (venueResult.rows[0]?.capacity) {
                    eventCapacity = venueResult.rows[0].capacity;
                }
            }

            // If no venue capacity and no provided capacity, require it
            if (!eventCapacity && !maxCapacity) {
                client.release();
                return NextResponse.json({ error: 'Venue capacity is required' }, { status: 400 });
            }

            // Use provided capacity if venue doesn't have one
            if (!eventCapacity && maxCapacity) {
                eventCapacity = Math.max(1, Math.min(10000, parseInt(maxCapacity)));
            }

            // Create fingerprint (e.g., date|venue|name)
            const fingerprint = `${date}|${(venue || 'unknown').toLowerCase().trim()}|${name.toLowerCase().trim()}`;

            // Parse price - extract numerical value
            let ticketPrice = null;
            let displayPrice = priceBody || 'TBA';

            if (priceBody) {
                // Remove any non-numeric characters except decimal point
                const numericPrice = priceBody.replace(/[^\d.]/g, '');
                const parsedPrice = parseFloat(numericPrice);

                if (!isNaN(parsedPrice)) {
                    ticketPrice = parsedPrice;
                    // Format display price with £ symbol
                    displayPrice = parsedPrice === 0 ? 'Free' : `£${parsedPrice.toFixed(2)}`;
                }
            }

            // Insert event with venue_id
            const timestamp = time ? `${date} ${time}:00` : `${date} 00:00:00`;

            const result = await client.query(
                `INSERT INTO events (name, venue_id, date, genre, description, price, ticket_price, price_currency, user_id, fingerprint, is_internal_ticketing, sell_tickets, max_capacity, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id`,
                [name, venueId || null, timestamp, genre, description, displayPrice, ticketPrice, 'GBP', userId, fingerprint, isInternalTicketing || false, sellTickets || false, eventCapacity, imageUrl]
            );

            client.release();

            if (isJson) {
                return NextResponse.json({ success: true, id: result.rows[0].id });
            } else {
                // For form submission, redirect with 303 to force GET method (Post/Redirect/Get pattern)
                return NextResponse.json({ success: true, id: result.rows[0].id });
            }

        } catch (error: any) {
            client.release();
            console.error('Database Error:', error);
            // Handle unique constraint violation if fingerprint exists (duplicate entry)
            if (error.code === '23505') {
                return NextResponse.json({ error: 'This gig already exists!' }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Request Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
