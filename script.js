// GigFinder - Interactive Journey

let currentStep = 1;
const totalSteps = 5;
let isNavigating = false; // Prevent ghost clicks
const userChoices = {
    when: null,
    customDate: null,
    flexible: false,
    where: null,
    postcode: null,
    venueSize: null,
    vibe: null,
    budget: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Clear inputs on load
    document.getElementById('postcode').value = '';
    document.getElementById('customDate').value = '';
    setupEventListeners();
});

function setupEventListeners() {
    // Step 1: When buttons
    document.querySelectorAll('#step1 .option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isNavigating) return;

            const value = btn.dataset.value;
            userChoices.when = value;

            if (value === 'custom') {
                document.getElementById('datePicker').classList.remove('hidden');
            } else {
                document.getElementById('datePicker').classList.add('hidden');
                nextStep();
            }
        });
    });

    // Custom date input
    document.getElementById('customDate').addEventListener('change', (e) => {
        userChoices.customDate = e.target.value;
        if (userChoices.customDate) {
            setTimeout(nextStep, 500);
        }
    });

    // Flexible checkbox
    document.getElementById('flexibleDate').addEventListener('change', (e) => {
        userChoices.flexible = e.target.checked;
    });

    // Step 2: Where buttons
    document.querySelectorAll('#step2 .option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isNavigating) return;

            const value = btn.dataset.value;
            userChoices.where = value;

            if (value === 'local' || value === '100miles') {
                document.getElementById('postcodeInput').classList.remove('hidden');
            } else {
                document.getElementById('postcodeInput').classList.add('hidden');
                nextStep();
            }
        });
    });

    // Postcode input
    document.getElementById('postcode').addEventListener('input', (e) => {
        userChoices.postcode = e.target.value.toUpperCase();
        if (userChoices.postcode.length >= 2) {
            if (this.postcodeTimeout) clearTimeout(this.postcodeTimeout);
            this.postcodeTimeout = setTimeout(() => {
                if (userChoices.postcode.length >= 2) {
                    nextStep();
                }
            }, 800);
        }
    });

    // Step 3: Venue Size buttons
    document.querySelectorAll('#step3 .option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isNavigating) return;
            userChoices.venueSize = btn.dataset.value;
            nextStep();
        });
    });

    // Step 4: Vibe buttons
    document.querySelectorAll('#step4 .option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isNavigating) return;
            userChoices.vibe = btn.dataset.value;
            nextStep();
        });
    });

    // Step 5: Budget buttons
    document.querySelectorAll('#step5 .option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isNavigating) return;
            userChoices.budget = btn.dataset.value;
            showResults();
        });
    });
}

function nextStep() {
    if (isNavigating) return;
    isNavigating = true;

    if (currentStep < totalSteps) {
        // Hide current step
        document.getElementById(`step${currentStep}`).classList.remove('active');

        // Update progress
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('completed');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('active');

        // Show next step
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.add('active');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('active');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Reset navigation lock after transition
        setTimeout(() => {
            isNavigating = false;
        }, 500);
    }
}

function goBack() {
    if (isNavigating) return;

    if (currentStep > 1) {
        // Hide current step
        document.getElementById(`step${currentStep}`).classList.remove('active');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('active');

        // Show previous step
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.add('active');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('completed');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('active');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 'results') {
        // Go back from results to step 5
        document.getElementById('results').classList.remove('active');
        currentStep = 5;
        document.getElementById(`step${currentStep}`).classList.add('active');
    } else if (currentStep === 'details') {
        // Go back from details to results
        document.getElementById('gig-details').classList.remove('active');
        document.getElementById('results').classList.add('active');
        currentStep = 'results';
    }
}

