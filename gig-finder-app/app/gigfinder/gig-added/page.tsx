'use client';

import Link from 'next/link';

export default function GigAddedPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
            <link rel="stylesheet" href="/gigfinder/style.css?v=99" />

            <header style={{ padding: '1rem', textAlign: 'center', width: '100%' }}>
                <h1 className="main-title" style={{ position: 'relative', margin: '0', fontSize: '3rem', top: 'auto', left: 'auto' }}>GIG<br />FINDER</h1>
            </header>

            <main className="container" style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{
                    background: 'var(--color-surface)',
                    padding: '3rem 2rem',
                    border: '3px solid var(--color-border)',
                    boxShadow: '8px 8px 0 var(--color-secondary)', // Green/Secondary shadow for success
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤘</div>
                    <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '2.5rem', marginBottom: '1rem', textTransform: 'uppercase', color: 'var(--color-text)' }}>
                        NICE ONE!
                    </h2>
                    <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                        Your gig has been added to the database.<br />
                        It's now live for everyone to find.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Link href="/gigfinder/add-event" className="btn-primary" style={{ textDecoration: 'none', fontSize: '1.2rem', textAlign: 'center' }}>
                            ADD ANOTHER GIG +
                        </Link>

                        <Link href="/gigfinder" className="btn-back" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>
                            ← Back to Finder
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
