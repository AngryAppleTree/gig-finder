// Skiddle API Route
// Fetches events from Skiddle API and transforms them to GigFinder format

import { NextRequest, NextResponse } from 'next/server';
import { getVenueCapacity } from './venue-capacities';
import { mapGenreToVibe } from './genre-mapping';

const SKIDDLE_API_BASE = 'https://www.skiddle.com/api/v1';

interface SkiddleEvent {
    id: string;
    eventname: string;
    venue: {
        name: string;
        town: string;
        latitude: string;
        longitude: string;
    };
    date: string;
    openingtimes: {
        doorsopen: string;
    };
    entryprice: string;
    link: string;
    description: string;
    EventCode: string;
    imageurl: string;
    genres?: Array<{ name: string }>;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get('location') || 'Edinburgh';
    const genre = searchParams.get('genre');
    const minDate = searchParams.get('minDate');
    const maxDate = searchParams.get('maxDate');

    const apiKey = process.env.SKIDDLE_API_KEY;

    if (!apiKey || apiKey === 'your_skiddle_api_key_here') {
        return NextResponse.json(
            { error: 'Skiddle API key not configured. Please add your API key to .env.local' },
            { status: 500 }
        );
    }

    try {
        // Build Skiddle API URL
        const params = new URLSearchParams({
            api_key: apiKey,
            latitude: location === 'Edinburgh' ? '55.9533' : '55.8642',
            longitude: location === 'Edinburgh' ? '-3.1883' : '-4.2518',
            radius: '20',
            order: 'date',
            limit: '100',
            eventcode: 'LIVE', // Live music events only
        });

        if (minDate) params.append('minDate', minDate);
        if (maxDate) params.append('maxDate', maxDate);
        if (genre) params.append('g', genre);

        const skiddleUrl = `${SKIDDLE_API_BASE}/events/search/?${params.toString()}`;

        console.log('Fetching from Skiddle:', skiddleUrl.replace(apiKey, 'API_KEY_HIDDEN'));

        const response = await fetch(skiddleUrl);

        if (!response.ok) {
            throw new Error(`Skiddle API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Transform Skiddle events to GigFinder format
        const events = (data.results || []).map((event: SkiddleEvent, index: number) => {
            // Parse price
            let priceVal = 0;
            let priceText = 'Free';

            if (event.entryprice) {
                const priceMatch = event.entryprice.match(/£?([\d.]+)/);
                if (priceMatch) {
                    priceVal = parseFloat(priceMatch[1]);
                    priceText = `£${priceVal.toFixed(2)}`;
                }
            }

            // Map genre to vibe
            let vibe = mapGenreToVibe(event.genres || []);

            // Fallback: If no genre data from API, try to detect from name/description
            if (vibe === 'indie_alt' && (!event.genres || event.genres.length === 0)) {
                const textToAnalyze = `${event.eventname} ${event.description || ''}`.toLowerCase();

                // Classical music keywords
                if (textToAnalyze.match(/\b(beethoven|bach|mozart|classical|symphony|orchestra|concerto|sonata|chamber|opera|vivaldi|chopin|tchaikovsky|brahms|handel|candlelight|string quartet)\b/i)) {
                    vibe = 'classical';
                }
                // Rock/Blues/Punk keywords
                else if (textToAnalyze.match(/\b(rock|punk|blues|grunge|garage)\b/i)) {
                    vibe = 'rock_blues_punk';
                }
                // Metal keywords
                else if (textToAnalyze.match(/\b(metal|metalcore|hardcore|deathcore)\b/i)) {
                    vibe = 'metal';
                }
                // Electronic keywords
                else if (textToAnalyze.match(/\b(techno|house|electronic|edm|dj|rave|drum and bass|dnb)\b/i)) {
                    vibe = 'electronic';
                }
                // Hip Hop keywords
                else if (textToAnalyze.match(/\b(hip hop|rap|r&b|grime|trap)\b/i)) {
                    vibe = 'hiphop';
                }
                // Acoustic/Folk/Jazz keywords
                else if (textToAnalyze.match(/\b(acoustic|folk|jazz|singer-songwriter|bluegrass|country|americana)\b/i)) {
                    vibe = 'acoustic';
                }
                // Pop keywords
                else if (textToAnalyze.match(/\b(pop|chart|mainstream)\b/i)) {
                    vibe = 'pop';
                }
            }

            // Parse date
            const dateObj = new Date(event.date);
            const formattedDate = dateObj.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            });

            return {
                id: parseInt(event.id) || 1000 + index,
                name: event.eventname,
                location: event.venue.name,
                venue: event.venue.name,
                town: event.venue.town,
                coords: {
                    lat: parseFloat(event.venue.latitude),
                    lon: parseFloat(event.venue.longitude),
                },
                capacity: getVenueCapacity(event.venue.name),
                dateObj: event.date,
                date: formattedDate,
                time: event.openingtimes?.doorsopen || 'TBA',
                priceVal: priceVal,
                price: priceText,
                vibe: vibe,
                ticketUrl: event.link,
                description: event.description || 'Live music event',
                imageUrl: event.imageurl,
                source: 'skiddle',
                skiddleEventCode: event.EventCode,
            };
        });

        return NextResponse.json({
            success: true,
            count: events.length,
            events: events,
            source: 'skiddle'
        });

    } catch (error) {
        console.error('Skiddle API error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch events from Skiddle',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