function showResults() {
    // Hide step 5
    document.getElementById('step5').classList.remove('active');

    // Mark step 5 as completed
    document.querySelector('.progress-step[data-step="5"]').classList.add('completed');
    document.querySelector('.progress-step[data-step="5"]').classList.remove('active');

    // Show results
    currentStep = 'results';
    document.getElementById('results').classList.add('active');

    // Log choices
    console.log('User Choices:', userChoices);

    // Update results summary
    const summary = generateSummary();
    const resultsContainer = document.querySelector('.results-summary');
    resultsContainer.innerHTML = summary;

    // Generate and append results based on logic
    const filteredGigs = filterGigs(userChoices);
    const gigsHtml = renderGigs(filteredGigs);
    resultsContainer.innerHTML += gigsHtml;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function generateSummary() {
    let html = '<h2 style="margin-bottom: 1rem; color: var(--color-primary);">Your Preferences</h2>';
    html += '<div style="text-align: left; max-width: 500px; margin: 0 auto 2rem auto; padding: 1rem; border: 1px dashed var(--color-text-dim);">';

    // When
    let whenText = userChoices.when;
    if (userChoices.when === 'custom' && userChoices.customDate) {
        whenText = new Date(userChoices.customDate).toLocaleDateString('en-GB');
        if (userChoices.flexible) whenText += ' (flexible)';
    } else if (userChoices.when === 'dontknow') {
        whenText = "I Don't Know (Surprise me!)";
    }
    html += `<p><strong>When:</strong> ${whenText}</p>`;

    // Where
    let whereText = userChoices.where;
    if (userChoices.postcode) {
        whereText += ` (${userChoices.postcode})`;
    }
    html += `<p><strong>Where:</strong> ${whereText}</p>`;

    // Venue Size
    let sizeText = userChoices.venueSize;
    if (sizeText === 'small') sizeText = 'Small & Cosy (Max 150)';
    if (sizeText === 'medium') sizeText = 'Quite Big (151-1000)';
    if (sizeText === 'large') sizeText = 'Big (1001-5000)';
    if (sizeText === 'massive') sizeText = 'Massive (5001-25000)';
    if (sizeText === 'huge') sizeText = 'Proper Huge (25000+)';
    html += `<p><strong>Venue Size:</strong> ${sizeText}</p>`;

    // Vibe / Sound
    let vibeText = userChoices.vibe;
    if (vibeText === 'rock_blues_punk') vibeText = "Rock'n'roll, Blues & Punk";
    if (vibeText === 'indie_alt') vibeText = "Indie & Alternative";
    if (vibeText === 'metal') vibeText = "Hard Rock & Metal";
    if (vibeText === 'pop') vibeText = "Pop & Charts";
    if (vibeText === 'electronic') vibeText = "Electronic & Dance";
    if (vibeText === 'hiphop') vibeText = "Hip Hop & R&B";
    if (vibeText === 'acoustic') vibeText = "Acoustic, Folk, Jazz & Soul";
    if (vibeText === 'surprise') vibeText = "Surprise Me!";
    html += `<p><strong>Sound:</strong> ${vibeText}</p>`;

    // Budget
    html += `<p><strong>Budget:</strong> ${userChoices.budget}</p>`;

    html += '</div>';
    return html;
}

// --- Mock Data & Logic ---

// Postcode Coordinate Lookup (Mock Geocoding)
const postcodeCoordinates = {
    'EH1': { lat: 55.9533, lon: -3.1883 },
    'EH2': { lat: 55.9524, lon: -3.2000 },
    'EH3': { lat: 55.9495, lon: -3.2100 },
    'EH6': { lat: 55.9740, lon: -3.1720 },
    'EH11': { lat: 55.9300, lon: -3.2400 },
    'G1': { lat: 55.8642, lon: -4.2518 },
    'G2': { lat: 55.8617, lon: -4.2583 },
    'G3': { lat: 55.8650, lon: -4.2800 },
    'G11': { lat: 55.8700, lon: -4.3000 },
    'G40': { lat: 55.8500, lon: -4.2200 },
    'DEFAULT': { lat: 55.9000, lon: -3.7000 }
};

// Venue Coordinates & Capacities
const venueLocations = {
    'Sneaky Pete\'s': { lat: 55.9490, lon: -3.1890, postcode: 'EH1', capacity: 100 }, // Small
    'The Hug and Pint': { lat: 55.8700, lon: -4.2700, postcode: 'G3', capacity: 120 }, // Small
    'King Tut\'s': { lat: 55.8627, lon: -4.2667, postcode: 'G2', capacity: 300 }, // Medium
    'The Caves': { lat: 55.9486, lon: -3.1875, postcode: 'EH1', capacity: 450 }, // Medium
    'The Liquid Room': { lat: 55.9472, lon: -3.1914, postcode: 'EH1', capacity: 800 }, // Medium
    'Barrowland': { lat: 55.8544, lon: -4.2386, postcode: 'G40', capacity: 1900 }, // Large
    'O2 Academy': { lat: 55.9350, lon: -3.2300, postcode: 'EH11', capacity: 3000 }, // Large
    'OVO Hydro': { lat: 55.8600, lon: -4.2850, postcode: 'G3', capacity: 14000 }, // Massive
    'Murrayfield Stadium': { lat: 55.9422, lon: -3.2408, postcode: 'EH12', capacity: 67000 } // Proper Huge
};

// Generate a large set of mock gigs
function generateAllMockGigs() {
    const gigs = [];
    const genres = ['rock_blues_punk', 'indie_alt', 'metal', 'pop', 'electronic', 'hiphop', 'acoustic'];
    const locations = Object.keys(venueLocations);
    const bandPrefixes = ['The', 'Electric', 'Neon', 'Dark', 'Angry', 'Cosmic', 'Velvet', 'Massive', 'Tiny', 'Urban', 'Midnight', 'Twisted', 'Royal', 'Hidden'];
    const bandSuffixes = ['Apples', 'Badgers', 'Dreams', 'Riot', 'Waves', 'Echoes', 'Souls', 'Giants', 'Mice', 'Monkeys', 'Disco', 'Protocol', 'Stags', 'Thistles'];

    const today = new Date();

    // --- 1. Hardcoded "Hero" Gigs (Guaranteed for Demo) ---

    // Gig 1: Tonight (Punk at Sneaky's)
    const date1 = new Date(today);
    gigs.push({
        id: 101,
        name: "The Angry Apple Trees",
        location: "Sneaky Pete's",
        coords: venueLocations["Sneaky Pete's"],
        capacity: 100,
        dateObj: date1,
        date: date1.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
        time: "20:00",
        priceVal: 15,
        price: "£15.00",
        vibe: "rock_blues_punk"
    });

    // Gig 2: Tomorrow (Electronic at Liquid Room)
    const date2 = new Date(today);
    date2.setDate(today.getDate() + 1);
    gigs.push({
        id: 102,
        name: "Neon Skyline",
        location: "The Liquid Room",
        coords: venueLocations["The Liquid Room"],
        capacity: 800,
        dateObj: date2,
        date: date2.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
        time: "22:00",
        priceVal: 25,
        price: "£25.00",
        vibe: "electronic"
    });

    // Gig 3: This Weekend (Indie at King Tut's)
    const date3 = new Date(today);
    date3.setDate(today.getDate() + (6 - today.getDay() + 7) % 7); // Next Saturday
    gigs.push({
        id: 103,
        name: "Velvet Thunder",
        location: "King Tut's",
        coords: venueLocations["King Tut's"],
        capacity: 300,
        dateObj: date3,
        date: date3.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
        time: "20:30",
        priceVal: 18,
        price: "£18.00",
        vibe: "indie_alt"
    });

    // Gig 4: Future (3 Months out - Metal at Barrowland)
    const date4 = new Date(today);
    date4.setMonth(today.getMonth() + 3);
    gigs.push({
        id: 104,
        name: "Iron Stag",
        location: "Barrowland",
        coords: venueLocations["Barrowland"],
        capacity: 1900,
        dateObj: date4,
        date: date4.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
        time: "19:00",
        priceVal: 35,
        price: "£35.00",
        vibe: "metal"
    });

    // Gig 5: Future (4 Months out - Jazz at The Caves)
    const date5 = new Date(today);
    date5.setMonth(today.getMonth() + 4);
    gigs.push({
        id: 105,
        name: "Midnight Soul Collective",
        location: "The Caves",
        coords: venueLocations["The Caves"],
        capacity: 450,
        dateObj: date5,
        date: date5.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
        time: "21:00",
        priceVal: 20,
        price: "£20.00",
        vibe: "acoustic"
    });

    // --- 2. Random Generation for the rest ---
    for (let i = 0; i < 45; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + Math.floor(Math.random() * 200));

        const genre = genres[Math.floor(Math.random() * genres.length)];
        const price = Math.floor(Math.random() * 60);
        const locationName = locations[Math.floor(Math.random() * locations.length)];
        const venueData = venueLocations[locationName];

        gigs.push({
            id: i,
            name: `${bandPrefixes[Math.floor(Math.random() * bandPrefixes.length)]} ${bandSuffixes[Math.floor(Math.random() * bandSuffixes.length)]}`,
            location: locationName,
            coords: venueData,
            capacity: venueData.capacity,
            dateObj: date,
            date: date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
            time: `${19 + Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 2) === 0 ? '00' : '30'}`,
            priceVal: price,
            price: price === 0 ? 'Free' : `£${price.toFixed(2)}`,
            vibe: genre
        });
    }

    return gigs.sort((a, b) => a.dateObj - b.dateObj);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function filterGigs(choices) {
    let allGigs = generateAllMockGigs();

    let userCoords = null;
    if (choices.postcode && postcodeCoordinates[choices.postcode]) {
        userCoords = postcodeCoordinates[choices.postcode];
    } else if (choices.postcode) {
        userCoords = postcodeCoordinates['DEFAULT'];
    }

    if (userCoords) {
        allGigs = allGigs.map(gig => {
            const dist = calculateDistance(userCoords.lat, userCoords.lon, gig.coords.lat, gig.coords.lon);
            return { ...gig, distance: dist };
        });
    }

    let filtered = allGigs;

    // 1. Filter by Location
    if (choices.where === 'local' && userCoords) {
        filtered = filtered.filter(gig => gig.distance <= 10);
    } else if (choices.where === '100miles' && userCoords) {
        filtered = filtered.filter(gig => gig.distance <= 100);
    }

    // 2. Filter by Venue Size
    if (choices.venueSize) {
        filtered = filtered.filter(gig => {
            const cap = gig.capacity;
            if (choices.venueSize === 'small') return cap <= 150;
            if (choices.venueSize === 'medium') return cap > 150 && cap <= 1000;
            if (choices.venueSize === 'large') return cap > 1000 && cap <= 5000;
            if (choices.venueSize === 'massive') return cap > 5000 && cap <= 25000;
            if (choices.venueSize === 'huge') return cap > 25000;
            return true;
        });
    }

    // 3. Filter by Sound / Genre
    if (choices.vibe && choices.vibe !== 'surprise') {
        filtered = filtered.filter(gig => gig.vibe === choices.vibe);
    }

    // 4. Filter by Budget
    if (choices.budget) {
        filtered = filtered.filter(gig => {
            if (choices.budget === 'free') return gig.priceVal <= 10;
            if (choices.budget === 'low') return gig.priceVal >= 10 && gig.priceVal <= 20;
            if (choices.budget === 'mid') return gig.priceVal >= 20 && gig.priceVal <= 50;
            if (choices.budget === 'high') return gig.priceVal >= 50;
            return true;
        });
    }

    // 5. Apply "When" Logic
    const today = new Date();

    if (choices.when === 'dontknow') {
        const next8 = filtered.slice(0, 8);
        const threeMonths = new Date(today);
        threeMonths.setMonth(today.getMonth() + 3);
        const sixMonths = new Date(today);
        sixMonths.setMonth(today.getMonth() + 6);
        const futureGigs = filtered.filter(gig =>
            gig.dateObj >= threeMonths && gig.dateObj <= sixMonths
        ).slice(0, 2);
        return [...next8, ...futureGigs];
    } else if (choices.when === 'tonight') {
        return filtered.filter(gig => isSameDay(gig.dateObj, today));
    } else if (choices.when === 'weekend') {
        return filtered.filter(gig => {
            const diff = (gig.dateObj - today) / (1000 * 60 * 60 * 24);
            const day = gig.dateObj.getDay();
            return diff < 7 && (day === 0 || day === 5 || day === 6);
        });
    } else if (choices.when === 'week') {
        return filtered.filter(gig => {
            const diff = (gig.dateObj - today) / (1000 * 60 * 60 * 24);
            return diff < 7;
        });
    } else if (choices.when === 'custom' && choices.customDate) {
        const selectedDate = new Date(choices.customDate);
        if (choices.flexible) {
            return filtered.filter(gig => {
                const diff = Math.abs((gig.dateObj - selectedDate) / (1000 * 60 * 60 * 24));
                return diff <= 3;
            });
        } else {
            return filtered.filter(gig => isSameDay(gig.dateObj, selectedDate));
        }
    }

    return filtered.slice(0, 10);
}

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

// Store current filtered gigs globally to access for details
let currentGigs = [];

function renderGigs(gigs) {
    currentGigs = gigs; // Cache for detail view

    if (gigs.length === 0) {
        return '<div style="text-align: center; padding: 2rem;"><h3>No gigs found matching your criteria! 🎸</h3><p>Try adjusting your filters.</p></div>';
    }

    let html = '<div class="gigs-list">';

    gigs.forEach(gig => {
        let distanceHtml = '';
        if (gig.distance !== undefined) {
            distanceHtml = `<span style="font-size: 0.9rem; color: var(--color-primary);">(${gig.distance.toFixed(1)} miles away)</span>`;
        }

        html += `
            <div class="gig-card">
                <div class="gig-image">
                    <img src="public/Cal drummin.png" alt="${gig.name}">
                </div>
                <div class="gig-details">
                    <h3 class="gig-name">${gig.name}</h3>
                    <div class="gig-info">
                        <p class="gig-location">📍 ${gig.location} ${distanceHtml}</p>
                        <p class="gig-date">📅 ${gig.date} at ${gig.time}</p>
                        <p class="gig-price">🎟️ ${gig.price}</p>
                    </div>
                    <button class="btn-buy" onclick="showGigDetails(${gig.id})">Get Tickets</button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

function showGigDetails(gigId) {
    const gig = currentGigs.find(g => g.id === gigId);
    if (!gig) return;

    // Hide results, show details
    document.getElementById('results').classList.remove('active');
    document.getElementById('gig-details').classList.add('active');
    currentStep = 'details'; // Update state

    const container = document.querySelector('.gig-detail-content');

    // Mock Description
    const descriptions = [
        "Prepare for a night of high-energy performance and unforgettable tunes. This band has been tearing up the scene with their unique sound.",
        "An intimate evening with one of the most exciting new acts in the country. Don't miss your chance to see them in such a cool venue.",
        "Loud, fast, and unapologetic. If you like your music with a bit of edge, this is the gig for you.",
        "A sonic journey through soundscapes and rhythm. This is going to be a special one."
    ];
    const randomDesc = descriptions[Math.floor(Math.random() * descriptions.length)];

    container.innerHTML = `
        <div class="detail-hero">
            <img src="public/Cal drummin.png" alt="${gig.name}">
        </div>
        <div class="detail-body">
            <h2 class="detail-title">${gig.name}</h2>

            <div class="detail-info-grid">
                <div class="detail-item">
                    <span class="detail-label">Date</span>
                    <span class="detail-value">${gig.date}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Time</span>
                    <span class="detail-value">${gig.time}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Venue</span>
                    <span class="detail-value">${gig.location}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Price</span>
                    <span class="detail-value">${gig.price}</span>
                </div>
            </div>

            <p class="detail-description">
                ${randomDesc} <br><br>
                <strong>Genre:</strong> ${gig.vibe.replace(/_/g, ' ').toUpperCase()}<br>
                <strong>Capacity:</strong> ${gig.capacity}
            </p>

            <div class="detail-actions">
                <a href="#" class="btn-buy-large">Buy Tickets Now</a>
            </div>
            <div style="margin-top: 1rem; text-align: center;">
                 <button class="btn-back" onclick="goBack()" style="background: transparent; border: none; color: var(--color-text-dim); cursor: pointer; text-decoration: underline;">&larr; Back to Results</button>
            </div>
        </div>
    `;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetQuiz() {
    Object.keys(userChoices).forEach(key => {
        userChoices[key] = null;
    });
    userChoices.flexible = false;

    currentStep = 1;
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    document.getElementById('step1').classList.add('active');

    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
    document.querySelector('.progress-step[data-step="1"]').classList.add('active');

    document.getElementById('datePicker').classList.add('hidden');
    document.getElementById('postcodeInput').classList.add('hidden');

    document.getElementById('customDate').value = '';
    document.getElementById('flexibleDate').checked = false;
    document.getElementById('postcode').value = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}
