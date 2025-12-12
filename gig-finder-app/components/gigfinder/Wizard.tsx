'use client';

import React, { useState, useEffect } from 'react';
import { QuickSearch } from './QuickSearch';
import { ResultsList } from './ResultsList';
import { postcodeCoordinates, venueLocations } from './constants';
import { calculateDistance } from './utils';
import { Gig } from './types';
import { generateFallbackGigs } from './mockDataGen';
import Script from 'next/script'; // For booking modal legacy logic if needed, but we try to avoid.

interface WizardChoices {
    when: string | null;
    customDate: string | null;
    flexible: boolean;
    where: string | null;
    postcode: string | null;
    venueSize: string | null;
    vibe: string | null;
    budget: string | null;
}

const initialChoices: WizardChoices = {
    when: null,
    customDate: null,
    flexible: false,
    where: null,
    postcode: null,
    venueSize: null,
    vibe: null,
    budget: null
};

interface WizardProps {
    isAdmin?: boolean;
}

export function Wizard({ isAdmin }: WizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [choices, setChoices] = useState<WizardChoices>(initialChoices);
    const [showResults, setShowResults] = useState(false);
    const [isRejection, setIsRejection] = useState(false);

    // Legacy style reset
    useEffect(() => {
        // Expose resetQuiz global for compatibility if needed or internal links
        (window as any).resetQuiz = resetQuiz;
        (window as any).goBack = goBack;
        return () => {
            delete (window as any).resetQuiz;
            delete (window as any).goBack;
        };
    }, []);

    const nextStep = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentStep(prev => prev + 1);
    };

    const goBack = () => {
        if (showResults) {
            setShowResults(false);
            setCurrentStep(5); // Back to budget
            window.dispatchEvent(new CustomEvent('gigfinder-results-clear'));
        } else if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const resetQuiz = () => {
        setChoices(initialChoices);
        setShowResults(false);
        setIsRejection(false);
        setCurrentStep(1);
        window.dispatchEvent(new CustomEvent('gigfinder-results-clear'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Step 1 Handlers
    const handleWhen = (value: string) => {
        setChoices(prev => ({ ...prev, when: value }));
        if (value !== 'custom') {
            nextStep();
        }
    };
    const handleDateChange = (date: string) => {
        setChoices(prev => ({ ...prev, customDate: date }));
        // Auto advance after short delay like legacy?
        // For now let user click standard nav or implicit (legacy had implicit)
        if (date) {
            setTimeout(nextStep, 500);
        }
    };

    // Step 2 Handlers
    const handleLocation = (value: string) => {
        setChoices(prev => ({ ...prev, where: value }));
        if (value === 'local' || value === '100miles') {
            // Show postcode logic
        } else {
            nextStep();
        }
    };
    const handlePostcode = (value: string) => {
        setChoices(prev => ({ ...prev, postcode: value.toUpperCase() }));
    };
    const submitPostcode = () => {
        if (choices.postcode && choices.postcode.length >= 2) {
            nextStep();
        } else {
            alert('Please enter at least the first part of your postcode (e.g., EH1)');
        }
    };

    // Step 3 Handlers
    const handleSize = (value: string) => {
        setChoices(prev => ({ ...prev, venueSize: value }));
        if (value === 'huge') {
            setIsRejection(true);
            // Legacy handled rejection differently, here we can show a specific "No results" or rejection screen
            // Legacy: showRejectionScreen(). 
            // I'll implement a Rejection View.
        } else {
            // Legacy Logic: If size selected, SKIP Step 4 (Vibe) and go to Step 5 (Budget)?
            // Line 151 of script-api.js: "Skip Step 4 ... vibe = 'surprise'".
            setChoices(prev => ({ ...prev, vibe: 'surprise' }));
            setCurrentStep(5); // Skip step 4
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Step 4 Handlers
    const handleVibe = (value: string) => {
        setChoices(prev => ({ ...prev, vibe: value }));
        nextStep();
    };

    // Step 5 Handlers -> Search
    const handleBudget = async (value: string) => {
        const finalChoices = { ...choices, budget: value };
        setChoices(finalChoices);

        // Trigger Search
        await performWizardSearch(finalChoices);
    };

    const performWizardSearch = async (userChoices: WizardChoices) => {
        // Mocking the Filter Logic from Legacy Script (or porting it)
        try {
            // Fetch All Gigs (Mock or Real)
            // Legacy fetches /api/events?location=... based on postcode.
            let location = 'Edinburgh';
            if (userChoices.postcode?.startsWith('G')) location = 'Glasgow';

            const response = await fetch(`/api/events?location=${location}`);
            const data = await response.json();

            let rawEvents = data.events;
            if (!rawEvents || rawEvents.length < 5) {
                // Fallback if API empty or insufficient for demo
                const mockGigs = generateFallbackGigs();
                // Merge or replace? Legacy replaced.
                if (!rawEvents || rawEvents.length === 0) {
                    rawEvents = mockGigs;
                } else {
                    rawEvents = [...rawEvents, ...mockGigs];
                }
            }

            if (rawEvents) {
                let skiddleGigs: Gig[] = rawEvents.map((e: any) => ({
                    id: e.id,
                    name: e.name || e.eventname,
                    venue: e.venue.name || e.venue,
                    location: e.venue.name || e.location,
                    town: e.venue.town || e.town,
                    date: typeof e.date === 'string' ? e.date : new Date(e.dateObj).toLocaleDateString(),
                    time: e.time || 'TBA',
                    dateObj: e.dateObj,
                    description: e.description,
                    imageUrl: e.imageUrl || e.imageurl,
                    ticketUrl: e.ticketUrl || e.link,
                    isInternalTicketing: e.isInternalTicketing,
                    price: e.price || e.entryprice,
                    vibe: e.vibe, // Mock data has this
                    capacity: e.capacity, // Mock data has this
                    distance: e.distance
                }));

                // Logic: Filter by Distance
                // Need User Coords
                let userCoords = null;
                if (userChoices.postcode) {
                    // Check exact match or default
                    const shortPC = userChoices.postcode.split(' ')[0]; // E.g. EH1
                    userCoords = postcodeCoordinates[shortPC] || postcodeCoordinates['DEFAULT'];
                }

                if (userCoords) {
                    skiddleGigs = skiddleGigs.map(g => {
                        // Find venue coords
                        // Legacy uses hardcoded venueLocations. 
                        // Check constants.
                        const venueData = venueLocations[g.venue]; // Match by name
                        if (venueData) {
                            const dist = calculateDistance(userCoords!.lat, userCoords!.lon, venueData.lat, venueData.lon);
                            return { ...g, distance: dist };
                        }
                        return g;
                    });

                    if (userChoices.where === 'local') {
                        skiddleGigs = skiddleGigs.filter(g => g.distance !== undefined && g.distance <= 10);
                    } else if (userChoices.where === '100miles') {
                        skiddleGigs = skiddleGigs.filter(g => g.distance !== undefined && g.distance <= 100);
                    }
                }

                // Filter by Venue Size
                if (userChoices.venueSize && userChoices.venueSize !== 'any') {
                    skiddleGigs = skiddleGigs.filter(gig => {
                        if (!gig.capacity) return true; // Keep unknown
                        if (userChoices.venueSize === 'small') return gig.capacity <= 100;
                        if (userChoices.venueSize === 'medium') return gig.capacity > 100 && gig.capacity <= 5000;
                        if (userChoices.venueSize === 'huge') return gig.capacity > 5000;
                        return true;
                    });
                }

                // Filter by Vibe (Genre)
                if (userChoices.vibe && userChoices.vibe !== 'surprise') {
                    skiddleGigs = skiddleGigs.filter(gig => {
                        if (!gig.vibe) return true; // Keep unknown (Real gigs might not have vibe tagged yet)
                        return gig.vibe === userChoices.vibe;
                    });
                }

                // Filter by Budget
                if (userChoices.budget && userChoices.budget !== 'any') {
                    skiddleGigs = skiddleGigs.filter(gig => {
                        if (gig.priceVal === undefined) return true; // Keep unknown prices
                        if (userChoices.budget === 'free') return gig.priceVal === 0;
                        if (userChoices.budget === 'low') return gig.priceVal > 0 && gig.priceVal <= 20;
                        if (userChoices.budget === 'mid') return gig.priceVal > 20 && gig.priceVal <= 50;
                        if (userChoices.budget === 'high') return gig.priceVal > 50;
                        return true;
                    });
                }


                // Dispatch
                window.dispatchEvent(new CustomEvent('gigfinder-results-updated', { detail: skiddleGigs }));
                setShowResults(true);
                setCurrentStep(6); // Results
                window.scrollTo({ top: 0, behavior: 'smooth' });

            }
        } catch (e) {
            console.error("Wizard Search Failed", e);
        }
    };


    if (isRejection) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <h2 className="step-title">🚫 Too Big!</h2>
                <p className="step-description">We focus on grassroots gigs. Huge stadiums aren't our vibe.</p>
                <button className="btn-primary" onClick={resetQuiz}>Try Again</button>
            </div>
        );
    }

    if (showResults) {
        return (
            <section className="step active" id="r-results">
                <h2 className="step-title" id="results-title">Your Gigs</h2>
                <ResultsList />
            </section>
        );
    }

    // Render Steps
    return (
        <>
            <h1 className="main-title">GIG<br />FINDER</h1>
            <main id="main-content" className="container" role="main">
                {/* Progress Bar */}
                <nav aria-label="Progress" className="progress-bar" role="navigation">
                    <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`} data-step="1">1</div>
                    <div className="progress-line" aria-hidden="true"></div>
                    <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`} data-step="2">2</div>
                    <div className="progress-line" aria-hidden="true"></div>
                    <div className={`progress-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`} data-step="3">3</div>
                    <div className="progress-line" aria-hidden="true"></div>
                    <div className={`progress-step ${currentStep >= 4 ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`} data-step="5">4</div>
                </nav>

                {/* Step 1 */}
                {currentStep === 1 && (
                    <section className="step active" id="r-step1">

                        <div id="quick-search-mount">
                            <QuickSearch onSearch={() => setShowResults(true)} />
                        </div>

                        <div style={{ textAlign: 'center', position: 'relative', marginBottom: '2rem' }}>
                            <hr style={{ border: 0, borderTop: '1px solid #333' }} />
                            <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-bg)', padding: '0 10px', color: '#666', fontSize: '0.9rem', fontFamily: 'var(--font-primary)' }}>OR TAKE THE JOURNEY</span>
                        </div>

                        <h2 className="step-title" id="step1-title">When do you want to go?</h2>
                        <div className="options-grid">
                            <button className="option-btn" onClick={() => handleWhen('tonight')}>
                                <span className="option-icon">🔥</span>
                                <span className="option-text">Tonight</span>
                            </button>
                            <button className="option-btn" onClick={() => handleWhen('weekend')}>
                                <span className="option-icon">💥</span>
                                <span className="option-text">This Weekend</span>
                            </button>
                            <button className="option-btn" onClick={() => handleWhen('week')}>
                                <span className="option-icon">⚡</span>
                                <span className="option-text">This Week</span>
                            </button>
                            <button className="option-btn" onClick={() => setChoices(p => ({ ...p, when: 'custom' }))}>
                                <span className="option-icon">🎯</span>
                                <span className="option-text">Pick a Date</span>
                            </button>
                            <button className="option-btn" onClick={() => handleWhen('dontknow')}>
                                <span className="option-icon">🎲</span>
                                <span className="option-text">I Don't Know</span>
                            </button>
                        </div>

                        {choices.when === 'custom' && (
                            <div className="date-picker center-content" id="datePicker" style={{ marginTop: '1rem' }}>
                                <input type="date" className="date-input" onChange={(e) => handleDateChange(e.target.value)} />
                                <label className="checkbox-label" style={{ display: 'block', marginTop: '0.5rem' }}>
                                    <input type="checkbox" onChange={(e) => setChoices(p => ({ ...p, flexible: e.target.checked }))} />
                                    <span style={{ marginLeft: '10px' }}>I am flexible with the date</span>
                                </label>
                            </div>
                        )}

                        <div style={{ marginTop: '3rem', textAlign: 'center', borderTop: '2px dashed #333', paddingTop: '1.5rem' }}>
                            <p style={{ fontFamily: 'var(--font-primary)', fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--color-text)' }}>PROMISING A GOOD NIGHT?</p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <a href="/gigfinder/add-event" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', fontSize: '1rem', padding: '0.8rem 1.5rem' }}>ADD YOUR GIG +</a>
                                <a href="/gigfinder/my-gigs" className="btn-back" style={{ display: 'inline-block', textDecoration: 'none', fontSize: '1rem', padding: '0.8rem 1.5rem' }}>MY GIGS</a>
                                {isAdmin && (
                                    <a href="/admin" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', fontSize: '1rem', padding: '0.8rem 1.5rem', background: '#333', border: '1px solid #666' }}>ADMIN CONSOLE</a>
                                )}
                            </div>
                        </div>

                    </section>
                )}

                {/* Step 2 */}
                {currentStep === 2 && (
                    <section className="step active" id="r-step2">
                        <h2 className="step-title">How far will you travel?</h2>
                        <div className="options-grid" style={{ marginBottom: 'var(--spacing-md)' }}>
                            <button className="option-btn" onClick={() => handleLocation('local')}>
                                <span className="option-icon">🎯</span>
                                <span className="option-text">Locally</span>
                            </button>
                            <button className="option-btn" onClick={() => handleLocation('100miles')}>
                                <span className="option-icon">🛣️</span>
                                <span className="option-text">Within 100 Miles</span>
                            </button>
                        </div>

                        {(choices.where === 'local' || choices.where === '100miles') && (
                            <div className="postcode-input" id="postcodeInput">
                                <label htmlFor="postcode">Enter your postcode (first half):</label>
                                <input
                                    type="text"
                                    id="postcode"
                                    placeholder="e.g. EH1"
                                    className="text-input"
                                    value={choices.postcode || ''}
                                    onChange={(e) => handlePostcode(e.target.value)}
                                    // Handle Enter Key
                                    onKeyDown={(e) => e.key === 'Enter' && submitPostcode()}
                                />
                                <button className="btn-primary" onClick={submitPostcode} style={{ marginTop: '1rem' }}>Next →</button>
                            </div>
                        )}
                        <div className="nav-buttons">
                            <button className="btn-back" onClick={goBack}>← Back</button>
                        </div>
                    </section>
                )}

                {/* Step 3 */}
                {currentStep === 3 && (
                    <section className="step active" id="r-step3">
                        <h2 className="step-title">What venue size?</h2>
                        <div className="options-grid">
                            <button className="option-btn" onClick={() => handleSize('small')}>
                                <span className="option-icon">🕯️</span>
                                <span className="option-text">Small & Cosy<br /><span style={{ fontSize: '0.8rem' }}>(Up to 100)</span></span>
                            </button>
                            <button className="option-btn" onClick={() => handleSize('medium')}>
                                <span className="option-icon">🏢</span>
                                <span className="option-text">Quite Big<br /><span style={{ fontSize: '0.8rem' }}>(100 - 5,000)</span></span>
                            </button>
                            <button className="option-btn" onClick={() => handleSize('huge')}>
                                <span className="option-icon">👑</span>
                                <span className="option-text">Proper Huge<br /><span style={{ fontSize: '0.8rem' }}>(Over 5,000)</span></span>
                            </button>
                            <button className="option-btn" onClick={() => handleSize('any')}>
                                <span className="option-icon">🎪</span>
                                <span className="option-text">Any Size</span>
                            </button>
                        </div>
                        <div className="nav-buttons">
                            <button className="btn-back" onClick={goBack}>← Back</button>
                        </div>
                    </section>
                )}

                {/* Step 4 */}
                {currentStep === 4 && (
                    <section className="step active" id="r-step4">
                        <h2 className="step-title">What's your sound?</h2>
                        <div className="options-grid">
                            <button className="option-btn" onClick={() => handleVibe('rock_blues_punk')}>
                                <span className="option-icon">🎸</span>
                                <span className="option-text">Rock'n'roll, Blues & Punk</span>
                            </button>
                            <button className="option-btn" onClick={() => handleVibe('indie_alt')}>
                                <span className="option-icon">🎹</span>
                                <span className="option-text">Indie & Alternative</span>
                            </button>
                            <button className="option-btn" onClick={() => handleVibe('metal')}>
                                <span className="option-icon">🤘</span>
                                <span className="option-text">Hard Rock & Metal</span>
                            </button>
                            <button className="option-btn" onClick={() => handleVibe('pop')}>
                                <span className="option-icon">🎤</span>
                                <span className="option-text">Pop & Charts</span>
                            </button>
                            <button className="option-btn" onClick={() => handleVibe('electronic')}>
                                <span className="option-icon">🎧</span>
                                <span className="option-text">Electronic & Dance</span>
                            </button>
                            <button className="option-btn" onClick={() => handleVibe('hiphop')}>
                                <span className="option-icon">🔥</span>
                                <span className="option-text">Hip Hop & R&B</span>
                            </button>
                            <button className="option-btn" onClick={() => handleVibe('acoustic')}>
                                <span className="option-icon">🎻</span>
                                <span className="option-text">Acoustic, Folk, Jazz...</span>
                            </button>
                            <button className="option-btn" onClick={() => handleVibe('classical')}>
                                <span className="option-icon">🎼</span>
                                <span className="option-text">Classical & Orchestra</span>
                            </button>
                            <button className="option-btn" onClick={() => handleVibe('surprise')}>
                                <span className="option-icon">🎰</span>
                                <span className="option-text">Surprise Me!</span>
                            </button>
                        </div>
                        <div className="nav-buttons">
                            <button className="btn-back" onClick={goBack}>← Back</button>
                        </div>
                    </section>
                )}

                {/* Step 5 */}
                {currentStep === 5 && (
                    <section className="step active" id="r-step5">
                        <h2 className="step-title">What's your budget?</h2>
                        <div className="options-grid">
                            <button className="option-btn" onClick={() => handleBudget('free')}>
                                <span className="option-icon">🤘</span>
                                <span className="option-text">Free - £10</span>
                            </button>
                            <button className="option-btn" onClick={() => handleBudget('low')}>
                                <span className="option-icon">💸</span>
                                <span className="option-text">£10 - £20</span>
                            </button>
                            <button className="option-btn" onClick={() => handleBudget('mid')}>
                                <span className="option-icon">💰</span>
                                <span className="option-text">£20 - £50</span>
                            </button>
                            <button className="option-btn" onClick={() => handleBudget('high')}>
                                <span className="option-icon">💎</span>
                                <span className="option-text">£50+</span>
                            </button>
                            <button className="option-btn" onClick={() => handleBudget('any')}>
                                <span className="option-icon">🎟️</span>
                                <span className="option-text">Any Price</span>
                            </button>
                        </div>
                        <div className="nav-buttons">
                            <button className="btn-back" onClick={goBack}>← Back</button>
                        </div>
                    </section>
                )}

            </main>
        </>
    );
}
