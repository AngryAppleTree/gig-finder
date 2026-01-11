import Link from 'next/link';
import styles from './GigAdded.module.css';

export default function GigAddedPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={`main-title ${styles.mainTitle}`}>
                    GIG<br />FINDER
                </h1>
            </header>

            <main className={styles.main}>
                <div className={styles.successCard}>
                    <div className={styles.icon} role="img" aria-label="Rock On">
                        🤘
                    </div>

                    <h2 className={styles.title}>
                        NICE ONE!
                    </h2>

                    <p className={styles.message}>
                        Your gig has been added to the database.<br />
                        It's now live for everyone to find.
                    </p>

                    <div className={styles.buttonContainer}>
                        <Link
                            href="/gigfinder/add-event"
                            className={`btn-primary ${styles.addAnotherButton}`}
                        >
                            ADD ANOTHER GIG +
                        </Link>

                        <Link
                            href="/gigfinder"
                            className={`btn-back ${styles.backButton}`}
                        >
                            ← Back to Finder
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
