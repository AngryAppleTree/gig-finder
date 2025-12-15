'use client';

import React, { useEffect, useState } from 'react';
import { GigCard } from './GigCard';
import { Gig } from './types';

interface ResultsListProps {
    gigs: Gig[];
}

export function ResultsList({ gigs }: ResultsListProps) {
    const hasSearched = true; // If mounted, we assume search happened


    if (!hasSearched && gigs.length === 0) return null;

    if (hasSearched && gigs.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No gigs found matching your criteria! 🎸</h3>
                <p>Try adjusting your filters.</p>
                {renderNavButtons()}
            </div>
        );
    }

    function renderNavButtons() {
        return (
            <div className="nav-buttons" style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button
                    className="btn-back"
                    onClick={() => typeof window !== 'undefined' && (window as any).goBack()}
                    style={{ padding: '10px 20px', border: '1px solid #666', background: 'transparent', color: 'white', cursor: 'pointer' }}
                >
                    ← Back
                </button>
                <button
                    className="btn-primary"
                    onClick={() => typeof window !== 'undefined' && (window as any).resetQuiz()}
                    style={{ padding: '10px 20px', background: 'var(--color-primary)', border: 'none', color: 'white', cursor: 'pointer' }}
                >
                    Start Over
                </button>
            </div>
        );
    }

    // Standard Vertical Scroll List (Desktop & Mobile)
    return (
        <div className="gigs-list" style={{ display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <p><strong>Showing {gigs.length} gigs</strong></p>
            </div>

            {gigs.map(gig => (
                <GigCard key={gig.id} gig={gig} />
            ))}

            {renderNavButtons()}
        </div>
    );
}
