'use client';

import React from 'react';

export function BookingModal() {
    return (
        <div id="booking-modal" className="modal-overlay hidden" style={{ display: 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, justifyContent: 'center', alignItems: 'center' }}>
            <div className="modal-content" style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '90%', position: 'relative', border: '1px solid var(--color-primary)', boxShadow: '0 0 20px rgba(255,51,102,0.3)' }}>
                {/* Legacy script handles closeBookingModal() */}
                <button
                    onClick={() => (window as any).closeBookingModal && (window as any).closeBookingModal()}
                    style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}
                >
                    &times;
                </button>
                <h2 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', textAlign: 'center', fontFamily: 'var(--font-display)' }}>Get on the List</h2>
                <p id="booking-event-name" style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#ccc', fontSize: '0.9rem' }}></p>

                {/* Legacy script handles handleBookingSubmit(event) */}
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if ((window as any).handleBookingSubmit) (window as any).handleBookingSubmit(e);
                }}>
                    <input type="hidden" id="booking-event-id" />
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Your Full Name</label>
                        <input type="text" id="booking-name" required style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #333', background: '#000', color: 'white', fontFamily: 'inherit' }} />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email Address</label>
                        <input type="email" id="booking-email" required style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #333', background: '#000', color: 'white', fontFamily: 'inherit' }} />
                        <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.3rem' }}>We'll email your ticket instantly.</p>
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Confirm Booking</button>
                </form>
            </div>
        </div>
    );
}
