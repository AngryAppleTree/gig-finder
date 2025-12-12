'use client';

import React, { useEffect, useState, useRef } from 'react';
import { GigCard } from './GigCard';
import { Gig } from './types';

export function ResultsList() {
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Scroll Snap Support
    const scrollRef = useRef<HTMLDivElement>(null);
    const [snapIndex, setSnapIndex] = useState(0);

    useEffect(() => {
        const checkMobile = () => {
            // Use 768px breakpoint
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const handleResults = (event: CustomEvent<Gig[]>) => {
            console.log("React received gigs:", event.detail);
            setGigs(event.detail);
            setHasSearched(true);
            setSnapIndex(0);
            if (scrollRef.current) scrollRef.current.scrollLeft = 0;
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

    // Handle Scroll Spy for Dots
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const scrollCenter = container.scrollLeft + container.clientWidth / 2;

        // Find center-most slide
        // Assuming simple item width logic:
        // Or simpler: index = Math.round(scrollLeft / itemWidth).
        // Since we use logic: 80vw width + gap.
        // Let's rely on scroll event throttling if performance bad, but React 18 is usually fine.

        const cardWidth = container.querySelector('div')?.clientWidth || 0;
        if (cardWidth === 0) return;

        const newIndex = Math.round(container.scrollLeft / (cardWidth + 16)); // 16px gap
        if (newIndex !== snapIndex && newIndex >= 0 && newIndex < gigs.length) {
            setSnapIndex(newIndex);
        }
    };

    const scrollToSlide = (index: number) => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const card = container.children[index] as HTMLElement;
        if (card) {
            // Scroll center align
            const containerCenter = container.clientWidth / 2;
            const cardCenter = card.offsetLeft + card.clientWidth / 2;
            container.scrollTo({
                left: cardCenter - containerCenter,
                behavior: 'smooth'
            });
        }
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
                    <p><strong>Showing {snapIndex + 1} of {gigs.length} gigs</strong></p>
                </div>

                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="scroller-snap"
                    style={{
                        display: 'flex',
                        overflowX: 'auto',
                        scrollSnapType: 'x mandatory',
                        gap: '16px',
                        padding: '0 5vw', // Side padding creates center look
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    {gigs.map(gig => (
                        <div key={gig.id} style={{
                            minWidth: '85vw',  // 85% width creates Peeking effect ("2/3" feel)
                            scrollSnapAlign: 'center',
                            flexShrink: 0
                        }}>
                            <GigCard gig={gig} />
                        </div>
                    ))}
                </div>
                {/* Hide Scrollbars CSS Hack */}
                <style jsx>{`
                    .scroller-snap::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>

                {/* Dots */}
                {gigs.length > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px', gap: '8px' }}>
                        {gigs.map((_, i) => (
                            <div
                                key={i}
                                onClick={() => scrollToSlide(i)}
                                style={{
                                    width: '10px', height: '10px', borderRadius: '50%',
                                    background: i === snapIndex ? 'var(--color-primary)' : '#555',
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
