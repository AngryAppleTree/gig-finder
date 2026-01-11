'use client';

import Link from 'next/link';
import styles from './BookingCancelled.module.css';

export default function BookingCancelledPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={`main-title ${styles.mainTitle}`}>
                    GIG<br />FINDER
                </h1>
            </header>

            <main className={styles.main}>
                <div className={styles.cancelledCard}>
                    <div className={styles.icon}>😕</div>

                    <h2 className={styles.title}>
                        BOOKING CANCELLED
                    </h2>

                    <p className={styles.message}>
                        Your payment was cancelled. No charges were made.
                    </p>

                    <div className={styles.infoBox}>
                        <p className={styles.infoText}>
                            The tickets are still available if you'd like to try again.
                        </p>
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
