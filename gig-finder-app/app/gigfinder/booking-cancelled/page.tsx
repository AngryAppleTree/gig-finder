'use client';

import Link from 'next/link';

export default function BookingCancelledPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
            <header style={{ padding: '1rem', textAlign: 'left' }}>
                <h1 className="main-title" style={{ position: 'relative', margin: '0', fontSize: '3rem' }}>GIG<br />FINDER</h1>
            </header>

            <main className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
                <div style={{ background: 'var(--color-surface)', padding: '3rem 2rem', border: '3px solid var(--color-border)', boxShadow: '8px 8px 0 var(--color-border)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
                    <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
                        BOOKING CANCELLED
                    </h2>
                    <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#ccc' }}>
                        Your payment was cancelled. No charges were made.
                    </p>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                        <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
                            The tickets are still available if you'd like to try again.
                        </p>
                    </div>
                    <Link
                        href="/gigfinder"
                        className="btn-primary"
                        style={{ display: 'inline-block', textDecoration: 'none', padding: '1rem 2rem', fontSize: '1.1rem' }}
                    >
                        Back to GigFinder
                    </Link>
                </div>
            </main>
        </div>
    );
}
