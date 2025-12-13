'use client';

import React, { useState, useEffect } from 'react';

export function BookingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [gigId, setGigId] = useState<string | number>('');
    const [eventName, setEventName] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const handleOpen = (e: CustomEvent) => {
            if (e.detail) {
                setGigId(e.detail.id);
                setEventName(e.detail.name);
                setIsOpen(true);
                setStatus('idle');
                setFormData({ name: '', email: '' });
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
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId: gigId,
                    customerName: formData.name,
                    customerEmail: formData.email
                })
            });

            const data = await res.json();
            if (data.success) {
                setStatus('success');
            } else {
                throw new Error(data.error || 'Booking failed');
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
