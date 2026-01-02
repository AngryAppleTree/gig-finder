import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { adminIpRestriction } from '@/lib/admin-ip';

async function checkAdmin() {
    const user = await currentUser();
    if (!user) return false;

    // Check metadata role OR verified email address
    const isAdminRole = user.publicMetadata?.role === 'admin';
    const isAdminEmail = user.emailAddresses.some(email =>
        email.emailAddress === process.env.ADMIN_EMAIL
    );

    return isAdminRole || isAdminEmail;
}

// GET - List all venues with pagination
export async function GET(request: NextRequest) {
    // IP restriction
    const ipCheck = adminIpRestriction(request);
    if (ipCheck) return ipCheck;

    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const client = await getPool().connect();
    try {
        if (id) {
            const result = await client.query(`
                SELECT 
                    v.*,
                    COUNT(e.id) as event_count
                FROM venues v
                LEFT JOIN events e ON e.venue_id = v.id
                WHERE v.id = $1
                GROUP BY v.id
            `, [id]);

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
            }
            return NextResponse.json({ venue: result.rows[0] });
        }

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;
        const approvedOnly = searchParams.get('approvedOnly') === 'true';

        // Build query
        let query = `
            SELECT 
                v.*,
                COUNT(e.id) as event_count
            FROM venues v
            LEFT JOIN events e ON e.venue_id = v.id
        `;
        let countQuery = 'SELECT COUNT(*) FROM venues';
        let params: any[] = [limit, offset];

        if (approvedOnly) {
            query += ' WHERE v.approved = true';
            countQuery += ' WHERE approved = true';
        }

        query += `
            GROUP BY v.id
            ORDER BY 
                CASE WHEN v.approved = false THEN 0 ELSE 1 END,
                v.name ASC
            LIMIT $1 OFFSET $2
        `;

        // Get total count
        const countRes = await client.query(countQuery);
        const totalCount = parseInt(countRes.rows[0].count);

        const result = await client.query(query, params);

        return NextResponse.json({
            venues: result.rows,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
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

    const client = await getPool().connect();
    try {
        const body = await req.json();
        const { name, address, city, postcode, latitude, longitude, capacity, email, website, phone } = body;

        if (!name) {
            return NextResponse.json({ error: 'Venue name is required' }, { status: 400 });
        }

        const result = await client.query(`
            INSERT INTO venues (name, address, city, postcode, latitude, longitude, capacity, email, website, phone)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [name, address, city, postcode, latitude, longitude, capacity, email, website, phone]);

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

    const client = await getPool().connect();
    try {
        const body = await req.json();
        const { id, name, address, city, postcode, latitude, longitude, capacity, email, website, phone } = body;

        console.log('Update venue request:', { id, name, address, city, postcode, latitude, longitude, capacity, email, website, phone });

        if (!id || !name) {
            return NextResponse.json({ error: 'Venue ID and name are required' }, { status: 400 });
        }

        const result = await client.query(`
            UPDATE venues 
            SET name = $1, address = $2, city = $3, postcode = $4, 
                latitude = $5, longitude = $6, capacity = $7, email = $8, website = $9, phone = $10
            WHERE id = $11
            RETURNING *
        `, [
            name,
            address || null,
            city || null,
            postcode || null,
            latitude || null,
            longitude || null,
            capacity || null,
            email || null,
            website || null,
            phone || null,
            id
        ]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
        }

        console.log('Venue updated successfully:', result.rows[0]);
        return NextResponse.json({ venue: result.rows[0] });
    } catch (error: any) {
        console.error('Update Venue Error:', error);
        console.error('Error details:', error.message, error.code, error.detail);
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Venue name already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: `Failed to update venue: ${error.message}` }, { status: 500 });
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

    const client = await getPool().connect();
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

// PATCH - Update venue approval status
export async function PATCH(req: Request) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const client = await getPool().connect();
    try {
        const body = await req.json();
        const { id, approved } = body;

        if (!id || approved === undefined) {
            return NextResponse.json({ error: 'Venue ID and approved status are required' }, { status: 400 });
        }

        // If rejecting a venue (approved=false), delete associated unapproved events
        if (approved === false) {
            const deletedEvents = await client.query(
                'DELETE FROM events WHERE venue_id = $1 AND approved = false RETURNING id, name',
                [id]
            );

            if (deletedEvents.rows.length > 0) {
                console.log(`🗑️  Deleted ${deletedEvents.rows.length} unapproved events associated with rejected venue ${id}`);
                deletedEvents.rows.forEach(evt => {
                    console.log(`   - Event ${evt.id}: "${evt.name}"`);
                });
            }

            // Also delete the venue itself when rejected
            const deletedVenue = await client.query(
                'DELETE FROM venues WHERE id = $1 RETURNING *',
                [id]
            );

            if (deletedVenue.rowCount === 0) {
                return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                venue: deletedVenue.rows[0],
                deletedEvents: deletedEvents.rows.length,
                message: `Venue rejected and deleted along with ${deletedEvents.rows.length} unapproved event(s)`
            });
        }

        // Approving venue (approved=true)
        const result = await client.query(
            'UPDATE venues SET approved = $1 WHERE id = $2 RETURNING *',
            [approved, id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
        }

        // When approving a venue, check if associated unapproved events should be auto-approved
        // Auto-approve events for:
        // 1. Users who have previously created approved events
        // 2. Scrapers (user_id starts with 'scraper_')
        const autoApprovedEvents = await client.query(`
            UPDATE events e
            SET approved = true
            FROM (
                SELECT DISTINCT e2.user_id
                FROM events e2
                WHERE e2.venue_id = $1 
                  AND e2.approved = false
                  AND (
                    -- Experienced users with previous approved events
                    EXISTS (
                        SELECT 1 FROM events e3 
                        WHERE e3.user_id = e2.user_id 
                          AND e3.approved = true
                    )
                    -- OR scrapers
                    OR e2.user_id LIKE 'scraper_%'
                  )
            ) experienced_users
            WHERE e.venue_id = $1 
              AND e.approved = false 
              AND e.user_id = experienced_users.user_id
            RETURNING e.id, e.name, e.user_id
        `, [id]);

        if (autoApprovedEvents.rows.length > 0) {
            console.log(`✅ Auto-approved ${autoApprovedEvents.rows.length} events from experienced users`);
            autoApprovedEvents.rows.forEach(evt => {
                console.log(`   - Event ${evt.id}: "${evt.name}" (user: ${evt.user_id})`);
            });
        }

        return NextResponse.json({
            success: true,
            venue: result.rows[0],
            autoApprovedEvents: autoApprovedEvents.rows.length
        });
    } catch (error) {
        console.error('Update Venue Approval Error:', error);
        return NextResponse.json({ error: 'Failed to update venue approval' }, { status: 500 });
    } finally {
        client.release();
    }
}

