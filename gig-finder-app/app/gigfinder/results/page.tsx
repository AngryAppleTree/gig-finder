'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ResultsList } from '@/components/gigfinder/ResultsList';
import { BookingModal } from '@/components/gigfinder/BookingModal';
import { Footer } from '@/components/gigfinder/Footer';
import { Gig } from '@/components/gigfinder/types';
import { postcodeCoordinates, venueLocations } from '@/components/gigfinder/constants';
import { calculateDistance } from '@/components/gigfinder/utils';
import styles from './results.module.css';
import { api } from '@/lib/api-client';
import { ApiError } from '@/lib/errors/ApiError';

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

            // Fetch events from API using API client
            const data = await api.events.search({
                keyword: keyword || undefined,
                location,
                minDate: minDate || undefined,
            });

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
                sellTickets: e.sellTickets,
                source: e.source,
                price: e.price || e.entryprice,
                priceVal: e.priceVal || e.ticketPrice || 0,
                vibe: e.vibe,
                capacity: e.capacity,
                distance: e.distance,
                presale_price: e.presale_price,
                presale_caption: e.presale_caption,
                isVerified: e.isVerified  // Include verification status
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

            // 2. Venue size filtering (uses capacity from venues table)
            if (venueSize && venueSize !== 'any') {
                transformedGigs = transformedGigs.filter(gig => {
                    // Parse capacity - could be string or number from API
                    let capacityNum: number | null = null;

                    if (typeof gig.capacity === 'number') {
                        capacityNum = gig.capacity;
                    } else if (typeof gig.capacity === 'string' && gig.capacity !== 'Unknown') {
                        const parsed = parseInt(gig.capacity);
                        if (!isNaN(parsed)) {
                            capacityNum = parsed;
                        }
                    }

                    // If venue has no capacity data, include it (will improve as venues are added)
                    if (capacityNum === null) return true;

                    // Apply size filters based on venue capacity
                    if (venueSize === 'small') return capacityNum <= 100;
                    if (venueSize === 'medium') return capacityNum > 100 && capacityNum <= 5000;
                    if (venueSize === 'huge') return capacityNum > 5000;

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
            if (err instanceof ApiError) {
                setError(err.getUserMessage());
            } else {
                setError('Failed to load gigs. Please try again.');
            }
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
                <main className={`container ${styles.mainLoading}`}>
                    <div className="step active">
                        <h2 className="step-title">🔍 Searching...</h2>
                        <p className={styles.loadingMessage}>
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
                <main className={`container ${styles.mainLoading}`}>
                    <div className="step active">
                        <h2 className="step-title">❌ Error</h2>
                        <p className={styles.errorMessage}>
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

            {/* Sticky Navigation Header */}
            <div className={styles.stickyHeader}>
                <div className={`nav-buttons ${styles.navButtonsContainer}`}>
                    <button className="btn-back" onClick={handleBack}>← Back</button>
                    <button className="btn-primary" onClick={handleStartOver}>Start Over</button>
                </div>
            </div>

            <main className={`container ${styles.mainResults}`}>
                <section className="step active">
                    <h2 className="step-title">Your Gigs 🎸</h2>

                    <ResultsList
                        gigs={gigs}
                        onBack={handleBack}
                        onStartOver={handleStartOver}
                    />
                </section>
            </main>
            <BookingModal />
            <Footer />
        </>
    );
}

// Loading fallback component
function ResultsLoading() {
    return (
        <>
            <h1 className="main-title">GIG<br />FINDER</h1>
            <main className={`container ${styles.mainLoading}`}>
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
