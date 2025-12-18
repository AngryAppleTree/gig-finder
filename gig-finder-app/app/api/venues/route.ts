import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

// GET - List all venues (public endpoint for autocomplete)
export async function GET() {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT 
                id,
                name,
                city,
                capacity
            FROM venues
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
