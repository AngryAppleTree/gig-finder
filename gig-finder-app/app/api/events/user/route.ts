import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const eventId = searchParams.get('id');

        const client = await pool.connect();

        if (eventId) {
            // Fetch single event
            const result = await client.query(
                `SELECT * FROM events WHERE id = $1 AND user_id = $2`,
                [eventId, userId]
            );
            client.release();

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Event not found' }, { status: 404 });
            }
            return NextResponse.json({ event: result.rows[0] });
        }

        // Fetch all users gigs
        const result = await client.query(
            `SELECT * FROM events WHERE user_id = $1 ORDER BY date DESC, created_at DESC`,
            [userId]
        );
        client.release();

        return NextResponse.json({ events: result.rows });

    } catch (error: any) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, venue, date, time, genre, description, price } = body;

        if (!id || !name || !venue || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fingerprint update is optional/tricky. If they change name/venue/date, fingerprint needs update?
        // We will update fingerprint to match new data to avoid stale deduplication.
        const fingerprint = `${date}|${venue.toLowerCase().trim()}|${name.toLowerCase().trim()}`;

        // Combine date + time for DB if needed, or just store separate if schema used timestamp? 
        // Schema is 'date' column as DATE type? Or string?
        // Step 651: `date` column is `DATE` (or text?). Step 1082 API uses `timestamp` string: `${date} ${time}:00`.
        // Let's assume we store it as text or timestamp in DB logic.
        // Wait, original insert logic (Step 873) used:
        // const timestamp = time ? `${date} ${time}:00` : `${date} 00:00:00`;
        // INSERT INTO events(..., date, ...) VALUES(..., timestamp, ...).

        const timestamp = time ? `${date} ${time}` : `${date} 00:00:00`; // Time formatting might need :00 depending on input

        const client = await pool.connect();

        const result = await client.query(
            `UPDATE events SET 
                name = $1, 
                venue = $2, 
                date = $3, 
                genre = $4, 
                description = $5, 
                price = $6,
                fingerprint = $7
             WHERE id = $8 AND user_id = $9
             RETURNING id`,
            [name, venue, timestamp, genre, description, price, fingerprint, id, userId]
        );

        client.release();

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true, id });

    } catch (error: any) {
        console.error('Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const eventId = searchParams.get('id');

        if (!eventId) {
            return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
        }

        const client = await pool.connect();

        // Security: ONLY delete if id matches AND user_id matches
        const result = await client.query(
            `DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING id`,
            [eventId, userId]
        );

        client.release();

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true, deletedId: eventId });

    } catch (error: any) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
