import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';


const ADMIN_EMAIL = 'alexanderbunch@me.com';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user email from Clerk
        const userRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
            },
        });

        if (!userRes.ok) {
            return NextResponse.json({ error: 'Failed to verify user' }, { status: 500 });
        }

        const userData = await userRes.json();
        const userEmail = userData.email_addresses?.[0]?.email_address;

        if (userEmail !== ADMIN_EMAIL) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Fetch all bookings with event details
        const client = await getPool().connect();

        const result = await client.query(`
            SELECT 
                b.id,
                b.customer_name,
                b.customer_email,
                b.quantity,
                b.status,
                b.payment_intent_id,
                b.price_paid,
                b.created_at,
                b.refund_id,
                b.refunded_at,
                e.name as event_name,
                e.venue,
                e.date
            FROM bookings b
            JOIN events e ON b.event_id = e.id
            ORDER BY b.created_at DESC
        `);

        client.release();

        return NextResponse.json({
            bookings: result.rows
        });

    } catch (error: any) {
        console.error('Fetch bookings error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch bookings' },
            { status: 500 }
        );
    }
}
