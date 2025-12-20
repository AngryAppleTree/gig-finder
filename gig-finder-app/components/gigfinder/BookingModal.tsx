'use client';

import React, { useState, useEffect } from 'react';
import { calculatePlatformFee, formatCurrency, getPlatformFeeDescription } from '@/lib/platform-fee';

export function BookingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [gigId, setGigId] = useState<string | number>('');
    const [eventName, setEventName] = useState('');
    const [ticketPrice, setTicketPrice] = useState<number>(0);
    const [presalePrice, setPresalePrice] = useState<number | null>(null);
    const [presaleCaption, setPresaleCaption] = useState<string>('');
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [quantity, setQuantity] = useState(1);
    const [recordsQuantity, setRecordsQuantity] = useState(0);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const handleOpen = (e: CustomEvent) => {
            if (e.detail) {
                setGigId(e.detail.id);
                setEventName(e.detail.name);
                setTicketPrice(e.detail.price || 0);
                setPresalePrice(e.detail.presale_price || null);
                setPresaleCaption(e.detail.presale_caption || '');
                setIsOpen(true);
                setStatus('idle');
                setFormData({ name: '', email: '' });
                setQuantity(1);
                setRecordsQuantity(0);
            }
        };

        window.addEventListener('gigfinder-open-booking', handleOpen as EventListener);
        return () => {
            window.removeEventListener('gigfinder-open-booking', handleOpen as EventListener);
        };
    }, []);

    // Focus trap: prevent tabbing out of modal
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }

            // Trap focus within modal
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal-content');
                if (!modal) return;

                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

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
                        recordsQuantity: recordsQuantity,
                        recordsPrice: presalePrice,
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
                        name: formData.name,
                        email: formData.email,
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
                maxWidth: '450px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                border: '1px solid var(--color-primary)',
                boxShadow: '0 0 20px rgba(255,51,102,0.3)'
            }}>
                <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Close booking modal"
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

                            {/* Tickets Quantity Selector */}
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
                                <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.3rem', textAlign: 'center' }}>
                                    Maximum 10 tickets per booking
                                </p>
                            </div>

                            {/* Presale Records Section - Only show if presale price exists */}
                            {presalePrice && presalePrice > 0 && (
                                <div style={{
                                    marginBottom: '1.5rem',
                                    padding: '1rem',
                                    background: 'rgba(255, 51, 102, 0.1)',
                                    border: '1px solid var(--color-primary)',
                                    borderRadius: '8px'
                                }}>
                                    <div style={{ marginBottom: '0.8rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                            🎵 Add Vinyl Records
                                        </label>
                                        {presaleCaption && (
                                            <p style={{ fontSize: '0.75rem', color: '#ccc', marginBottom: '0.5rem' }}>
                                                {presaleCaption}
                                            </p>
                                        )}
                                        <p style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 'bold' }}>
                                            {formatCurrency(presalePrice)} per record
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => setRecordsQuantity(Math.max(0, recordsQuantity - 1))}
                                            disabled={recordsQuantity <= 0}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                border: '2px solid var(--color-primary)',
                                                background: recordsQuantity <= 0 ? '#333' : 'var(--color-surface)',
                                                color: recordsQuantity <= 0 ? '#666' : 'var(--color-primary)',
                                                fontSize: '1.5rem',
                                                cursor: recordsQuantity <= 0 ? 'not-allowed' : 'pointer',
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
                                            {recordsQuantity}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setRecordsQuantity(Math.min(10, recordsQuantity + 1))}
                                            disabled={recordsQuantity >= 10}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                border: '2px solid var(--color-primary)',
                                                background: recordsQuantity >= 10 ? '#333' : 'var(--color-surface)',
                                                color: recordsQuantity >= 10 ? '#666' : 'var(--color-primary)',
                                                fontSize: '1.5rem',
                                                cursor: recordsQuantity >= 10 ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Order Summary with Platform Fee */}
                            {ticketPrice > 0 && (
                                <div style={{
                                    marginBottom: '1.5rem',
                                    padding: '1rem',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '8px',
                                    border: '1px solid #333'
                                }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.8rem', color: '#ccc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Order Summary
                                    </h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                        <span style={{ color: '#999' }}>Tickets ({quantity}x)</span>
                                        <span style={{ color: 'white' }}>{formatCurrency(ticketPrice * quantity)}</span>
                                    </div>
                                    {recordsQuantity > 0 && presalePrice && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                            <span style={{ color: '#999' }}>Records ({recordsQuantity}x)</span>
                                            <span style={{ color: 'white' }}>{formatCurrency(presalePrice * recordsQuantity)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                        <span style={{ color: '#999' }}>{getPlatformFeeDescription()}</span>
                                        <span style={{ color: 'white' }}>{formatCurrency(calculatePlatformFee({
                                            ticketsSubtotal: ticketPrice * quantity,
                                            recordsSubtotal: (presalePrice || 0) * recordsQuantity
                                        }).platformFee)}</span>
                                    </div>
                                    <div style={{
                                        borderTop: '1px solid #444',
                                        marginTop: '0.8rem',
                                        paddingTop: '0.8rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold'
                                    }}>
                                        <span style={{ color: 'var(--color-secondary)' }}>Total</span>
                                        <span style={{ color: 'var(--color-secondary)' }}>
                                            {formatCurrency(calculatePlatformFee({
                                                ticketsSubtotal: ticketPrice * quantity,
                                                recordsSubtotal: (presalePrice || 0) * recordsQuantity
                                            }).total)}
                                        </span>
                                    </div>
                                </div>
                            )}
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
