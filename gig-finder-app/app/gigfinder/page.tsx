import Script from 'next/script';

export default function GigFinderPage() {
    return (
        <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />

            <link rel="stylesheet" href="/gigfinder/style.css" />

            <div dangerouslySetInnerHTML={{ __html: gigFinderHTML }} />

            <Script src="/gigfinder/manual-gigs.js" strategy="afterInteractive" />
            <Script src="/gigfinder/script-api.js" strategy="afterInteractive" />
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
        </section>

        <!-- Step 2: Where? -->
        <section class="step" id="step2" aria-labelledby="step2-title">
            <h2 class="step-title" id="step2-title">How far will you travel?</h2>
            <div class="options-grid" role="group" aria-label="Location options">
                <button class="option-btn" data-value="local">
                    <span class="option-icon">🎯</span>
                    <span class="option-text">Locally</span>
                </button>
                <button class="option-btn" data-value="100miles">
                    <span class="option-icon">🛣️</span>
                    <span class="option-text">Within 100 Miles</span>
                </button>
                <button class="option-btn" data-value="uk">
                    <span class="option-icon">🗺️</span>
                    <span class="option-text">UK-Wide</span>
                </button>
            </div>

            <div class="postcode-input hidden" id="postcodeInput">
                <label for="postcode">Enter your postcode (first half):</label>
                <input type="text" id="postcode" placeholder="e.g. EH1" class="text-input">
                <button class="btn-primary" id="postcodeNext" style="margin-top: 1rem;">Next →</button>
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
                    <span class="option-text">Small & Cosy<br><span style="font-size: 0.8rem">(Max 150)</span></span>
                </button>
                <button class="option-btn" data-value="medium">
                    <span class="option-icon">🏢</span>
                    <span class="option-text">Quite Big<br><span style="font-size: 0.8rem">(151 - 1000)</span></span>
                </button>
                <button class="option-btn" data-value="large">
                    <span class="option-icon">🏟️</span>
                    <span class="option-text">Big<br><span style="font-size: 0.8rem">(1001 - 5000)</span></span>
                </button>
                <button class="option-btn" data-value="massive">
                    <span class="option-icon">🏰</span>
                    <span class="option-text">Massive<br><span style="font-size: 0.8rem">(5001 - 25000)</span></span>
                </button>
                <button class="option-btn" data-value="huge">
                    <span class="option-icon">👑</span>
                    <span class="option-text">Proper Huge<br><span style="font-size: 0.8rem">(25000+)</span></span>
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
                <img src="gigfinder/gigfinder-logo.png" alt="GigFinder Logo" class="main-logo">
                <div class="powered-by">
                    <span class="powered-text">Powered by</span>
                    <span class="angry-apple-text">Angry Apple Tree</span>
                </div>
            </div>
        </div>

        <div class="footer-bottom">
            <p>&copy; 2025 Angry Apple Tree Ltd. All rights reserved. | <a href="/privacy.html">Privacy Policy</a> | <a href="/terms.html">Terms of Service</a> | <a href="/contact.html">Contact</a></p>
        </div>
    </footer>
`;
