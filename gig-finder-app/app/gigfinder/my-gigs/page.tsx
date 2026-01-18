'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, ApiError, type Event } from '@/lib';
import styles from './my-gigs.module.css';

export default function MyGigsPage() {
    const { isLoaded, isSignedIn, user } = useUser();
    const router = useRouter();
    const [gigs, setGigs] = useState<Event[]>([]);
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
            const data = await api.events.getUserEvents();
            setGigs(data.events || []);
        } catch (err) {
            console.error(err);
            if (err instanceof ApiError) {
                setError(err.getUserMessage());
            } else {
                setError('Could not load your gigs. Try refreshing?');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this gig? This cannot be undone.')) return;

        try {
            await api.events.deleteUserEvent(id);
            // Remove from local state
            setGigs(prev => prev.filter(g => g.id !== id));
        } catch (err) {
            console.error(err);
            if (err instanceof ApiError) {
                alert(`Failed to delete gig: ${err.getUserMessage()}`);
            } else {
                alert('Error deleting gig.');
            }
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

                                    {gig.isInternalTicketing && (
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
