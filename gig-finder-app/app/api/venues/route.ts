import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';


// GET - List all venues (public endpoint for autocomplete)
export async function GET() {
    const client = await getPool().connect();
    try {
        const result = await client.query(`
            SELECT 
                id,
                name,
                city,
                capacity
            FROM venues
            WHERE approved = true
            ORDER BY name ASC
        `);

        return NextResponse.json({ venues: result.rows });
    } catch (error) {
        console.error('Get Venues Error:', error);
        return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 });
    } finally {
        client.release();
    }
}
