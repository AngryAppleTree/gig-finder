'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Booking {
    id: number;
    event_name: string;
    venue: string;
    date: string;
    customer_name: string;
    customer_email: string;
    quantity: number;
    status: string;
    payment_intent_id: string | null;
    price_paid: number | null;
    created_at: string;
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refunding, setRefunding] = useState<number | null>(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/admin/bookings');
            const data = await res.json();
            if (data.bookings) {
                setBookings(data.bookings);
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefund = async (bookingId: number) => {
        if (!confirm('Are you sure you want to refund this booking? This cannot be undone.')) {
            return;
        }

        setRefunding(bookingId);

        try {
            const res = await fetch('/api/bookings/refund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId })
            });

            const data = await res.json();

            if (data.success) {
                alert(`Refund successful! £${data.amount.toFixed(2)} refunded.`);
                fetchBookings(); // Refresh list
            } else {
                alert(`Refund failed: ${data.error}`);
            }
        } catch (error: any) {
            alert(`Refund failed: ${error.message}`);
        } finally {
            setRefunding(null);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem' }}>
                <h1>Loading bookings...</h1>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontFamily: 'var(--font-primary)', fontSize: '2rem' }}>Bookings</h1>
                <Link href="/admin" className="btn-secondary">← Back to Admin</Link>
            </div>

            {bookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '2px solid var(--color-border)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Event</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Customer</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Qty</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Amount</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '1rem' }}>#{booking.id}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <strong>{booking.event_name}</strong><br />
                                        <small style={{ color: '#888' }}>{booking.venue}</small>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {booking.customer_name}<br />
                                        <small style={{ color: '#888' }}>{booking.customer_email}</small>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{booking.quantity}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {booking.price_paid ? `£${booking.price_paid.toFixed(2)}` : 'Free'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            background: booking.status === 'confirmed' ? 'rgba(0,255,0,0.2)' :
                                                booking.status === 'refunded' ? 'rgba(255,0,0,0.2)' :
                                                    'rgba(255,255,0,0.2)',
                                            color: booking.status === 'confirmed' ? '#0f0' :
                                                booking.status === 'refunded' ? '#f00' : '#ff0'
                                        }}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {new Date(booking.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {booking.status === 'confirmed' && booking.payment_intent_id && (
                                            <button
                                                onClick={() => handleRefund(booking.id)}
                                                disabled={refunding === booking.id}
                                                className="btn-secondary"
                                                style={{
                                                    fontSize: '0.8rem',
                                                    padding: '0.5rem 1rem',
                                                    opacity: refunding === booking.id ? 0.5 : 1
                                                }}
                                            >
                                                {refunding === booking.id ? 'Processing...' : 'Refund'}
                                            </button>
                                        )}
                                        {booking.status === 'refunded' && (
                                            <span style={{ color: '#888', fontSize: '0.8rem' }}>Refunded</span>
                                        )}
                                        {!booking.payment_intent_id && (
                                            <span style={{ color: '#888', fontSize: '0.8rem' }}>Free ticket</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
