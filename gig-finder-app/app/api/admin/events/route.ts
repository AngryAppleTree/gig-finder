import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Updated import
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkAdmin() {
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get('gigfinder_admin');
    // Simple check: does cookie exist? Ideally check value or signature, but for this MVP 'true' is set.
    return adminCookie?.value === 'true';
}

export async function GET(req: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const client = await pool.connect();
    try {
        // Fetch all future events + recent past
        const res = await client.query(`
            SELECT * FROM events 
            WHERE date >= NOW() - INTERVAL '7 days'
            ORDER BY date ASC
            LIMIT 200
        `);
        return NextResponse.json({ events: res.rows });
    } finally {
        client.release();
    }
}

export async function DELETE(req: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { id } = body;

        const client = await pool.connect();
        try {
            // Delete associated bookings first to prevent Foreign Key violation
            await client.query('DELETE FROM bookings WHERE event_id = $1', [id]);
            // Then delete the event
            await client.query('DELETE FROM events WHERE id = $1', [id]);
            return NextResponse.json({ message: 'Deleted' });
        } finally {
            client.release();
        }
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, venue, date, time, price, ticket_url, description, genre } = body;

        const dateTimeStr = `${date}T${time}:00`;
        const dateObj = new Date(dateTimeStr);

        const fingerprint = `${date}|${venue.toLowerCase()}|${name.toLowerCase().trim()}`;

        const client = await pool.connect();
        try {
            const res = await client.query(`
                INSERT INTO events (
                    name, venue, date, price, ticket_url, description, 
                    fingerprint, user_id, approved, created_at, genre
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)
                RETURNING id
            `, [
                name, venue, dateObj, price, ticket_url, description,
                fingerprint, 'admin', true, genre
            ]);
            return NextResponse.json({ message: 'Created', id: res.rows[0].id });
        } finally {
            client.release();
        }
    } catch (e: any) {
        console.error('Create error:', e);
        return NextResponse.json({ error: 'Failed to create event: ' + e.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { id, isInternalTicketing } = body;

        const client = await pool.connect();
        try {
            // If toggling internal ticketing, we might want to default capacity if null?
            // But for now just set flag.
            if (isInternalTicketing !== undefined) {
                await client.query('UPDATE events SET is_internal_ticketing = $1 WHERE id = $2', [isInternalTicketing, id]);
            }
            return NextResponse.json({ success: true, message: 'Updated' });
        } finally {
            client.release();
        }
    } catch (e: any) {
        console.error('Update error:', e);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
