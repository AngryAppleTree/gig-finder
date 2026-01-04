import { getPool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendNewVenueNotification } from '@/lib/notifications';

/**
 * Normalizes a venue name for duplicate detection
 * Must match the normalization logic in scraper/venue-helper.js
 */
function normalizeVenueName(name: string): string {
    const cities = ['edinburgh', 'glasgow', 'aberdeen', 'dundee', 'inverness', 'perth', 'stirling', 'kirkcaldy', 'dunfermline'];

    let normalized = name
        .toLowerCase()
        .replace(/^upstairs\s+(at\s+)?/i, '')
        .replace(/^the\s+/i, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+and\s+/g, ' ')
        .replace(/\s+n\s+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    normalized = normalized.replace(/\s+(bar|pub|club|venue|hall|hotel|theatre|theater|lounge|room|warehouse)(\s+(bar|pub|club|venue|hall|hotel|theatre|theater|lounge|room|warehouse))*$/i, '');
    normalized = normalized.split(' ').map(word => word.replace(/s$/, '')).join(' ').trim();

    cities.forEach(city => {
        const regex = new RegExp(`\\s+${city}$`, 'i');
        normalized = normalized.replace(regex, '');
    });

    return normalized.trim();
}


export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let name, venue, date, time, genre, description, priceBody, presalePrice, presaleCaption, isInternalTicketing, sellTickets, imageUrl, maxCapacity, venueId, newVenue;

        const contentType = request.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');

        if (isJson) {
            const body = await request.json();
            ({ name, venue, date, time, genre, description, price: priceBody, presale_price: presalePrice, presale_caption: presaleCaption, imageUrl, venue_id: venueId, new_venue: newVenue } = body);
            isInternalTicketing = body.is_internal_ticketing;
            sellTickets = body.sell_tickets;
            maxCapacity = body.max_capacity;
        } else {
            // Handle standard form submission
            const formData = await request.formData();
            name = formData.get('name')?.toString();
            venue = formData.get('venue')?.toString();
            date = formData.get('date')?.toString();
            time = formData.get('time')?.toString();
            genre = formData.get('genre')?.toString();
            description = formData.get('description')?.toString();
            priceBody = formData.get('price')?.toString();
            isInternalTicketing = formData.get('is_internal_ticketing') === 'true';
            sellTickets = formData.get('sell_tickets') === 'true';

            // Enable internal ticketing if EITHER guest list OR sell tickets is checked
            if (sellTickets || isInternalTicketing) {
                isInternalTicketing = true;
            }

            maxCapacity = formData.get('max_capacity')?.toString();
            imageUrl = formData.get('imageUrl')?.toString();
        }

        // Basic validation
        if (!name || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate venue is provided
        if (!venueId && !newVenue) {
            return NextResponse.json({ error: 'Venue is required' }, { status: 400 });
        }

        const client = await getPool().connect();

        try {
            // Track if we created a new venue (requires event approval too)
            let createdNewVenue = false;

            // Handle new venue creation
            if (newVenue && !venueId) {
                console.log('Creating new venue:', newVenue);
                const normalized = normalizeVenueName(newVenue.name);

                // Check if venue already exists using normalized name
                const existingVenue = await client.query(
                    'SELECT id, name FROM venues WHERE normalized_name = $1 AND (city = $2 OR $2 IS NULL OR city IS NULL)',
                    [normalized, newVenue.city || null]
                );

                if (existingVenue.rows.length > 0) {
                    // Use existing venue
                    venueId = existingVenue.rows[0].id;
                    venue = existingVenue.rows[0].name;
                    console.log(`♻️  Using existing venue: "${venue}" (ID: ${venueId})`);
                } else {
                    // Create new venue with normalized_name - approved immediately but unverified
                    const venueResult = await client.query(
                        `INSERT INTO venues (name, normalized_name, city, capacity, approved, verified) 
                         VALUES ($1, $2, $3, $4, true, false) 
                         RETURNING id, name`,
                        [newVenue.name, normalized, newVenue.city || null, newVenue.capacity || null]
                    );
                    venueId = venueResult.rows[0].id;
                    venue = venueResult.rows[0].name;
                    createdNewVenue = true;
                    console.log(`🆕 Created new venue (PENDING APPROVAL): "${venue}" (normalized: "${normalized}")`);

                    // Notify admin about new venue
                    sendNewVenueNotification(
                        newVenue.name,
                        newVenue.city,
                        newVenue.capacity,
                        userId
                    ).then(result => {
                        if (result.success) {
                            console.log('✅ Admin notification sent successfully');
                        } else {
                            console.error('❌ Admin notification failed:', result.error);
                        }
                    }).catch(err => console.error('❌ Failed to notify admin:', err));
                }
            } else if (venueId && !venue) {
                // Get venue name for fingerprint
                const venueResult = await client.query('SELECT name FROM venues WHERE id = $1', [venueId]);
                if (venueResult.rows[0]) {
                    venue = venueResult.rows[0].name;
                }
            }

            // Validate capacity - use venue capacity if available, otherwise require it
            let eventCapacity = null;
            if (venueId) {
                // Get capacity from venue
                const venueResult = await client.query('SELECT capacity FROM venues WHERE id = $1', [venueId]);
                if (venueResult.rows[0]?.capacity) {
                    eventCapacity = venueResult.rows[0].capacity;
                }
            }

            // Use provided capacity if venue doesn't have one, otherwise default to 100
            if (!eventCapacity) {
                if (maxCapacity) {
                    eventCapacity = Math.max(1, Math.min(10000, parseInt(maxCapacity)));
                } else {
                    // Default capacity if not provided - admin can update later
                    eventCapacity = 100;
                }
            }

            // Create fingerprint (e.g., date|venue|name)
            const fingerprint = `${date}|${(venue || 'unknown').toLowerCase().trim()}|${name.toLowerCase().trim()}`;

            // Parse price - extract numerical value
            let ticketPrice = null;
            let displayPrice = priceBody || 'TBA';

            if (priceBody) {
                // Remove any non-numeric characters except decimal point
                const numericPrice = priceBody.replace(/[^\d.]/g, '');
                const parsedPrice = parseFloat(numericPrice);

                if (!isNaN(parsedPrice)) {
                    ticketPrice = parsedPrice;
                    // Format display price with £ symbol
                    displayPrice = parsedPrice === 0 ? 'Free' : `£${parsedPrice.toFixed(2)}`;
                }
            }

            // Parse presale price if provided
            let presalePriceValue = null;
            if (presalePrice) {
                const numericPresale = presalePrice.replace(/[^\d.]/g, '');
                const parsedPresale = parseFloat(numericPresale);
                if (!isNaN(parsedPresale)) {
                    presalePriceValue = parsedPresale;
                }
            }

            // NEW RULE: All manual submissions are approved (live) immediately
            // but marked as 'verified = false' until an admin reviews them.
            const needsApproval = false;
            const isVerified = false;

            // Insert event with venue_id
            const timestamp = time ? `${date} ${time}:00` : `${date} 00:00:00`;

            const result = await client.query(
                `INSERT INTO events (name, venue_id, date, genre, description, price, ticket_price, price_currency, presale_price, presale_caption, user_id, fingerprint, is_internal_ticketing, sell_tickets, max_capacity, image_url, approved, verified)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                 RETURNING id`,
                [name, venueId || null, timestamp, genre, description, displayPrice, ticketPrice, 'GBP', presalePriceValue, presaleCaption || null, userId, fingerprint, isInternalTicketing || false, sellTickets || false, eventCapacity, imageUrl, true, isVerified]
            );

            const eventId = result.rows[0].id;

            // Send notification for every manual submission
            try {
                // Get venue name for notification
                const venueResult = await client.query('SELECT name FROM venues WHERE id = $1', [venueId]);
                const venueName = venueResult.rows[0]?.name || 'Unknown Venue';

                // Get user email from Clerk
                const { clerkClient } = await import('@clerk/nextjs/server');
                const clerk = await clerkClient();
                const user = await clerk.users.getUser(userId);
                const userEmail = user.emailAddresses[0]?.emailAddress || 'Unknown';

                await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/notify-first-event`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        eventId,
                        eventName: name,
                        venueName,
                        date: timestamp,
                        userId,
                        userEmail
                    })
                });
            } catch (notifError) {
                console.error('Failed to send admin notification:', notifError);
                // Don't fail the event creation if notification fails
            }

            client.release();

            if (isJson) {
                return NextResponse.json({
                    success: true,
                    id: eventId,
                    needsApproval: needsApproval
                });
            } else {
                // For form submission, redirect with 303 to force GET method (Post/Redirect/Get pattern)
                return NextResponse.json({
                    success: true,
                    id: eventId,
                    needsApproval: needsApproval
                });
            }

        } catch (error: any) {
            client.release();
            console.error('Database Error:', error);
            // Handle unique constraint violation if fingerprint exists (duplicate entry)
            if (error.code === '23505') {
                return NextResponse.json({ error: 'This gig already exists!' }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Request Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
