'use client';

import React, { useState, useEffect } from 'react';
import { calculatePlatformFee, formatCurrency, getPlatformFeeDescription } from '@/lib/platform-fee';
import styles from './BookingModal.module.css';

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
        <div className={`modal-overlay ${styles.overlay}`}>
            <div className={`modal-content ${styles.content}`}>
                <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Close booking modal"
                    className={styles.closeButton}
                >
                    &times;
                </button>

                {status === 'success' ? (
                    <div className={styles.successContainer}>
                        <h2 className={styles.successIcon}>🎉</h2>
                        <h3 className={styles.successTitle}>You're on the list!</h3>
                        <p className={styles.successText}>Check your email for your ticket.</p>
                        <button
                            className={`btn-primary ${styles.successButton}`}
                            onClick={() => setIsOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <p className={styles.eventName}>{eventName}</p>

                        {status === 'error' && (
                            <div className={styles.errorBox}>
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label htmlFor="booking-name" className={styles.label}>Your Full Name</label>
                                <input
                                    id="booking-name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroupLarge}>
                                <label htmlFor="booking-email" className={styles.label}>Email Address</label>
                                <input
                                    id="booking-email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    aria-describedby="email-help"
                                    className={styles.input}
                                />
                                <p id="email-help" className={styles.helpText}>We'll email your ticket instantly.</p>
                            </div>

                            {/* Tickets Quantity Selector */}
                            <div className={styles.formGroupLarge}>
                                <label className={styles.label}>Number of Tickets</label>
                                <div className={styles.quantityContainer}>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                        aria-label="Decrease ticket quantity"
                                        className={styles.quantityButton}
                                    >
                                        −
                                    </button>
                                    <div className={styles.quantityDisplay}>
                                        {quantity}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                                        disabled={quantity >= 10}
                                        aria-label="Increase ticket quantity"
                                        className={styles.quantityButton}
                                    >
                                        +
                                    </button>
                                </div>
                                <p className={styles.helpTextCenter}>
                                    Maximum 10 tickets per booking
                                </p>
                            </div>

                            {/* Presale Records Section - Only show if presale price exists */}
                            {presalePrice && presalePrice > 0 && (
                                <div className={styles.presaleContainer}>
                                    <div className={styles.presaleHeader}>
                                        <label className={styles.presaleLabel}>
                                            🎵 Add Vinyl Records
                                        </label>
                                        {presaleCaption && (
                                            <p className={styles.presaleCaption}>
                                                {presaleCaption}
                                            </p>
                                        )}
                                        <p className={styles.presalePrice}>
                                            {formatCurrency(presalePrice)} per record
                                        </p>
                                    </div>
                                    <div className={styles.quantityContainer}>
                                        <button
                                            type="button"
                                            onClick={() => setRecordsQuantity(Math.max(0, recordsQuantity - 1))}
                                            disabled={recordsQuantity <= 0}
                                            className={styles.quantityButton}
                                        >
                                            −
                                        </button>
                                        <div className={styles.quantityDisplay}>
                                            {recordsQuantity}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setRecordsQuantity(Math.min(10, recordsQuantity + 1))}
                                            disabled={recordsQuantity >= 10}
                                            className={styles.quantityButton}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Order Summary with Platform Fee */}
                            {ticketPrice > 0 && (
                                <div className={styles.summaryContainer}>
                                    <h4 className={styles.summaryTitle}>
                                        Order Summary
                                    </h4>
                                    <div className={styles.summaryRow}>
                                        <span className={styles.summaryLabel}>Tickets ({quantity}x)</span>
                                        <span className={styles.summaryValue}>{formatCurrency(ticketPrice * quantity)}</span>
                                    </div>
                                    {recordsQuantity > 0 && presalePrice && (
                                        <div className={styles.summaryRow}>
                                            <span className={styles.summaryLabel}>Records ({recordsQuantity}x)</span>
                                            <span className={styles.summaryValue}>{formatCurrency(presalePrice * recordsQuantity)}</span>
                                        </div>
                                    )}
                                    <div className={styles.summaryRow}>
                                        <span className={styles.summaryLabel}>{getPlatformFeeDescription()}</span>
                                        <span className={styles.summaryValue}>{formatCurrency(calculatePlatformFee({
                                            ticketsSubtotal: ticketPrice * quantity,
                                            recordsSubtotal: (presalePrice || 0) * recordsQuantity
                                        }).platformFee)}</span>
                                    </div>
                                    <div className={styles.summaryTotal}>
                                        <span className={styles.summaryTotalLabel}>Total</span>
                                        <span className={styles.summaryTotalValue}>
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
                                className={`btn-primary ${styles.submitButton}`}
                                disabled={status === 'submitting'}
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
