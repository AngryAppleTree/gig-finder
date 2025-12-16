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

        let name, venue, date, time, genre, description, priceBody, isInternalTicketing, imageUrl, maxCapacity;

        const contentType = request.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');

        if (isJson) {
            const body = await request.json();
            ({ name, venue, date, time, genre, description, price: priceBody, imageUrl } = body);
            isInternalTicketing = body.is_internal_ticketing;
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
            maxCapacity = formData.get('max_capacity')?.toString();
            // Optional image upload via form data (raw file needs handling, or string if client did stuff)
            // For now assuming string if present
            imageUrl = formData.get('imageUrl')?.toString();
        }

        // Basic validation
        if (!name || !venue || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create fingerprint (e.g., date|venue|name)
        const fingerprint = `${date}|${venue.toLowerCase().trim()}|${name.toLowerCase().trim()}`;

        const client = await pool.connect();

        // Parse and validate capacity
        const eventCapacity = maxCapacity ? Math.max(1, Math.min(10000, parseInt(maxCapacity))) : 100;

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

        // Insert
        // Note: 'date' comes as YYYY-MM-DD. We might want to combine with time.
        const timestamp = time ? `${date} ${time}:00` : `${date} 00:00:00`;

        const result = await client.query(
            `INSERT INTO events (name, venue, date, genre, description, price, ticket_price, price_currency, user_id, fingerprint, is_internal_ticketing, max_capacity, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id`,
            [name, venue, timestamp, genre, description, displayPrice, ticketPrice, 'GBP', userId, fingerprint, isInternalTicketing || false, eventCapacity, imageUrl]
        );

        client.release();

        if (isJson) {
            return NextResponse.json({ success: true, id: result.rows[0].id });
        } else {
            // For form submission, redirect with 303 to force GET method (Post/Redirect/Get pattern)
            return NextResponse.redirect(new URL('/gigfinder/success-static', request.url), 303);
        }

    } catch (error: any) {
        console.error('Database Error:', error);
        // Handle unique constraint violation if fingerprint exists (duplicate entry)
        if (error.code === '23505') {
            return NextResponse.json({ error: 'This gig already exists!' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
