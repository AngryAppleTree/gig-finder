import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let name, venue, date, time, genre, description, priceBody;

        const contentType = request.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');

        if (isJson) {
            const body = await request.json();
            ({ name, venue, date, time, genre, description, price: priceBody } = body);
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
        }

        // Basic validation
        if (!name || !venue || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create fingerprint (e.g., date|venue|name)
        const fingerprint = `${date}|${venue.toLowerCase().trim()}|${name.toLowerCase().trim()}`;

        const client = await pool.connect();

        // Check optional price
        const price = priceBody || 'TBA';

        // Insert
        // Note: 'date' comes as YYYY-MM-DD. We might want to combine with time.
        const timestamp = time ? `${date} ${time}:00` : `${date} 00:00:00`;

        const result = await client.query(
            `INSERT INTO events (name, venue, date, genre, description, price, user_id, fingerprint)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
            [name, venue, timestamp, genre, description, price, userId, fingerprint]
        );

        client.release();

        if (isJson) {
            return NextResponse.json({ success: true, id: result.rows[0].id });
        } else {
            // For form submission, redirect back to a success page or the form
            return NextResponse.redirect(new URL('/gigfinder/add-event?success=true', request.url));
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
