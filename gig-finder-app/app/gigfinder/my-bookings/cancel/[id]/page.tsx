'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Booking {
    id: number;
    event_name: string;
    venue: string;
    date: string;
    quantity: number;
    price_paid: number;
    status: string;
}

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
            const res = await fetch(`/api/bookings/my-bookings`);
            if (!res.ok) throw new Error('Failed to fetch booking');

            const data = await res.json();
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
            setError('Could not load booking');
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
            const res = await fetch('/api/bookings/refund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: parseInt(bookingId) })
            });

            const data = await res.json();

            if (data.success) {
                alert(`Refund successful! £${data.amount.toFixed(2)} will be returned to your account within 5-10 business days.`);
                router.push('/gigfinder/my-bookings');
            } else {
                setError(data.error || 'Refund failed');
            }
        } catch (err: any) {
            setError(err.message || 'Refund failed');
        } finally {
            setCancelling(false);
        }
    };

    if (!isLoaded || loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <h2 className="step-title">Loading...</h2>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
                <h2 className="step-title" style={{ color: 'red' }}>{error || 'Booking not found'}</h2>
                <Link href="/gigfinder/my-bookings" className="btn-primary" style={{ textDecoration: 'none' }}>
                    ← Back to My Bookings
                </Link>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '100px' }}>
            <header style={{ padding: '1rem', textAlign: 'center' }}>
                <h1 className="main-title" style={{ position: 'relative', margin: '0 0 2rem 0', fontSize: '3rem' }}>
                    CANCEL BOOKING
                </h1>
            </header>

            <main className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '0 1rem' }}>
                <div style={{
                    background: 'var(--color-surface)',
                    border: '3px solid var(--color-border)',
                    padding: '2rem',
                    boxShadow: '8px 8px 0 var(--color-primary)'
                }}>
                    <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '2rem', textTransform: 'uppercase', marginBottom: '1.5rem', color: 'var(--color-secondary)' }}>
                        {booking.event_name}
                    </h2>

                    <div style={{ marginBottom: '2rem', lineHeight: 1.8 }}>
                        <p><strong>Venue:</strong> {booking.venue}</p>
                        <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                        <p><strong>Tickets:</strong> {booking.quantity}</p>
                        <p><strong>Amount Paid:</strong> £{booking.price_paid.toFixed(2)}</p>
                    </div>

                    <div style={{
                        background: 'rgba(255,255,0,0.1)',
                        border: '2px solid #ff0',
                        padding: '1rem',
                        borderRadius: '4px',
                        marginBottom: '2rem'
                    }}>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>
                            ⚠️ <strong>Cancellation Policy:</strong><br />
                            You will receive a full refund of £{booking.price_paid.toFixed(2)}.<br />
                            The refund will appear in your account within 5-10 business days.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="btn-primary"
                            style={{
                                flex: 1,
                                background: 'red',
                                borderColor: 'red',
                                opacity: cancelling ? 0.5 : 1,
                                cursor: cancelling ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {cancelling ? 'PROCESSING...' : 'CONFIRM CANCELLATION'}
                        </button>
                        <Link
                            href="/gigfinder/my-bookings"
                            className="btn-back"
                            style={{
                                flex: 1,
                                textDecoration: 'none',
                                textAlign: 'center'
                            }}
                        >
                            KEEP BOOKING
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
