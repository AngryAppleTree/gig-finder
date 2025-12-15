'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GigCard } from '@/components/gigfinder/GigCard';
import { Footer } from '@/components/gigfinder/Footer';
import { Gig } from '@/components/gigfinder/types';
import { postcodeCoordinates, venueLocations } from '@/components/gigfinder/constants';
import { calculateDistance } from '@/components/gigfinder/utils';

function ResultsPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        performSearch();
    }, [searchParams]);

    const performSearch = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Extract search parameters
            const keyword = searchParams.get('keyword') || '';
            const location = searchParams.get('location') || 'Edinburgh';
            const minDate = searchParams.get('minDate') || '';
            const genre = searchParams.get('genre') || '';
            const budget = searchParams.get('budget') || '';
            const venueSize = searchParams.get('venueSize') || '';
            const postcode = searchParams.get('postcode') || '';
            const distance = searchParams.get('distance') || '';

            // Build API query
            const params = new URLSearchParams();
            if (keyword) params.append('keyword', keyword);
            params.append('location', location);
            if (minDate) params.append('minDate', minDate);

            // Fetch events from API
            const response = await fetch(`/api/events?${params.toString()}`);
            const data = await response.json();

            let rawEvents = data.events || [];

            // No fallback - production should only show real events

            // Transform to Gig format
            let transformedGigs: Gig[] = rawEvents.map((e: any) => ({
                id: e.id,
                name: e.name || e.eventname,
                venue: e.venue?.name || e.venue,
                location: e.venue?.name || e.location,
                town: e.venue?.town || e.town,
                date: typeof e.date === 'string' ? e.date : new Date(e.dateObj).toLocaleDateString(),
                time: e.time || 'TBA',
                dateObj: e.dateObj,
                description: e.description,
                imageUrl: e.imageUrl || e.imageurl,
                ticketUrl: e.ticketUrl || e.link,
                isInternalTicketing: e.isInternalTicketing,
                price: e.price || e.entryprice,
                vibe: e.vibe,
                capacity: e.capacity,
                distance: e.distance
            }));

            // Apply client-side filters

            // 1. Distance filtering
            if (postcode && distance) {
                const shortPC = postcode.split(' ')[0];
                const userCoords = postcodeCoordinates[shortPC] || postcodeCoordinates['DEFAULT'];

                if (userCoords) {
                    transformedGigs = transformedGigs.map(g => {
                        const venueData = venueLocations[g.venue];
                        if (venueData) {
                            const dist = calculateDistance(userCoords.lat, userCoords.lon, venueData.lat, venueData.lon);
                            return { ...g, distance: dist };
                        }
                        return g;
                    });

                    if (distance === 'local') {
                        transformedGigs = transformedGigs.filter(g => g.distance !== undefined && g.distance <= 10);
                    } else if (distance === '100miles') {
                        transformedGigs = transformedGigs.filter(g => g.distance !== undefined && g.distance <= 100);
                    }
                }
            }

            // 2. Venue size filtering
            if (venueSize && venueSize !== 'any') {
                transformedGigs = transformedGigs.filter(gig => {
                    if (!gig.capacity) return true;
                    if (venueSize === 'small') return gig.capacity <= 100;
                    if (venueSize === 'medium') return gig.capacity > 100 && gig.capacity <= 5000;
                    if (venueSize === 'huge') return gig.capacity > 5000;
                    return true;
                });
            }

            // 3. Genre/Vibe filtering
            if (genre && genre !== 'surprise') {
                transformedGigs = transformedGigs.filter(gig => {
                    if (!gig.vibe) return true;
                    return gig.vibe === genre;
                });
            }

            // 4. Budget filtering
            if (budget && budget !== 'any') {
                transformedGigs = transformedGigs.filter(gig => {
                    if (gig.priceVal === undefined) return true;
                    if (budget === 'free') return gig.priceVal === 0;
                    if (budget === 'low') return gig.priceVal > 0 && gig.priceVal <= 20;
                    if (budget === 'mid') return gig.priceVal > 20 && gig.priceVal <= 50;
                    if (budget === 'high') return gig.priceVal > 50;
                    return true;
                });
            }

            setGigs(transformedGigs);
        } catch (err) {
            console.error('Search failed:', err);
            setError('Failed to load gigs. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleStartOver = () => {
        router.push('/gigfinder');
    };

    if (isLoading) {
        return (
            <>
                <h1 className="main-title">GIG<br />FINDER</h1>
                <main className="container" style={{ paddingTop: '120px' }}>
                    <div className="step active">
                        <h2 className="step-title">🔍 Searching...</h2>
                        <p style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--color-text-dim)' }}>
                            Finding the best gigs for you...
                        </p>
                    </div>
                </main>
            </>
        );
    }

    if (error) {
        return (
            <>
                <h1 className="main-title">GIG<br />FINDER</h1>
                <main className="container" style={{ paddingTop: '120px' }}>
                    <div className="step active">
                        <h2 className="step-title">❌ Error</h2>
                        <p style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--color-primary)', marginBottom: '2rem' }}>
                            {error}
                        </p>
                        <div className="nav-buttons">
                            <button className="btn-back" onClick={handleBack}>← Back</button>
                            <button className="btn-primary" onClick={handleStartOver}>Start Over</button>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <h1 className="main-title">GIG<br />FINDER</h1>
            <main className="container" style={{ paddingTop: '120px' }}>
                <section className="step active">
                    <h2 className="step-title">Your Gigs 🎸</h2>

                    {gigs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <p style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--color-text-dim)' }}>
                                No gigs found matching your criteria!
                            </p>
                            <p style={{ fontSize: '1rem', color: 'var(--color-text-dim)', marginBottom: '2rem' }}>
                                Try adjusting your filters or search again.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="results-summary">
                                <strong>Showing {gigs.length} gig{gigs.length !== 1 ? 's' : ''}</strong>
                            </div>

                            <div className="gigs-list">
                                {gigs.map(gig => (
                                    <GigCard key={gig.id} gig={gig} />
                                ))}
                            </div>
                        </>
                    )}

                    <div className="nav-buttons" style={{ marginTop: 'var(--spacing-xl)' }}>
                        <button className="btn-back" onClick={handleBack}>← Back</button>
                        <button className="btn-primary" onClick={handleStartOver}>Start Over</button>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

// Loading fallback component
function ResultsLoading() {
    return (
        <>
            <h1 className="main-title">GIG<br />FINDER</h1>
            <main className="container" style={{ paddingTop: '120px' }}>
                <div className="step active">
                    <h2 className="step-title">🔍 Loading...</h2>
                </div>
            </main>
        </>
    );
}

// Wrap in Suspense to fix Next.js static generation
export default function ResultsPage() {
    return (
        <Suspense fallback={<ResultsLoading />}>
            <ResultsPageContent />
        </Suspense>
    );
}
