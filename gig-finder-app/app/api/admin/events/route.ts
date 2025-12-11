import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkAdmin() {
    const user = await currentUser();
    if (!user) return false;
    const adminEmail = process.env.ADMIN_EMAIL;
    const userEmail = user.emailAddresses[0]?.emailAddress;
    return adminEmail && userEmail === adminEmail;
}

export async function GET(req: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const client = await pool.connect();
    try {
        // Fetch all future events (or all?)
        // Let's fetch all future + recent past (e.g. last 7 days) to manage active stuff.
        // Pagination later. Limit 100 for now.
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

        // Combine date/time
        // Input date: YYYY-MM-DD
        // Input time: HH:MM
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
