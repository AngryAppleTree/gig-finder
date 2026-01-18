'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gig } from '@/components/gigfinder/types';
import { BookingModal } from '@/components/gigfinder/BookingModal';
import { Footer } from '@/components/gigfinder/Footer';
import '../../gigfinder.css';
import styles from './event-detail.module.css';

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [event, setEvent] = useState<Gig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        params.then(p => {
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
                <main className={`container ${styles.mainLoading}`}>
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
                <main className={`container ${styles.mainLoading}`}>
                    <div className="step active">
                        <h2 className="step-title">❌ Event Not Found</h2>
                        <p className={styles.errorMessage}>
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
            <div className={styles.stickyHeader}>
                <div className={`nav-buttons ${styles.navButtonsContainer}`}>
                    <button className="btn-back" onClick={() => router.back()}>← Back</button>
                    <button className="btn-primary" onClick={handleShare}>Share Event</button>
                </div>
            </div>

            <main className={`container ${styles.mainDetail}`}>
                {/* Reuse exact GigCard layout */}
                <div className="gig-card">
                    <div className="gig-image">
                        <img
                            src={event.imageUrl || '/no-photo.png'}
                            alt={`${event.name} at ${event.venue} on ${event.date}`}
                            onError={(e) => e.currentTarget.src = '/no-photo.png'}
                            className={styles.eventImage}
                        />
                    </div>
                    <div className="gig-details">
                        {event.source !== 'manual' || event.isVerified ? (
                            <div className="badge-verified">✓ Verified</div>
                        ) : (
                            <div className="badge-unverified" title="This gig was posted by the community and is awaiting admin verification.">⚠ Community Post</div>
                        )}
                        <h3 className="gig-name">{event.name}</h3>
                        <div className="gig-info">
                            <p className="gig-location">📍 {locationText}</p>
                            <p className="gig-date">📅 {event.date} at {event.time}</p>
                            <p className="gig-price">🎟️ {event.price}</p>
                            {event.capacity && <p>👥 Capacity: {event.capacity}</p>}

                            {/* Description - NEW field for detail page */}
                            {event.description && (
                                <div className={styles.descriptionSection}>
                                    <p className={styles.descriptionText}>
                                        {event.description}
                                    </p>
                                </div>
                            )}

                            {/* Presale info */}
                            {event.presale_price && (
                                <div className={styles.presaleSection}>
                                    <p className={styles.presalePrice}>
                                        💿 Presale: £{typeof event.presale_price === 'number' ? event.presale_price.toFixed(2) : parseFloat(event.presale_price).toFixed(2)}
                                    </p>
                                    {event.presale_caption && (
                                        <p className={styles.presaleCaption}>
                                            {event.presale_caption}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Action button - shows actual action instead of "View Event" */}
                        <div className={styles.actionButtonContainer}>
                            {(event.isInternalTicketing || event.sellTickets) && event.source === 'manual' ? (
                                <button
                                    className={`btn-buy ${styles.buyButton}`}
                                    onClick={handleBooking}
                                >
                                    {event.sellTickets ? 'Buy Tickets' : 'Get on Guest List'}
                                </button>
                            ) : (event.ticketUrl && event.ticketUrl !== '#' ? (
                                <a
                                    href={event.ticketUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`btn-buy ${styles.externalLink}`}
                                >
                                    Get Tickets
                                </a>
                            ) : (
                                <button
                                    className={`btn-buy ${styles.disabledButton}`}
                                    disabled
                                >
                                    No Tickets Available
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <BookingModal />
            <Footer />
        </>
    );
}
