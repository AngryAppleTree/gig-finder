'use client';

import React, { useEffect, useState } from 'react';
import { GigCard } from './GigCard';
import { Gig } from './types';

export function ResultsList() {
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        const handleResults = (event: CustomEvent<Gig[]>) => {
            console.log("React received gigs:", event.detail);
            setGigs(event.detail);
            setHasSearched(true);
        };

        const handleClear = () => {
            setGigs([]);
            setHasSearched(false);
        };

        window.addEventListener('gigfinder-results-updated', handleResults as EventListener);
        window.addEventListener('gigfinder-results-clear', handleClear as EventListener);

        return () => {
            window.removeEventListener('gigfinder-results-updated', handleResults as EventListener);
            window.removeEventListener('gigfinder-results-clear', handleClear as EventListener);
        };
    }, []);

    if (!hasSearched && gigs.length === 0) return null;

    if (hasSearched && gigs.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No gigs found matching your criteria! 🎸</h3>
                <p>Try adjusting your filters.</p>
                <div className="nav-buttons" style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button
                        className="btn-back"
                        onClick={() => typeof window !== 'undefined' && (window as any).goBack()}
                        style={{ marginRight: '1rem', padding: '10px 20px', border: '1px solid #666', background: 'transparent', color: 'white' }}
                    >
                        ← Back
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => typeof window !== 'undefined' && (window as any).resetQuiz()}
                        style={{ padding: '10px 20px', background: 'var(--color-primary)', border: 'none', color: 'white' }}
                    >
                        Start Over
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="gigs-list">
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <p><strong>Showing {gigs.length} gigs</strong></p>
            </div>

            {gigs.map(gig => (
                <GigCard key={gig.id} gig={gig} />
            ))}

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
        </div>
    );
}
