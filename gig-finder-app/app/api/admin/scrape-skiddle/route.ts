import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { findOrCreateVenue } from '@/lib/venue-utils';
import { findOrCreateEvent } from '@/lib/event-utils';

async function checkAdmin() {
    const user = await currentUser();
    if (!user) return false;

    const isAdminRole = user.publicMetadata?.role === 'admin';
    const isAdminEmail = user.emailAddresses.some(email =>
        email.emailAddress === process.env.ADMIN_EMAIL
    );

    return isAdminRole || isAdminEmail;
}

export async function POST(req: Request) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const apiKey = process.env.SKIDDLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                error: 'Skiddle API key not configured'
            }, { status: 503 });
        }

        const SKIDDLE_API_BASE = 'https://www.skiddle.com/api/v1';

        // Fetch events from both Edinburgh and Glasgow (like the real-time search)
        const locations = [
            { name: 'Edinburgh', lat: '55.9533', lng: '-3.1883' },
            { name: 'Glasgow', lat: '55.8642', lng: '-4.2518' }
        ];

        let allEvents: any[] = [];

        for (const loc of locations) {
            const params = new URLSearchParams({
                api_key: apiKey,
                latitude: loc.lat,
                longitude: loc.lng,
                radius: '20',
                order: 'date',
                limit: '100',
                eventcode: 'LIVE',
            });

            const skiddleUrl = `${SKIDDLE_API_BASE}/events/search/?${params.toString()}`;
            console.log(`🎸 Fetching from Skiddle API (${loc.name})...`);

            const response = await fetch(skiddleUrl);
            if (!response.ok) {
                console.error(`Skiddle API error for ${loc.name}: ${response.status}`);
                continue;
            }

            const data = await response.json();
            const results = data.results || [];
            console.log(`  Found ${results.length} events in ${loc.name}`);
            allEvents = allEvents.concat(results);
        }

        console.log(`📍 Processing ${allEvents.length} total events from Skiddle...`);

        let venuesCreated = 0;
        let venuesExisting = 0;
        let eventsCreated = 0;
        let eventsExisting = 0;

        // Process venues first
        const venueMap = new Map<string, number>();

        for (const event of allEvents) {
            const venueName = event.venue?.name;
            if (!venueName || venueMap.has(venueName.toLowerCase())) {
                continue;
            }

            try {
                const venueResult = await findOrCreateVenue({
                    name: venueName,
                    city: event.venue.town || 'Edinburgh',
                    latitude: event.venue.latitude ? parseFloat(event.venue.latitude) : undefined,
                    longitude: event.venue.longitude ? parseFloat(event.venue.longitude) : undefined,
                }, 'skiddle');

                venueMap.set(venueName.toLowerCase(), venueResult.id);

                if (venueResult.isNew) {
                    venuesCreated++;
                } else {
                    venuesExisting++;
                }
            } catch (error) {
                console.error(`Failed to process venue ${venueName}:`, error);
            }
        }

        // Process events
        for (const event of allEvents) {
            try {
                const venueName = event.venue?.name;
                const venueId = venueMap.get(venueName?.toLowerCase());

                if (!venueId) {
                    continue;
                }

                // Parse price
                let priceVal = 0;
                let priceText = 'Free';
                if (event.entryprice) {
                    const m = event.entryprice.match(/£?([\d.]+)/);
                    if (m) {
                        priceVal = parseFloat(m[1]);
                        priceText = `£${priceVal.toFixed(2)}`;
                    }
                }

                const eventResult = await findOrCreateEvent({
                    name: event.eventname,
                    venueId: venueId,
                    date: event.date,
                    time: event.openingtimes?.doorsopen || undefined,
                    genre: event.genres?.[0]?.name || undefined,
                    description: event.description || undefined,
                    price: priceText,
                    ticketPrice: priceVal,
                    ticketUrl: event.link,
                    imageUrl: event.imageurl,
                    source: 'skiddle'
                });

                if (eventResult.isNew) {
                    eventsCreated++;
                } else {
                    eventsExisting++;
                }
            } catch (error) {
                console.error(`Failed to process event:`, error);
            }
        }

        return NextResponse.json({
            message: 'Skiddle Scraper Completed',
            stats: {
                venuesCreated,
                venuesExisting,
                eventsCreated,
                eventsExisting,
                totalProcessed: allEvents.length
            }
        });

    } catch (error) {
        console.error('Skiddle Scraper Error:', error);
        return NextResponse.json({
            error: 'Scraper Execution Failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
