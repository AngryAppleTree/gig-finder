import Link from 'next/link';

export default function GigAddedPage() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

            <header style={{ padding: '1rem', textAlign: 'center', width: '100%', position: 'absolute', top: 0, left: 0 }}>
                <h1 className="main-title" style={{ position: 'relative', margin: '0', fontSize: '3rem', top: 'auto', left: 'auto' }}>GIG<br />FINDER</h1>
            </header>

            <main className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', zIndex: 10 }}>
                <div style={{
                    background: 'var(--color-surface)',
                    padding: '3rem 2rem',
                    border: '3px solid var(--color-border)',
                    boxShadow: '8px 8px 0 var(--color-secondary)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }} role="img" aria-label="Rock On">🤘</div>
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
