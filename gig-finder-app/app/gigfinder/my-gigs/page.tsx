'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './my-gigs.module.css';

// Types
interface Gig {
    id: number;
    name: string;
    venue: string;
    date: string; // ISO string 
    genre: string;
    price: string;
    created_at: string;
    is_internal_ticketing?: boolean;
}

export default function MyGigsPage() {
    const { isLoaded, isSignedIn, user } = useUser();
    const router = useRouter();
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // FIX: Removed problematic client-side redirect
    // Let Clerk middleware handle authentication
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchGigs();
        } else if (isLoaded && !isSignedIn) {
            setLoading(false);
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
            <div className={styles.loadingContainer}>
                <h2 className="step-title">Loading...</h2>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.pageHeader}>
                <h1 className={`main-title ${styles.pageTitle}`}>
                    MY GIGS
                </h1>

                <div className={styles.buttonGroup}>
                    <Link href="/gigfinder/add-event" className={`btn-primary ${styles.buttonLink}`}>
                        + NEW GIG
                    </Link>
                    <Link href="/gigfinder" className={`btn-back ${styles.buttonLink}`}>
                        ← FIND GIGS
                    </Link>
                </div>
            </header>

            <main className={`container ${styles.mainContainer}`}>

                {error && <div className={styles.errorMessage}>{error}</div>}

                {gigs.length === 0 && !error ? (
                    <div className={styles.emptyState}>
                        <h2 className={styles.emptyStateTitle}>It's Quiet Here...</h2>
                        <p className={styles.emptyStateText}>You haven't added any gigs yet.</p>
                        <Link href="/gigfinder/add-event" className={`btn-primary ${styles.emptyStateLink}`}>
                            START PROMOTING
                        </Link>
                    </div>
                ) : (
                    <div className={styles.gigList}>
                        {gigs.map(gig => (
                            <div key={gig.id} className={styles.gigCard}>
                                <div className={styles.gigCardHeader}>
                                    <div>
                                        <h3 className={styles.gigCardTitle}>
                                            {gig.name}
                                        </h3>
                                        <div className={styles.gigCardMeta}>
                                            {new Date(gig.date).toLocaleDateString()} @ {gig.venue}
                                        </div>
                                    </div>
                                    <div className={styles.gigCardBadge}>
                                        {gig.genre || 'Gig'}
                                    </div>
                                </div>

                                <div className={styles.gigActions}>
                                    <Link href={`/gigfinder/edit/${gig.id}`} className={`btn-back ${styles.editButton}`}>
                                        EDIT
                                    </Link>

                                    {gig.is_internal_ticketing && (
                                        <Link href={`/gigfinder/my-gigs/guestlist/${gig.id}`} className={`btn-back ${styles.guestListButton}`}>
                                            GUEST LIST
                                        </Link>
                                    )}

                                    <button
                                        onClick={() => handleDelete(gig.id)}
                                        className={`btn-back ${styles.deleteButton}`}
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
