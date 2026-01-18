'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './CancelBooking.module.css';
import { api } from '@/lib/api-client';
import { ApiError } from '@/lib/errors/ApiError';
import type { Booking } from '@/lib/api-types';

export default function CancelBookingPage() {
    const { isLoaded, isSignedIn } = useUser();
    const router = useRouter();
    const params = useParams();
    const bookingId = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in');
        } else if (isLoaded && isSignedIn) {
            fetchBooking();
        }
    }, [isLoaded, isSignedIn]);

    const fetchBooking = async () => {
        try {
            const data = await api.bookings.getMyBookings();
            const foundBooking = data.bookings?.find((b: Booking) => b.id === parseInt(bookingId));

            if (!foundBooking) {
                setError('Booking not found');
            } else if (foundBooking.status !== 'confirmed') {
                setError('This booking cannot be cancelled');
            } else {
                setBooking(foundBooking);
            }
        } catch (err) {
            console.error(err);
            if (err instanceof ApiError) {
                setError(err.getUserMessage());
            } else {
                setError('Could not load booking');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this booking? You will receive a full refund.')) {
            return;
        }

        setCancelling(true);

        try {
            const data = await api.bookings.requestRefund(parseInt(bookingId));

            if (data.success) {
                alert(`Refund successful! £${data.amount.toFixed(2)} will be returned to your account within 5-10 business days.`);
                router.push('/gigfinder/my-bookings');
            } else {
                setError('Refund failed');
            }
        } catch (err) {
            console.error(err);
            if (err instanceof ApiError) {
                setError(err.getUserMessage());
            } else {
                setError('Refund failed');
            }
        } finally {
            setCancelling(false);
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className={styles.loadingContainer}>
                <h2 className="step-title">Loading...</h2>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className={styles.errorContainer}>
                <h2 className={`step-title ${styles.errorTitle}`}>{error || 'Booking not found'}</h2>
                <Link href="/gigfinder/my-bookings" className={`btn-primary ${styles.errorButton}`}>
                    ← Back to My Bookings
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <h1 className={`main-title ${styles.title}`}>
                    CANCEL BOOKING
                </h1>
            </header>

            <main className={`container ${styles.mainContainer}`}>
                <div className={styles.bookingCard}>
                    <h2 className={styles.eventTitle}>
                        {booking.event_name}
                    </h2>

                    <div className={styles.bookingDetails}>
                        <p><strong>Venue:</strong> {booking.venue}</p>
                        <p><strong>Date:</strong> {booking.date && new Date(booking.date).toLocaleDateString()}</p>
                        <p><strong>Tickets:</strong> {booking.quantity}</p>
                        <p><strong>Amount Paid:</strong> £{booking.price_paid?.toFixed(2) || '0.00'}</p>
                    </div>

                    <div className={styles.warningBox}>
                        <p className={styles.warningText}>
                            ⚠️ <strong>Cancellation Policy:</strong><br />
                            You will receive a full refund of £{booking.price_paid?.toFixed(2) || '0.00'}.<br />
                            The refund will appear in your account within 5-10 business days.
                        </p>
                    </div>

                    <div className={styles.actions}>
                        <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className={`btn-primary ${styles.cancelButton} ${cancelling ? styles.cancelButtonDisabled : ''}`}
                        >
                            {cancelling ? 'PROCESSING...' : 'CONFIRM CANCELLATION'}
                        </button>
                        <Link
                            href="/gigfinder/my-bookings"
                            className={`btn-back ${styles.keepButton}`}
                        >
                            KEEP BOOKING
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
