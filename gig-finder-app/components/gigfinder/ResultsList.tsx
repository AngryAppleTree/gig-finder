'use client';

import React from 'react';
import { GigCard } from './GigCard';
import { Gig } from './types';
import styles from './ResultsList.module.css';

interface ResultsListProps {
    gigs: Gig[];
    onBack?: () => void;
    onStartOver?: () => void;
}

export function ResultsList({ gigs, onBack, onStartOver }: ResultsListProps) {
    const hasSearched = true; // If mounted, we assume search happened

    if (!hasSearched && gigs.length === 0) return null;

    if (hasSearched && gigs.length === 0) {
        return (
            <div className={styles.emptyState}>
                <h3 className={styles.emptyStateHeading}>No gigs found matching your criteria! 🎸</h3>
                <p>Try adjusting your filters.</p>
                {renderNavButtons()}
            </div>
        );
    }

    function renderNavButtons() {
        return (
            <div className={`nav-buttons ${styles.navButtons}`}>
                <button
                    className={`btn-back ${styles.backButton}`}
                    onClick={onBack}
                >
                    ← Back
                </button>
                <button
                    className={`btn-primary ${styles.primaryButton}`}
                    onClick={onStartOver}
                >
                    Start Over
                </button>
            </div>
        );
    }

    // Standard Vertical Scroll List (Desktop & Mobile)
    return (
        <div className={`gigs-list ${styles.container}`}>
            <div className={styles.summary}>
                <p><strong>Showing {gigs.length} gigs</strong></p>
            </div>

            {gigs.map(gig => (
                <GigCard key={gig.id} gig={gig} />
            ))}

            {renderNavButtons()}
        </div>
    );
}
