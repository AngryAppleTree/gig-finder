'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuickSearch } from './QuickSearch';
import Script from 'next/script';

interface WizardChoices {
    when: string | null;
    customDate: string | null;
    flexible: boolean;
    where: string | null;
    postcode: string | null;
    venueSize: string | null;
    budget: string | null;
}

const initialChoices: WizardChoices = {
    when: null,
    customDate: null,
    flexible: false,
    where: null,
    postcode: null,
    venueSize: null,
    budget: null
};

interface WizardProps {
    isAdmin?: boolean;
}

export function Wizard({ isAdmin }: WizardProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [choices, setChoices] = useState<WizardChoices>(initialChoices);
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
        setCurrentStep(prev => prev + 1);
        // Scroll after React renders the new step
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
    };

    const goBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 50);
        }
    };

    const resetQuiz = () => {
        setChoices(initialChoices);
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
            // Show postcode input and scroll to it
            setTimeout(() => {
                const postcodeInput = document.getElementById('postcodeInput');
                if (postcodeInput) {
                    postcodeInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
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
            // Go directly to budget (step 4)
            setCurrentStep(4);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Step 4 Handlers (Budget) -> Search
    const handleBudget = async (value: string) => {
        const finalChoices = { ...choices, budget: value };
        setChoices(finalChoices);

        // Trigger Search
        await performWizardSearch(finalChoices);
    };

    const performWizardSearch = async (userChoices: WizardChoices) => {
        // Build URL search parameters for the results page
        const params = new URLSearchParams();

        // Determine location
        let location = 'Edinburgh';
        if (userChoices.postcode?.startsWith('G')) location = 'Glasgow';
        params.append('location', location);

        // Add wizard choices as URL params
        if (userChoices.when) params.append('when', userChoices.when);
        if (userChoices.customDate) params.append('minDate', userChoices.customDate);
        if (userChoices.postcode) params.append('postcode', userChoices.postcode);
        if (userChoices.where) params.append('distance', userChoices.where);
        if (userChoices.venueSize) params.append('venueSize', userChoices.venueSize);
        if (userChoices.budget) params.append('budget', userChoices.budget);

        // Navigate to results page
        router.push(`/gigfinder/results?${params.toString()}`);
    };


    // ============================================================================
    // 🔒 LOCKED: DO NOT MODIFY THIS SECTION
    // This humorous rejection screen is a core part of the GigFinder brand identity.
    // The messaging, tone, and behavior are intentionally designed and should not be changed.
    // ============================================================================
    if (isRejection) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <h1 style={{ fontFamily: 'var(--font-primary)', fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>GET TAE FUCK</h1>
                <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>We only do small gigs!</h2>
                <h3 style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '2rem' }}>We prefer sweaty, smelly cellars.</h3>
                <button className="btn-primary" onClick={resetQuiz}>Try Again</button>
            </div>
        );
    }
    // ============================================================================

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
                            <QuickSearch />
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

                {/* Step 4 - Budget (was step 5) */}
                {currentStep === 4 && (
                    <section className="step active" id="r-step4">
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
