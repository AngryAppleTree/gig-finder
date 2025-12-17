import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { cookies } from 'next/headers';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkAdmin() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('gigfinder_admin');
    return adminSession?.value === 'true';
}

// GET - List all venues
export async function GET() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT 
                v.*,
                COUNT(e.id) as event_count
            FROM venues v
            LEFT JOIN events e ON e.venue_id = v.id
            GROUP BY v.id
            ORDER BY v.name ASC
        `);

        return NextResponse.json({ venues: result.rows });
    } catch (error) {
        console.error('Get Venues Error:', error);
        return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 });
    } finally {
        client.release();
    }
}

// POST - Create new venue
export async function POST(req: Request) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const client = await pool.connect();
    try {
        const body = await req.json();
        const { name, address, city, postcode, latitude, longitude, capacity, website } = body;

        if (!name) {
            return NextResponse.json({ error: 'Venue name is required' }, { status: 400 });
        }

        const result = await client.query(`
            INSERT INTO venues (name, address, city, postcode, latitude, longitude, capacity, website)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [name, address, city, postcode, latitude, longitude, capacity, website]);

        return NextResponse.json({ venue: result.rows[0] });
    } catch (error: any) {
        console.error('Create Venue Error:', error);
        if (error.code === '23505') { // Unique constraint violation
            return NextResponse.json({ error: 'Venue already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create venue' }, { status: 500 });
    } finally {
        client.release();
    }
}

// PUT - Update venue
export async function PUT(req: Request) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const client = await pool.connect();
    try {
        const body = await req.json();
        const { id, name, address, city, postcode, latitude, longitude, capacity, website } = body;

        if (!id || !name) {
            return NextResponse.json({ error: 'Venue ID and name are required' }, { status: 400 });
        }

        const result = await client.query(`
            UPDATE venues 
            SET name = $1, address = $2, city = $3, postcode = $4, 
                latitude = $5, longitude = $6, capacity = $7, website = $8
            WHERE id = $9
            RETURNING *
        `, [name, address, city, postcode, latitude, longitude, capacity, website, id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
        }

        return NextResponse.json({ venue: result.rows[0] });
    } catch (error: any) {
        console.error('Update Venue Error:', error);
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Venue name already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update venue' }, { status: 500 });
    } finally {
        client.release();
    }
}

// DELETE - Delete venue
export async function DELETE(req: Request) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        // Check if venue has events
        const eventCheck = await client.query(
            'SELECT COUNT(*) FROM events WHERE venue_id = $1',
            [id]
        );

        if (parseInt(eventCheck.rows[0].count) > 0) {
            return NextResponse.json({
                error: 'Cannot delete venue with existing events. Reassign events first.'
            }, { status: 409 });
        }

        const result = await client.query('DELETE FROM venues WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, venue: result.rows[0] });
    } catch (error) {
        console.error('Delete Venue Error:', error);
        return NextResponse.json({ error: 'Failed to delete venue' }, { status: 500 });
    } finally {
        client.release();
    }
}
