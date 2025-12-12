'use client';

import React, { useEffect, useState } from 'react';
import { GigCard } from './GigCard';
import { Gig } from './types';

export function ResultsList() {
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        const handleResults = (event: CustomEvent<Gig[]>) => {
            console.log("React received gigs:", event.detail);
            setGigs(event.detail);
            setHasSearched(true);
            setCurrentIndex(0);
        };

        const handleClear = () => {
            setGigs([]);
            setHasSearched(false);
        };

        window.addEventListener('gigfinder-results-updated', handleResults as EventListener);
        window.addEventListener('gigfinder-results-clear', handleClear as EventListener);

        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('gigfinder-results-updated', handleResults as EventListener);
            window.removeEventListener('gigfinder-results-clear', handleClear as EventListener);
        };
    }, []);

    const nextSlide = () => {
        setCurrentIndex(prev => (prev === gigs.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex(prev => (prev === 0 ? gigs.length - 1 : prev - 1));
    };

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

    if (isMobile) {
        return (
            <div className="mobile-results-container" style={{ maxWidth: '100%', overflow: 'hidden', paddingBottom: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <p><strong>Showing {currentIndex + 1} of {gigs.length} gigs</strong></p>
                </div>

                <div className="carousel-container" style={{ position: 'relative' }}>
                    <div style={{
                        display: 'flex',
                        transition: 'transform 0.3s ease-out',
                        transform: `translateX(-${currentIndex * 100}%)`
                    }}>
                        {gigs.map(gig => (
                            <div key={gig.id} style={{
                                minWidth: '100%',
                                padding: '0 15%', // Increased padding to effectively shrink the card width (2/3 look)
                                boxSizing: 'border-box',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                <div style={{ width: '100%', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                                    {/* Wrapper to contain card visuals */}
                                    <GigCard gig={gig} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Controls */}
                    {gigs.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                style={{
                                    position: 'absolute', top: '50%', left: '0', transform: 'translateY(-50%)',
                                    background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none',
                                    borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', cursor: 'pointer',
                                    zIndex: 10
                                }}
                            >
                                ←
                            </button>
                            <button
                                onClick={nextSlide}
                                style={{
                                    position: 'absolute', top: '50%', right: '0', transform: 'translateY(-50%)',
                                    background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none',
                                    borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', cursor: 'pointer',
                                    zIndex: 10
                                }}
                            >
                                →
                            </button>
                        </>
                    )}
                </div>

                {/* Dots */}
                {gigs.length > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px', gap: '8px' }}>
                        {gigs.map((_, i) => (
                            <div
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                style={{
                                    width: '10px', height: '10px', borderRadius: '50%',
                                    background: i === currentIndex ? 'var(--color-primary)' : '#555',
                                    cursor: 'pointer', transition: 'background 0.3s'
                                }}
                            />
                        ))}
                    </div>
                )}

                {renderNavButtons()}
            </div>
        );
    }

    // Desktop
    return (
        <div className="gigs-list">
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
