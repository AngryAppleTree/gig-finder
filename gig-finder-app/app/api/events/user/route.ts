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

        const client = await pool.connect();

        // Fetch users gigs, sorted by date (newest first for management)
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
