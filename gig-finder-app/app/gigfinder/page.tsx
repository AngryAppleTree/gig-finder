import Script from 'next/script';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'GigFinder - Find Your Next Gig',
    description: 'Find live music gigs in your area. Search by location, genre, date, and budget. Discover mainstream, alternative, and new talent across the UK.',
};

export const viewport: Viewport = {
    themeColor: '#ff3366',
};

export default function GigFinderPage() {
    return (
        <>
            {/* Styles loaded in layout.tsx */}

            <div dangerouslySetInnerHTML={{ __html: gigFinderHTML }} />

            <Script src="/gigfinder/script-api.js?v=5" strategy="afterInteractive" />
        </>
    );
}

const gigFinderHTML = `
    <h1 class="main-title">GIG<br>FINDER</h1>
    <main id="main-content" class="container" role="main">

        <!-- Progress Bar -->
        <nav aria-label="Progress" class="progress-bar" role="navigation">
            <div class="progress-step active" data-step="1" aria-current="step" aria-label="Step 1 of 5">1</div>
            <div class="progress-line" aria-hidden="true"></div>
            <div class="progress-step" data-step="2" aria-label="Step 2 of 5">2</div>
            <div class="progress-line" aria-hidden="true"></div>
            <div class="progress-step" data-step="3" aria-label="Step 3 of 5">3</div>
            <div class="progress-line" aria-hidden="true"></div>
            <div class="progress-step" data-step="4" aria-label="Step 4 of 5">4</div>
            <div class="progress-line" aria-hidden="true"></div>
            <div class="progress-step" data-step="5" aria-label="Step 5 of 5">5</div>
        </nav>

        <!-- Step 1: When? -->
        <section class="step active" id="step1" aria-labelledby="step1-title">
            <h2 class="step-title" id="step1-title">When do you want to go?</h2>
            <div class="options-grid" role="group" aria-label="Date options">
                <button class="option-btn" data-value="tonight">
                    <span class="option-icon">🔥</span>
                    <span class="option-text">Tonight</span>
                </button>
                <button class="option-btn" data-value="weekend">
                    <span class="option-icon">💥</span>
                    <span class="option-text">This Weekend</span>
                </button>
                <button class="option-btn" data-value="week">
                    <span class="option-icon">⚡</span>
                    <span class="option-text">This Week</span>
                </button>
                <button class="option-btn" data-value="custom">
                    <span class="option-icon">🎯</span>
                    <span class="option-text">Pick a Date</span>
                </button>
                <button class="option-btn" data-value="dontknow">
                    <span class="option-icon">🎲</span>
                    <span class="option-text">I Don't Know</span>
                </button>
            </div>

            <div class="date-picker hidden" id="datePicker">
                <input type="date" id="customDate" class="date-input">
                <label class="checkbox-label">
                    <input type="checkbox" id="flexibleDate">
                    <span>I'm flexible with the date</span>
                </label>
            </div>

            <div style="margin-top: 3rem; text-align: center; border-top: 2px dashed #333; padding-top: 1.5rem;">
                <p style="font-family: var(--font-primary); font-size: 1.2rem; margin-bottom: 1rem; color: var(--color-text);">PROMISING A GOOD NIGHT?</p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <a href="/gigfinder/add-event" class="btn-primary" style="display: inline-block; text-decoration: none; font-size: 1rem; padding: 0.8rem 1.5rem;">ADD YOUR GIG +</a>
                    <a href="/gigfinder/my-gigs" class="btn-back" style="display: inline-block; text-decoration: none; font-size: 1rem; padding: 0.8rem 1.5rem;">MY GIGS</a>
                </div>
            </div>
        </section>

        <!-- Step 2: Where? -->
        <section class="step" id="step2" aria-labelledby="step2-title">
            <h2 class="step-title" id="step2-title">How far will you travel?</h2>
            <div class="options-grid" role="group" aria-label="Distance options" style="margin-bottom: var(--spacing-md);">
                <button class="option-btn" data-value="local">
                    <span class="option-icon">🎯</span>
                    <span class="option-text">Locally</span>
                </button>
                <button class="option-btn" data-value="100miles">
                    <span class="option-icon">🛣️</span>
                    <span class="option-text">Within 100 Miles</span>
                </button>
            </div>

            <div class="postcode-input hidden" id="postcodeInput">
                <label for="postcode">Enter your postcode (first half):</label>
                <input type="text" id="postcode" placeholder="e.g. EH1" class="text-input">
                <button class="btn-primary" id="postcodeNext" style="margin-top: 1rem;">Next →</button>
            </div>

            <div class="options-grid" role="group" aria-label="Wide area option">
                <button class="option-btn" data-value="uk">
                    <span class="option-icon">🗺️</span>
                    <span class="option-text">UK-Wide</span>
                </button>
            </div>

            <div class="nav-buttons">
                <button class="btn-back" onclick="goBack()">← Back</button>
            </div>
        </section>

        <!-- Step 3: Venue Size? -->
        <section class="step" id="step3" aria-labelledby="step3-title">
            <h2 class="step-title" id="step3-title">What venue size?</h2>
            <div class="options-grid" role="group" aria-label="Venue size options">
                <button class="option-btn" data-value="small">
                    <span class="option-icon">🕯️</span>
                    <span class="option-text">Small & Cosy<br><span style="font-size: 0.8rem">(Less than 100)</span></span>
                </button>
                <button class="option-btn" data-value="medium">
                    <span class="option-icon">🏢</span>
                    <span class="option-text">Quite Big<br><span style="font-size: 0.8rem">(100 - 500)</span></span>
                </button>
                <button class="option-btn" data-value="large">
                    <span class="option-icon">🏟️</span>
                    <span class="option-text">Big<br><span style="font-size: 0.8rem">(501 - 2,000)</span></span>
                </button>
                <button class="option-btn" data-value="massive">
                    <span class="option-icon">🏰</span>
                    <span class="option-text">Massive<br><span style="font-size: 0.8rem">(2,001 - 5,000)</span></span>
                </button>
                <button class="option-btn" data-value="huge">
                    <span class="option-icon">👑</span>
                    <span class="option-text">Proper Huge<br><span style="font-size: 0.8rem">(Over 5,000)</span></span>
                </button>
                <button class="option-btn" data-value="any">
                    <span class="option-icon">🎪</span>
                    <span class="option-text">Any Size</span>
                </button>
            </div>

            <div class="nav-buttons">
                <button class="btn-back" onclick="goBack()">← Back</button>
            </div>
        </section>

        <!-- Step 4: Sound? -->
        <section class="step" id="step4" aria-labelledby="step4-title">
            <h2 class="step-title" id="step4-title">What's your sound?</h2>
            <div class="options-grid" role="group" aria-label="Genre options">
                <button class="option-btn" data-value="rock_blues_punk">
                    <span class="option-icon">🎸</span>
                    <span class="option-text">Rock'n'roll, Blues & Punk</span>
                </button>
                <button class="option-btn" data-value="indie_alt">
                    <span class="option-icon">🎹</span>
                    <span class="option-text">Indie & Alternative</span>
                </button>
                <button class="option-btn" data-value="metal">
                    <span class="option-icon">🤘</span>
                    <span class="option-text">Hard Rock & Metal</span>
                </button>
                <button class="option-btn" data-value="pop">
                    <span class="option-icon">🎤</span>
                    <span class="option-text">Pop & Charts</span>
                </button>
                <button class="option-btn" data-value="electronic">
                    <span class="option-icon">🎧</span>
                    <span class="option-text">Electronic & Dance</span>
                </button>
                <button class="option-btn" data-value="hiphop">
                    <span class="option-icon">🔥</span>
                    <span class="option-text">Hip Hop & R&B</span>
                </button>
                <button class="option-btn" data-value="acoustic">
                    <span class="option-icon">🎻</span>
                    <span class="option-text">Acoustic, Folk, Jazz, Reggae & Soul</span>
                </button>
                <button class="option-btn" data-value="classical">
                    <span class="option-icon">🎼</span>
                    <span class="option-text">Classical & Orchestra</span>
                </button>
                <button class="option-btn" data-value="surprise">
                    <span class="option-icon">🎰</span>
                    <span class="option-text">Surprise Me!</span>
                </button>
            </div>

            <div class="nav-buttons">
                <button class="btn-back" onclick="goBack()">← Back</button>
            </div>
        </section>

        <!-- Step 5: Budget? -->
        <section class="step" id="step5" aria-labelledby="step5-title">
            <h2 class="step-title" id="step5-title">What's your budget?</h2>
            <div class="options-grid" role="group" aria-label="Budget options">
                <button class="option-btn" data-value="free">
                    <span class="option-icon">🤘</span>
                    <span class="option-text">Free - £10</span>
                </button>
                <button class="option-btn" data-value="low">
                    <span class="option-icon">💸</span>
                    <span class="option-text">£10 - £20</span>
                </button>
                <button class="option-btn" data-value="mid">
                    <span class="option-icon">💰</span>
                    <span class="option-text">£20 - £50</span>
                </button>
                <button class="option-btn" data-value="high">
                    <span class="option-icon">💎</span>
                    <span class="option-text">£50+</span>
                </button>
                <button class="option-btn" data-value="any">
                    <span class="option-icon">🎟️</span>
                    <span class="option-text">Any Price</span>
                </button>
            </div>

            <div class="nav-buttons">
                <button class="btn-back" onclick="goBack()">← Back</button>
            </div>
        </section>

        <!-- Results Page -->
        <section class="step" id="results" aria-labelledby="results-title">
            <h2 class="step-title" id="results-title">Your Gigs</h2>
            <div class="results-summary">
                <p>Finding gigs that match your preferences...</p>
            </div>
            <div class="nav-buttons">
                <button class="btn-back" onclick="goBack()">← Back</button>
                <button class="btn-primary" onclick="resetQuiz()">Start Over</button>
            </div>
        </section>

        <!-- Gig Details Page -->
        <section class="step" id="gig-details" aria-labelledby="gig-title">
            <div class="gig-detail-content">
                <!-- Content injected by JS -->
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-content">
            <!-- Logo -->
            <div class="logo-container">
                <img src="/gigfinder/gigfinder-logo.png" alt="GigFinder Logo" class="main-logo">
                <div class="powered-by">
                    <span class="powered-text">Powered by</span>
                    <span class="angry-apple-text">Angry Apple Tree</span>
                </div>
            </div>
        </div>

        <div class="footer-bottom">
            <p>&copy; 2025 Angry Apple Tree Ltd. All rights reserved. | <a href="/privacy.html">Privacy Policy</a> | <a href="/terms.html">Terms of Service</a> | <a href="/contact.html">Contact</a> | <a href="/admin">Admin</a></p>
        </div>
    </footer>

    <!-- Booking Modal -->
    <div id="booking-modal" class="modal-overlay hidden" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center;">
        <div class="modal-content" style="background:#1a1a1a; padding:2rem; border-radius:12px; max-width:400px; width:90%; position:relative; border: 1px solid var(--color-primary); box-shadow: 0 0 20px rgba(255,51,102,0.3);">
            <button onclick="closeBookingModal()" style="position:absolute; top:10px; right:15px; background:none; border:none; color:white; font-size:2rem; cursor:pointer;">&times;</button>
            <h2 style="color:var(--color-primary); margin-bottom:0.5rem; text-align:center; font-family: var(--font-display);">Get on the List</h2>
            <p id="booking-event-name" style="text-align:center; margin-bottom:1.5rem; color: #ccc; font-size: 0.9rem;"></p>
            
            <form onsubmit="handleBookingSubmit(event)">
                <input type="hidden" id="booking-event-id">
                <div style="margin-bottom:1rem;">
                    <label style="display:block; margin-bottom:0.5rem; font-size:0.9rem;">Your Full Name</label>
                    <input type="text" id="booking-name" required style="width:100%; padding:0.8rem; border-radius:4px; border:1px solid #333; background:#000; color:white; font-family:inherit;">
                </div>
                <div style="margin-bottom:1.5rem;">
                    <label style="display:block; margin-bottom:0.5rem; font-size:0.9rem;">Email Address</label>
                    <input type="email" id="booking-email" required style="width:100%; padding:0.8rem; border-radius:4px; border:1px solid #333; background:#000; color:white; font-family:inherit;">
                    <p style="font-size:0.7rem; color:#666; margin-top:0.3rem;">We'll email your ticket instantly.</p>
                </div>
                <button type="submit" class="btn-primary" style="width:100%;">Confirm Booking</button>
            </form>
        </div>
    </div>
`;
