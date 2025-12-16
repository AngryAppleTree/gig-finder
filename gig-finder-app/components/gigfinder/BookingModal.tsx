'use client';

import React, { useState, useEffect } from 'react';

export function BookingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [gigId, setGigId] = useState<string | number>('');
    const [eventName, setEventName] = useState('');
    const [ticketPrice, setTicketPrice] = useState<number>(0);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [quantity, setQuantity] = useState(1);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const handleOpen = (e: CustomEvent) => {
            console.log('Modal received event:', e.detail);
            if (e.detail) {
                setGigId(e.detail.id);
                setEventName(e.detail.name);
                setTicketPrice(e.detail.price || 0);
                setIsOpen(true);
                setStatus('idle');
                setFormData({ name: '', email: '' });
                setQuantity(1);
            }
        };

        window.addEventListener('gigfinder-open-booking', handleOpen as EventListener);
        return () => {
            window.removeEventListener('gigfinder-open-booking', handleOpen as EventListener);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            // Check if this is a paid event
            if (ticketPrice && ticketPrice > 0) {
                // Paid event - redirect to Stripe Checkout
                const res = await fetch('/api/stripe/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        eventId: gigId,
                        quantity: quantity,
                        customerName: formData.name,
                        customerEmail: formData.email
                    })
                });

                const data = await res.json();

                if (data.url) {
                    // Redirect to Stripe Checkout
                    window.location.href = data.url;
                } else {
                    throw new Error(data.error || 'Payment setup failed');
                }
            } else {
                // Free event - use existing booking flow
                const res = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        eventId: gigId,
                        customerName: formData.name,
                        customerEmail: formData.email,
                        quantity: quantity
                    })
                });

                const data = await res.json();
                if (data.success) {
                    setStatus('success');
                } else {
                    throw new Error(data.error || 'Booking failed');
                }
            }
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{
            display: 'flex',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div className="modal-content" style={{
                background: '#1a1a1a',
                padding: '2rem',
                borderRadius: '12px',
                maxWidth: '400px',
                width: '90%',
                position: 'relative',
                border: '1px solid var(--color-primary)',
                boxShadow: '0 0 20px rgba(255,51,102,0.3)'
            }}>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}
                >
                    &times;
                </button>

                {status === 'success' ? (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <h2 style={{ color: 'var(--color-secondary)', fontSize: '2rem', marginBottom: '1rem' }}>🎉</h2>
                        <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>You're on the list!</h3>
                        <p style={{ color: '#ccc', fontSize: '0.9rem' }}>Check your email for your ticket.</p>
                        <button
                            className="btn-primary"
                            onClick={() => setIsOpen(false)}
                            style={{ marginTop: '1.5rem', width: '100%' }}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', textAlign: 'center', fontFamily: 'var(--font-display)' }}>Get on the List</h2>
                        <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#ccc', fontSize: '0.9rem' }}>{eventName}</p>

                        {status === 'error' && (
                            <div style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid red', color: 'red', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.8rem' }}>
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Your Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #333', background: '#000', color: 'white', fontFamily: 'inherit' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #333', background: '#000', color: 'white', fontFamily: 'inherit' }}
                                />
                                <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.3rem' }}>We'll email your ticket instantly.</p>
                            </div>

                            {/* Quantity Selector */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Number of Tickets</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            border: '2px solid var(--color-primary)',
                                            background: quantity <= 1 ? '#333' : 'var(--color-surface)',
                                            color: quantity <= 1 ? '#666' : 'var(--color-primary)',
                                            fontSize: '1.5rem',
                                            cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        −
                                    </button>
                                    <div style={{
                                        flex: 1,
                                        textAlign: 'center',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        color: 'var(--color-primary)',
                                        fontFamily: 'var(--font-display)'
                                    }}>
                                        {quantity}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                                        disabled={quantity >= 10}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            border: '2px solid var(--color-primary)',
                                            background: quantity >= 10 ? '#333' : 'var(--color-surface)',
                                            color: quantity >= 10 ? '#666' : 'var(--color-primary)',
                                            fontSize: '1.5rem',
                                            cursor: quantity >= 10 ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                                {ticketPrice > 0 && (
                                    <p style={{
                                        fontSize: '0.9rem',
                                        color: 'var(--color-secondary)',
                                        marginTop: '0.5rem',
                                        textAlign: 'center',
                                        fontWeight: 'bold'
                                    }}>
                                        Total: £{(ticketPrice * quantity).toFixed(2)}
                                    </p>
                                )}
                                <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.3rem', textAlign: 'center' }}>
                                    Maximum 10 tickets per booking
                                </p>
                            </div>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={status === 'submitting'}
                                style={{ width: '100%', opacity: status === 'submitting' ? 0.7 : 1 }}
                            >
                                {status === 'submitting' ? 'Processing...' : 'Confirm Booking'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
