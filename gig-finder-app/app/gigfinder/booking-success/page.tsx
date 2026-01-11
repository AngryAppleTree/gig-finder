'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './BookingSuccess.module.css';

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
            <div className={styles.loadingContainer}>
                <div className={styles.loadingContent}>
                    <h2 className={styles.loadingTitle}>Processing...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={`main-title ${styles.mainTitle}`}>
                    GIG<br />FINDER
                </h1>
            </header>

            <main className={styles.main}>
                <div className={styles.successCard}>
                    <div className={styles.icon}>🎉</div>

                    <h2 className={styles.title}>
                        PAYMENT SUCCESSFUL!
                    </h2>

                    <p className={styles.message}>
                        Your tickets have been confirmed and sent to your email.
                    </p>

                    <div className={styles.infoBox}>
                        <p className={styles.infoTitle}>
                            📧 Check your inbox for:
                        </p>
                        <ul className={styles.infoList}>
                            <li>✅ Payment receipt</li>
                            <li>✅ Event details</li>
                            <li>✅ QR code for entry</li>
                        </ul>
                    </div>

                    <Link
                        href="/gigfinder"
                        className={`btn-primary ${styles.backButton}`}
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
            <div className={styles.loadingContainer}>
                <div className={styles.loadingContent}>
                    <h2 className={styles.loadingTitle}>Loading...</h2>
                </div>
            </div>
        }>
            <BookingSuccessContent />
        </Suspense>
    );
}
