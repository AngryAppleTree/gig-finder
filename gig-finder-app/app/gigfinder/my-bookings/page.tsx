'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <h2 className="step-title">Loading...</h2>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '100px' }}>
            <header style={{ padding: '1rem', textAlign: 'center', position: 'relative' }}>
                <h1 className="main-title" style={{ position: 'relative', margin: '0 0 2rem 0', fontSize: '3rem', top: 'auto', left: 'auto' }}>
                    MY BOOKINGS
                </h1>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <Link href="/gigfinder" className="btn-back" style={{ textDecoration: 'none', fontSize: '1rem' }}>
                        ← FIND GIGS
                    </Link>
                </div>
            </header>

            <main className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
                {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

                {bookings.length === 0 && !error ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', border: '3px solid var(--color-border)' }}>
                        <h2 style={{ fontFamily: 'var(--font-primary)', textTransform: 'uppercase', marginBottom: '1rem' }}>No Bookings Yet</h2>
                        <p style={{ marginBottom: '2rem' }}>You haven't booked any gigs yet.</p>
                        <Link href="/gigfinder" className="btn-primary" style={{ textDecoration: 'none' }}>
                            FIND GIGS
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {bookings.map(booking => (
                            <div key={booking.id} style={{
                                background: 'var(--color-surface)',
                                border: '3px solid var(--color-border)',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                boxShadow: '5px 5px 0 var(--color-primary)',
                                opacity: booking.status === 'refunded' ? 0.6 : 1
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.8rem', textTransform: 'uppercase', margin: 0, lineHeight: 1.1 }}>
                                            {booking.event_name}
                                        </h3>
                                        <div style={{ color: 'var(--color-text-dim)', fontSize: '0.9rem', marginTop: '0.5rem', fontFamily: 'var(--font-secondary)' }}>
                                            {new Date(booking.date).toLocaleDateString()} @ {booking.venue}
                                        </div>
                                        <div style={{ color: 'var(--color-text-dim)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                            {booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}
                                            {booking.price_paid && ` • £${booking.price_paid.toFixed(2)}`}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: booking.status === 'confirmed' ? 'rgba(0,255,0,0.2)' : 'rgba(255,0,0,0.2)',
                                        color: booking.status === 'confirmed' ? '#0f0' : '#f00',
                                        padding: '0.3rem 0.6rem',
                                        fontFamily: 'var(--font-primary)',
                                        textTransform: 'uppercase',
                                        fontSize: '0.8rem',
                                        border: `2px solid ${booking.status === 'confirmed' ? '#0f0' : '#f00'}`
                                    }}>
                                        {booking.status}
                                    </div>
                                </div>

                                {booking.status === 'confirmed' && booking.price_paid && booking.price_paid > 0 && (
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                        <Link
                                            href={`/gigfinder/my-bookings/cancel/${booking.id}`}
                                            className="btn-back"
                                            style={{
                                                border: '2px solid red',
                                                color: 'red',
                                                padding: '0.5rem 1rem',
                                                textDecoration: 'none',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            CANCEL & REFUND
                                        </Link>
                                    </div>
                                )}

                                {booking.status === 'refunded' && (
                                    <div style={{ color: '#f00', fontSize: '0.9rem', marginTop: '0.5rem' }}>
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
