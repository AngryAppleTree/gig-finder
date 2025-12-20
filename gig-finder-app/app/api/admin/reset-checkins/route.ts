import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

export async function POST() {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            UPDATE bookings 
            SET checked_in_at = NULL 
            WHERE checked_in_at IS NOT NULL
            RETURNING id, customer_name
        `);

        return NextResponse.json({
            success: true,
            message: `Reset ${result.rowCount} check-ins`,
            bookings: result.rows
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    } finally {
        client.release();
    }
}
