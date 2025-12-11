'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Types
interface Gig {
    id: number;
    name: string;
    venue: string;
    date: string; // ISO string 
    genre: string;
    price: string;
    created_at: string;
}

export default function MyGigsPage() {
    const { isLoaded, isSignedIn, user } = useUser();
    const router = useRouter();
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in');
        } else if (isLoaded && isSignedIn) {
            fetchGigs();
        }
    }, [isLoaded, isSignedIn]);

    const fetchGigs = async () => {
        try {
            const res = await fetch('/api/events/user');
            if (!res.ok) throw new Error('Failed to fetch gigs');
            const data = await res.json();
            setGigs(data.events || []);
        } catch (err) {
            console.error(err);
            setError('Could not load your gigs. Trying refreshing?');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this gig? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/events/user?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                // Remove from local state
                setGigs(prev => prev.filter(g => g.id !== id));
            } else {
                alert('Failed to delete gig.');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting gig.');
        }
    };

    if (!isLoaded || loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <h2 className="step-title">Loading...</h2>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '100px' }}> {/* Padding for footer */}
            <header style={{ padding: '1rem', textAlign: 'center', position: 'relative' }}>
                <h1 className="main-title" style={{ position: 'relative', margin: '0 0 2rem 0', fontSize: '3rem', top: 'auto', left: 'auto' }}>
                    MY GIGS
                </h1>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <Link href="/gigfinder/add-event" className="btn-primary" style={{ textDecoration: 'none', fontSize: '1rem' }}>
                        + NEW GIG
                    </Link>
                    <Link href="/gigfinder" className="btn-back" style={{ textDecoration: 'none', fontSize: '1rem' }}>
                        ← FIND GIGS
                    </Link>
                </div>
            </header>

            <main className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>

                {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

                {gigs.length === 0 && !error ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', border: '3px solid var(--color-border)' }}>
                        <h2 style={{ fontFamily: 'var(--font-primary)', textTransform: 'uppercase', marginBottom: '1rem' }}>It's Quiet Here...</h2>
                        <p style={{ marginBottom: '2rem' }}>You haven't added any gigs yet.</p>
                        <Link href="/gigfinder/add-event" className="btn-primary" style={{ textDecoration: 'none' }}>
                            START PROMOTING
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {gigs.map(gig => (
                            <div key={gig.id} style={{
                                background: 'var(--color-surface)',
                                border: '3px solid var(--color-border)',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                boxShadow: '5px 5px 0 var(--color-primary)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.8rem', textTransform: 'uppercase', margin: 0, lineHeight: 1.1 }}>
                                            {gig.name}
                                        </h3>
                                        <div style={{ color: 'var(--color-text-dim)', fontSize: '0.9rem', marginTop: '0.5rem', fontFamily: 'var(--font-secondary)' }}>
                                            {new Date(gig.date).toLocaleDateString()} @ {gig.venue}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'var(--color-accent)',
                                        color: '#000',
                                        padding: '0.2rem 0.5rem',
                                        fontFamily: 'var(--font-primary)',
                                        textTransform: 'uppercase',
                                        fontSize: '0.8rem',
                                        border: '2px solid #fff'
                                    }}>
                                        {gig.genre || 'Gig'}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    <Link href={`/gigfinder/edit/${gig.id}`} className="btn-back" style={{ border: '2px solid var(--color-text)', padding: '0.5rem 1rem', textDecoration: 'none' }}>
                                        EDIT
                                    </Link>

                                    <button
                                        onClick={() => handleDelete(gig.id)}
                                        className="btn-back"
                                        style={{
                                            background: 'transparent',
                                            border: '2px solid red',
                                            color: 'red',
                                            padding: '0.5rem 1rem',
                                            cursor: 'pointer',
                                            fontFamily: 'var(--font-secondary)'
                                        }}
                                    >
                                        DELETE
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
