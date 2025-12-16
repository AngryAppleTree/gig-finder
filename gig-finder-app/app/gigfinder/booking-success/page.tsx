'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function BookingSuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Optional: Verify session with backend
        if (sessionId) {
            setTimeout(() => setLoading(false), 1000);
        } else {
            setLoading(false);
        }
    }, [sessionId]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '2rem' }}>Processing...</h2>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
            <header style={{ padding: '1rem', textAlign: 'left' }}>
                <h1 className="main-title" style={{ position: 'relative', margin: '0', fontSize: '3rem' }}>GIG<br />FINDER</h1>
            </header>

            <main className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
                <div style={{ background: 'var(--color-surface)', padding: '3rem 2rem', border: '3px solid var(--color-secondary)', boxShadow: '8px 8px 0 var(--color-secondary)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                    <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '2.5rem', color: 'var(--color-secondary)', marginBottom: '1rem' }}>
                        PAYMENT SUCCESSFUL!
                    </h2>
                    <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#ccc' }}>
                        Your tickets have been confirmed and sent to your email.
                    </p>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                        <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '0.5rem' }}>
                            📧 Check your inbox for:
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.95rem' }}>
                            <li>✅ Payment receipt</li>
                            <li>✅ Event details</li>
                            <li>✅ QR code for entry</li>
                        </ul>
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

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '2rem' }}>Loading...</h2>
                </div>
            </div>
        }>
            <BookingSuccessContent />
        </Suspense>
    );
}
