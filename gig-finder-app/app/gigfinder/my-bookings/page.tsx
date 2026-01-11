'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './MyBookings.module.css';

interface Booking {
    id: number;
    event_id: number;
    event_name: string;
    venue: string;
    date: string;
    quantity: number;
    status: string;
    price_paid: number | null;
    created_at: string;
}

export default function MyBookingsPage() {
    const { isLoaded, isSignedIn, user } = useUser();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in');
        } else if (isLoaded && isSignedIn) {
            fetchBookings();
        }
    }, [isLoaded, isSignedIn]);

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/bookings/my-bookings');
            if (!res.ok) throw new Error('Failed to fetch bookings');
            const data = await res.json();
            setBookings(data.bookings || []);
        } catch (err) {
            console.error(err);
            setError('Could not load your bookings.');
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className={styles.loadingContainer}>
                <h2 className="step-title">Loading...</h2>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <h1 className={`main-title ${styles.title}`}>
                    MY BOOKINGS
                </h1>

                <div className={styles.navButtons}>
                    <Link href="/gigfinder" className={`btn-back ${styles.backButton}`}>
                        ← FIND GIGS
                    </Link>
                </div>
            </header>

            <main className={`container ${styles.mainContainer}`}>
                {error && <div className={styles.errorMessage}>{error}</div>}

                {bookings.length === 0 && !error ? (
                    <div className={styles.emptyState}>
                        <h2 className={styles.emptyTitle}>No Bookings Yet</h2>
                        <p className={styles.emptyText}>You haven't booked any gigs yet.</p>
                        <Link href="/gigfinder" className={`btn-primary ${styles.emptyButton}`}>
                            FIND GIGS
                        </Link>
                    </div>
                ) : (
                    <div className={styles.bookingsList}>
                        {bookings.map(booking => (
                            <div
                                key={booking.id}
                                className={`${styles.bookingCard} ${booking.status === 'refunded' ? styles.bookingCardRefunded : ''}`}
                            >
                                <div className={styles.bookingHeader}>
                                    <div className={styles.bookingInfo}>
                                        <h3 className={styles.eventName}>
                                            {booking.event_name}
                                        </h3>
                                        <div className={styles.eventDetails}>
                                            {new Date(booking.date).toLocaleDateString()} @ {booking.venue}
                                        </div>
                                        <div className={styles.ticketInfo}>
                                            {booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}
                                            {booking.price_paid && ` • £${booking.price_paid.toFixed(2)}`}
                                        </div>
                                    </div>
                                    <div className={`${styles.statusBadge} ${booking.status === 'confirmed' ? styles.statusConfirmed : styles.statusRefunded}`}>
                                        {booking.status}
                                    </div>
                                </div>

                                {booking.status === 'confirmed' && booking.price_paid && booking.price_paid > 0 && (
                                    <div className={styles.actions}>
                                        <Link
                                            href={`/gigfinder/my-bookings/cancel/${booking.id}`}
                                            className={`btn-back ${styles.cancelButton}`}
                                        >
                                            CANCEL & REFUND
                                        </Link>
                                    </div>
                                )}

                                {booking.status === 'refunded' && (
                                    <div className={styles.refundMessage}>
                                        ✓ Refund processed - Money will be returned within 5-10 business days
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
