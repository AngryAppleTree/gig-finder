'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gig } from '@/components/gigfinder/types';
import { BookingModal } from '@/components/gigfinder/BookingModal';
import { Footer } from '@/components/gigfinder/Footer';

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [event, setEvent] = useState<Gig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [eventId, setEventId] = useState<string>('');

    useEffect(() => {
        params.then(p => {
            setEventId(p.id);
            fetchEvent(p.id);
        });
    }, []);

    const fetchEvent = async (id: string) => {
        try {
            const response = await fetch(`/api/events/${id}`);
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Event not found');
                setLoading(false);
                return;
            }

            setEvent(data.event);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch event:', err);
            setError('Failed to load event');
            setLoading(false);
        }
    };

    const handleBooking = () => {
        if (!event) return;
        window.dispatchEvent(new CustomEvent('gigfinder-open-booking', {
            detail: {
                id: event.id,
                name: event.name,
                price: event.priceVal || 0,
                presale_price: event.presale_price,
                presale_caption: event.presale_caption
            }
        }));
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: event?.name,
                    text: `Check out ${event?.name} at ${event?.venue}`,
                    url: url
                });
            } catch (err) {
                // User cancelled or share failed
                copyToClipboard(url);
            }
        } else {
            copyToClipboard(url);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Link copied to clipboard!');
    };

    if (loading) {
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

    if (error || !event) {
        return (
            <>
                <h1 className="main-title">GIG<br />FINDER</h1>
                <main className="container" style={{ paddingTop: '120px' }}>
                    <div className="step active">
                        <h2 className="step-title">❌ Event Not Found</h2>
                        <p style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--color-text-dim)', marginBottom: '2rem' }}>
                            {error || 'This event could not be found.'}
                        </p>
                        <div className="nav-buttons">
                            <button className="btn-primary" onClick={() => router.push('/gigfinder')}>
                                Back to GigFinder
                            </button>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    const locationText = event.town ? `${event.location}, ${event.town}` : event.location;

    return (
        <>
            <h1 className="main-title">GIG<br />FINDER</h1>

            {/* Sticky Navigation Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'var(--color-bg)',
                borderBottom: '2px solid var(--color-border)',
                padding: '1rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}>
                <div className="nav-buttons" style={{ margin: 0, maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto' }}>
                    <button className="btn-back" onClick={() => router.back()}>← Back</button>
                    <button className="btn-primary" onClick={handleShare}>Share Event</button>
                </div>
            </div>

            <main className="container" style={{ paddingTop: '2rem', maxWidth: '800px' }}>
                <div className="gig-card" style={{ marginBottom: '2rem' }}>
                    {/* Verification Badge */}
                    {event.source !== 'manual' || event.isVerified ? (
                        <div className="badge-verified">✓ Verified</div>
                    ) : (
                        <div className="badge-unverified" title="This gig was posted by the community and is awaiting admin verification.">⚠ Community Post</div>
                    )}

                    {/* Event Image */}
                    {event.imageUrl && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <img
                                src={event.imageUrl}
                                alt={event.name}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    maxHeight: '400px',
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                }}
                            />
                        </div>
                    )}

                    {/* Event Details */}
                    <h2 className="gig-name" style={{ fontSize: '2rem', marginBottom: '1rem' }}>{event.name}</h2>

                    <div className="gig-info" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                        <p className="gig-location">📍 {locationText}</p>
                        <p className="gig-date">📅 {event.date} {event.time && `at ${event.time}`}</p>
                        <p className="gig-price">💰 {event.price}</p>
                        {event.capacity && <p>👥 Capacity: {event.capacity}</p>}
                    </div>

                    {/* Description */}
                    {event.description && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>About</h3>
                            <p style={{ color: 'var(--color-text)', lineHeight: '1.6' }}>{event.description}</p>
                        </div>
                    )}

                    {/* Presale Info */}
                    {event.presale_price && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(255,51,102,0.1), rgba(255,51,102,0.05))',
                            border: '2px solid var(--color-secondary)',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <p style={{
                                color: 'var(--color-secondary)',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                margin: '0 0 0.25rem 0'
                            }}>
                                💿 Presale: £{typeof event.presale_price === 'number' ? event.presale_price.toFixed(2) : parseFloat(event.presale_price).toFixed(2)}
                            </p>
                            {event.presale_caption && (
                                <p style={{
                                    color: '#ccc',
                                    fontSize: '0.9rem',
                                    margin: 0,
                                    fontStyle: 'italic'
                                }}>
                                    {event.presale_caption}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                        {/* Primary Action Button */}
                        {(event.isInternalTicketing || event.sellTickets) && event.source === 'manual' ? (
                            <button
                                className="btn-buy"
                                style={{ background: 'var(--color-secondary)', borderColor: 'var(--color-secondary)', cursor: 'pointer', width: '100%', fontSize: '1.1rem', padding: '1rem' }}
                                onClick={handleBooking}
                            >
                                {event.sellTickets ? 'Buy Tickets' : 'Get on Guest List'}
                            </button>
                        ) : (event.ticketUrl && event.ticketUrl !== '#' ? (
                            <a
                                href={event.ticketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-buy"
                                style={{ width: '100%', display: 'block', textAlign: 'center', fontSize: '1.1rem', padding: '1rem' }}
                            >
                                Get Tickets
                            </a>
                        ) : null)}

                        {/* Share Button */}
                        <button
                            className="btn-primary"
                            onClick={handleShare}
                            style={{ width: '100%', fontSize: '1rem', padding: '0.75rem' }}
                        >
                            📤 Share This Event
                        </button>
                    </div>
                </div>

                {/* Back Button */}
                <div className="nav-buttons" style={{ marginTop: '2rem' }}>
                    <button className="btn-back" onClick={() => router.back()}>← Back to Results</button>
                </div>
            </main>

            <BookingModal />
            <Footer />
        </>
    );
}
