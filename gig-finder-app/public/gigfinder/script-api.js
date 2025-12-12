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
function initGigFinder() {
    console.log('🚀 Initializing GigFinder...');

    // Remove problematic attribute that causes hydration errors
    if (document.documentElement.hasAttribute('data-jetski-tab-id')) {
        document.documentElement.removeAttribute('data-jetski-tab-id');
    }

    // Wait a bit to ensure all elements are rendered
    setTimeout(() => {
        // Clear inputs on load
        const postcodeInput = document.getElementById('postcode');
        const customDateInput = document.getElementById('customDate');

        if (postcodeInput) postcodeInput.value = '';
        if (customDateInput) customDateInput.value = '';

        setupEventListeners();

        console.log('✅ GigFinder initialized successfully');
    }, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGigFinder);
} else {
    initGigFinder();
}

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
    const customDateInput = document.getElementById('customDate');
    if (customDateInput) {
        customDateInput.addEventListener('change', (e) => {
            userChoices.customDate = e.target.value;
            if (userChoices.customDate) {
                setTimeout(nextStep, 500);
            }
        });
    }

    // Flexible checkbox
    const flexibleDateInput = document.getElementById('flexibleDate');
    if (flexibleDateInput) {
        flexibleDateInput.addEventListener('change', (e) => {
            userChoices.flexible = e.target.checked;
        });
    }

    // Step 2: Where buttons
    document.querySelectorAll('#step2 .option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isNavigating) return;

            const value = btn.dataset.value;
            userChoices.where = value;

            if (value === 'local' || value === '100miles') {
                const pcInput = document.getElementById('postcodeInput');
                if (pcInput) pcInput.classList.remove('hidden');
            } else {
                const pcInput = document.getElementById('postcodeInput');
                if (pcInput) pcInput.classList.add('hidden');
                nextStep();
            }
        });
    });

    // Postcode input
    const postcodeInput = document.getElementById('postcode');
    if (postcodeInput) {
        postcodeInput.addEventListener('input', (e) => {
            userChoices.postcode = e.target.value.toUpperCase();
        });

        // Postcode Enter key
        postcodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && userChoices.postcode && userChoices.postcode.length >= 2) {
                nextStep();
            }
        });
    }

    // Postcode Next button
    const postcodeNextBtn = document.getElementById('postcodeNext');
    if (postcodeNextBtn) {
        postcodeNextBtn.addEventListener('click', () => {
            if (userChoices.postcode && userChoices.postcode.length >= 2) {
                nextStep();
            } else {
                alert('Please enter at least the first part of your postcode (e.g., EH1)');
            }
        });
    }

    // Step 3: Venue Size buttons
    document.querySelectorAll('#step3 .option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isNavigating) return;
            const size = btn.dataset.value;
            userChoices.venueSize = size;

            if (size === 'huge') {
                showRejectionScreen();
            } else {
                // Skip Step 4 (Style/Vibe) -> Default to 'surprise'
                userChoices.vibe = 'surprise';
                skipToStep5();
            }
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

    if (currentStep === 5) {
        // Special case: Go back from Step 5 (Budget) to Step 3 (Size), skipping Step 4 (Sound)
        document.getElementById(`step${currentStep}`).classList.remove('active');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('active');

        currentStep = 3;

        document.getElementById(`step${currentStep}`).classList.add('active');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('completed');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });

    } else if (currentStep > 1) {
        // Generic: Hide current step
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
        // Go back from results to step 5 (Budget)
        document.getElementById('results').classList.remove('active');
        currentStep = 5;
        document.getElementById(`step${currentStep}`).classList.add('active');
        // Ensuring progress bar reflects being on Step 5 (which is visually the 4th circle)
        document.querySelector('.progress-step[data-step="5"]').classList.remove('completed'); // if it was marked complete
        document.querySelector('.progress-step[data-step="5"]').classList.add('active');

    } else if (currentStep === 'details') {
        // Go back from details to results
        document.getElementById('gig-details').classList.remove('active');
        document.getElementById('results').classList.add('active');
        currentStep = 'results';
    }
}

async function showResults() {
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

    // Reset pagination
    displayedGigsCount = 20;

    // Update results summary
    const summary = generateSummary();
    const resultsContainer = document.querySelector('.results-summary');
    resultsContainer.innerHTML = summary + '<p style="text-align: center; margin-top: 1rem;">Loading gigs...</p>';

    // Generate and append results based on logic (now async)
    const filteredGigs = await filterGigs(userChoices);
    const gigsHtml = renderGigs(filteredGigs);
    resultsContainer.innerHTML = summary + gigsHtml;

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
    // Venue Size
    let sizeText = userChoices.venueSize;
    if (sizeText === 'small') sizeText = 'Small & Cosy (Up to 100)';
    if (sizeText === 'medium') sizeText = 'Quite Big (100-5,000)';
    if (sizeText === 'huge') sizeText = 'Proper Huge (Over 5,000)';
    if (sizeText === 'any') sizeText = 'Any Size';
    html += `<p><strong>Venue Size:</strong> ${sizeText}</p>`;

    // Vibe / Sound
    let vibeText = userChoices.vibe;
    if (vibeText === 'rock_blues_punk') vibeText = "Rock'n'roll, Blues & Punk";
    if (vibeText === 'indie_alt') vibeText = "Indie & Alternative";
    if (vibeText === 'metal') vibeText = "Hard Rock & Metal";
    if (vibeText === 'pop') vibeText = "Pop & Charts";
    if (vibeText === 'electronic') vibeText = "Electronic & Dance";
    if (vibeText === 'hiphop') vibeText = "Hip Hop & R&B";
    if (vibeText === 'acoustic') vibeText = "Acoustic, Folk, Jazz, Reggae & Soul";
    if (vibeText === 'classical') vibeText = "Classical & Orchestra";
    if (vibeText === 'surprise') vibeText = "Surprise Me!";
    html += `<p><strong>Sound:</strong> ${vibeText}</p>`;

    // Budget
    html += `<p><strong>Budget:</strong> ${userChoices.budget}</p>`;

    html += '</div>';
    return html;
}

function skipToStep5() {
    if (isNavigating) return;
    isNavigating = true;

    // Transition from Step 3 to Step 5
    // Hide Step 3
    document.getElementById('step3').classList.remove('active');

    // Mark Progress 3 as complete
    document.querySelector('.progress-step[data-step="3"]').classList.add('completed');
    document.querySelector('.progress-step[data-step="3"]').classList.remove('active');

    // Show Step 5
    currentStep = 5;
    document.getElementById('step5').classList.add('active');

    // Mark Progress 5 (Budget) as active
    document.querySelector('.progress-step[data-step="5"]').classList.add('active');

    // Scroll
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
        isNavigating = false;
    }, 500);
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
    'The Hug and Pint': { lat: 55.8700, lon: -4.2700, postcode: 'G3', capacity: 120 }, // Medium (now > 100)
    'King Tut\'s': { lat: 55.8627, lon: -4.2667, postcode: 'G2', capacity: 300 }, // Medium
    'The Caves': { lat: 55.9486, lon: -3.1875, postcode: 'EH1', capacity: 450 }, // Medium
    'The Liquid Room': { lat: 55.9472, lon: -3.1914, postcode: 'EH1', capacity: 800 }, // Large (now > 500)
    'Barrowland': { lat: 55.8544, lon: -4.2386, postcode: 'G40', capacity: 1900 }, // Large
    'O2 Academy': { lat: 55.9350, lon: -3.2300, postcode: 'EH11', capacity: 3000 }, // Massive
    'OVO Hydro': { lat: 55.8600, lon: -4.2850, postcode: 'G3', capacity: 14000 }, // Proper Huge (now > 5000)
    'Murrayfield Stadium': { lat: 55.9422, lon: -3.2408, postcode: 'EH12', capacity: 67000 } // Proper Huge
};

// Fetch gigs from Skiddle API
async function fetchAllGigs() {
    try {
        // Determine location based on postcode (simplified)
        const location = userChoices.postcode?.startsWith('G') ? 'Glasgow' : 'Edinburgh';

        const response = await fetch(`/api/events?location=${location}`);
        const data = await response.json();

        if (data.error) {
            console.error('API Error:', data.error);
            return generateFallbackGigs(); // Fallback to mock data if API fails
        }

        // Transform API response to match our format
        const skiddleGigs = data.events.map(event => ({
            ...event,
            dateObj: new Date(event.dateObj)
        }));

        console.log(`📊 Loaded ${skiddleGigs.length} gigs from API`);

        return skiddleGigs.sort((a, b) => a.dateObj - b.dateObj);

    } catch (error) {
        console.error('Failed to fetch gigs:', error);
        return generateFallbackGigs(); // Fallback to mock data
    }
}

// Fallback mock gigs if API fails
function generateFallbackGigs() {
    const gigs = [];
    const genres = ['rock_blues_punk', 'indie_alt', 'metal', 'pop', 'electronic', 'hiphop', 'acoustic', 'classical'];
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
        vibe: "rock_blues_punk",
        ticketUrl: "https://www.skiddle.com"
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
        vibe: "electronic",
        ticketUrl: "https://www.skiddle.com"
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
        vibe: "indie_alt",
        ticketUrl: "https://www.skiddle.com"
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
        vibe: "metal",
        ticketUrl: "https://www.skiddle.com"
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
        vibe: "acoustic",
        ticketUrl: "https://www.skiddle.com"
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

async function filterGigs(choices) {
    let allGigs = await fetchAllGigs();

    console.log('📊 Total gigs fetched:', allGigs.length);
    console.log('🔍 User choices:', choices);

    let userCoords = null;
    if (choices.postcode && postcodeCoordinates[choices.postcode]) {
        userCoords = postcodeCoordinates[choices.postcode];
    } else if (choices.postcode) {
        userCoords = postcodeCoordinates['DEFAULT'];
    }

    if (userCoords) {
        allGigs = allGigs.map(gig => {
            // Safety check for coords
            if (gig.coords && gig.coords.lat && gig.coords.lon) {
                const dist = calculateDistance(userCoords.lat, userCoords.lon, gig.coords.lat, gig.coords.lon);
                return { ...gig, distance: dist };
            }
            return gig;
        });
    }

    let filtered = allGigs;
    console.log('🔄 Starting with:', filtered.length, 'gigs');

    // 1. Filter by Location
    if (choices.where === 'local' && userCoords) {
        filtered = filtered.filter(gig => gig.distance <= 10);
        console.log('📍 After local filter (10 miles):', filtered.length, 'gigs');
    } else if (choices.where === '100miles' && userCoords) {
        filtered = filtered.filter(gig => gig.distance <= 100);
        console.log('📍 After 100 miles filter:', filtered.length, 'gigs');
    } else {
        console.log('📍 No location filter applied (where:', choices.where, ')');
    }

    // 2. Filter by Venue Size
    if (choices.venueSize && choices.venueSize !== 'any') {
        const beforeSize = filtered.length;
        filtered = filtered.filter(gig => {
            const cap = gig.capacity;

            if (choices.venueSize === 'small') return cap <= 100;
            if (choices.venueSize === 'medium') return cap > 100 && cap <= 5000;
            if (choices.venueSize === 'huge') return cap > 5000;
            return true;
        });
        console.log(`🏟️ After venue size filter (${choices.venueSize}):`, filtered.length, 'gigs (removed', beforeSize - filtered.length, ')');
    } else {
        console.log('🏟️ No venue size filter applied');
    }

    // 3. Filter by Sound / Genre
    if (choices.vibe && choices.vibe !== 'surprise') {
        const beforeVibe = filtered.length;
        filtered = filtered.filter(gig => gig.vibe === choices.vibe);
        console.log(`🎵 After genre filter (${choices.vibe}):`, filtered.length, 'gigs (removed', beforeVibe - filtered.length, ')');
    } else {
        console.log('🎵 No genre filter applied');
    }

    // 4. Filter by Budget
    if (choices.budget && choices.budget !== 'any') {
        const beforeBudget = filtered.length;
        filtered = filtered.filter(gig => {
            if (choices.budget === 'free') return gig.priceVal <= 10;
            if (choices.budget === 'low') return gig.priceVal >= 10 && gig.priceVal <= 20;
            if (choices.budget === 'mid') return gig.priceVal >= 20 && gig.priceVal <= 50;
            if (choices.budget === 'high') return gig.priceVal >= 50;
            return true;
        });
        console.log(`💰 After budget filter (${choices.budget}):`, filtered.length, 'gigs (removed', beforeBudget - filtered.length, ')');
    } else {
        console.log('💰 No budget filter applied');
    }

    // 5. Apply "When" Logic
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison

    if (choices.when === 'dontknow') {
        // Show next 20 upcoming gigs + some future ones (3-6 months out)
        const upcoming = filtered.slice(0, 20);
        const threeMonths = new Date(today);
        threeMonths.setMonth(today.getMonth() + 3);
        const sixMonths = new Date(today);
        sixMonths.setMonth(today.getMonth() + 6);
        const futureGigs = filtered.filter(gig =>
            gig.dateObj >= threeMonths && gig.dateObj <= sixMonths
        ).slice(0, 5);
        const result = [...upcoming, ...futureGigs];
        console.log(`📅 After "I Don't Know" filter:`, result.length, 'gigs');
        return result.sort((a, b) => a.dateObj - b.dateObj);
    } else if (choices.when === 'tonight') {
        const result = filtered.filter(gig => isSameDay(gig.dateObj, today));
        console.log(`📅 After "Tonight" filter:`, result.length, 'gigs');
        return result.sort((a, b) => a.dateObj - b.dateObj);
    } else if (choices.when === 'weekend') {
        const result = filtered.filter(gig => {
            const diff = (gig.dateObj - today) / (1000 * 60 * 60 * 24);
            const day = gig.dateObj.getDay();
            return diff < 7 && (day === 0 || day === 5 || day === 6);
        });
        console.log(`📅 After "Weekend" filter:`, result.length, 'gigs');
        return result.sort((a, b) => a.dateObj - b.dateObj);
    } else if (choices.when === 'week') {
        const result = filtered.filter(gig => {
            const diff = (gig.dateObj - today) / (1000 * 60 * 60 * 24);
            return diff >= 0 && diff < 7;
        });
        console.log(`📅 After "This Week" filter:`, result.length, 'gigs');
        return result.sort((a, b) => a.dateObj - b.dateObj);
    } else if (choices.when === 'custom' && choices.customDate) {
        const selectedDate = new Date(choices.customDate);
        selectedDate.setHours(0, 0, 0, 0);
        if (choices.flexible) {
            const result = filtered.filter(gig => {
                const diff = Math.abs((gig.dateObj - selectedDate) / (1000 * 60 * 60 * 24));
                return diff <= 3;
            });
            console.log(`📅 After "Custom Date (flexible)" filter:`, result.length, 'gigs');
            return result.sort((a, b) => a.dateObj - b.dateObj);
        } else {
            const result = filtered.filter(gig => isSameDay(gig.dateObj, selectedDate));
            console.log(`📅 After "Custom Date" filter:`, result.length, 'gigs');
            return result.sort((a, b) => a.dateObj - b.dateObj);
        }
    }

    // Return all filtered results (sorted chronologically)
    console.log(`📅 No date filter applied, returning all:`, filtered.length, 'gigs');
    const finalResults = filtered.sort((a, b) => a.dateObj - b.dateObj);
    console.log('✅ Final filtered gigs:', finalResults.length);
    return finalResults;
}

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

// Store current filtered gigs globally to access for details
let currentGigs = [];
let displayedGigsCount = 20; // Show 20 initially

function renderGigs(gigs, showAll = false) {
    currentGigs = gigs; // Cache for detail view

    if (gigs.length === 0) {
        return '<div style="text-align: center; padding: 2rem;"><h3>No gigs found matching your criteria! 🎸</h3><p>Try adjusting your filters.</p></div>';
    }

    const gigsToShow = showAll ? gigs : gigs.slice(0, displayedGigsCount);

    let html = `<div style="text-align: center; margin-bottom: 1rem;"><p><strong>Showing ${gigsToShow.length} of ${gigs.length} gigs</strong></p></div>`;
    html += '<div class="gigs-list">';

    gigsToShow.forEach(gig => {
        let distanceHtml = '';
        if (gig.distance !== undefined) {
            distanceHtml = `<span style="font-size: 0.9rem; color: var(--color-primary);">(${gig.distance.toFixed(1)} miles away)</span>`;
        }

        // Format location with town
        const locationText = gig.town ? `${gig.location}, ${gig.town}` : gig.location;

        html += `
            <div class="gig-card">
                <div class="gig-image">
                    <img src="${gig.imageUrl || '/no-photo.png'}" alt="${gig.name}" onerror="this.src='/no-photo.png'">
                </div>
                <div class="gig-details">
                    <h3 class="gig-name">${gig.name}</h3>
                    <div class="gig-info">
                        <p class="gig-location">📍 ${locationText} ${distanceHtml}</p>
                        <p class="gig-date">📅 ${gig.date} at ${gig.time}</p>
                        <p class="gig-price">🎟️ ${gig.price}</p>
                    </div>
                    ${gig.isInternalTicketing
                ? `<button class="btn-buy" style="background:var(--color-secondary); border-color:var(--color-secondary);" onclick="showGigDetails('${gig.id}')">Book Now</button>`
                : (gig.ticketUrl && gig.ticketUrl !== '#'
                    ? `<button class="btn-buy" onclick="showGigDetails('${gig.id}')">Get Tickets</button>`
                    : `<button class="btn-buy" style="background-color: var(--color-surface); border: 1px solid var(--color-primary); color: var(--color-text-primary);" onclick="showGigDetails('${gig.id}')">More Info</button>`)
            }
                </div>
            </div>
        `;
    });

    html += '</div>';

    // Add swipe controls and indicators for mobile
    if (window.innerWidth <= 768 && gigsToShow.length > 1) {
        html += `
            <div class="swipe-controls">
                <button class="swipe-btn" onclick="swipePrevious()" aria-label="Previous gig">←</button>
                <button class="swipe-btn" onclick="swipeNext()" aria-label="Next gig">→</button>
            </div>
            <div class="swipe-indicators">
                ${gigsToShow.map((_, i) => `<div class="swipe-dot ${i === 0 ? 'active' : ''}" data-dot-index="${i}"></div>`).join('')}
            </div>
        `;
    }

    // Add "Show More" button if there are more gigs
    if (!showAll && gigs.length > displayedGigsCount) {
        html += `
            <div style="text-align: center; margin-top: 2rem;">
                <button class="btn-primary" onclick="showMoreGigs()" style="padding: 1rem 2rem; font-size: 1.1rem;">
                    Show More Gigs (${gigs.length - displayedGigsCount} remaining)
                </button>
            </div>
        `;
    }

    // Initialize swipe index and positions
    currentSwipeIndex = 0;
    // This call needs to happen after the HTML is rendered to the DOM,
    // so it's better placed in the function that inserts this HTML.
    // For now, we'll keep it here for completeness, but note the potential timing issue.
    setTimeout(updateCardPositions, 0);

    return html;
}

// Swipe functionality
let currentSwipeIndex = 0;

function updateCardPositions() {
    const cards = document.querySelectorAll('.gig-card');
    const dots = document.querySelectorAll('.swipe-dot');

    cards.forEach((card, index) => {
        const relativeIndex = index - currentSwipeIndex;
        card.setAttribute('data-index', relativeIndex);
    });

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSwipeIndex);
    });
}

function swipeNext() {
    const cards = document.querySelectorAll('.gig-card');
    if (currentSwipeIndex < cards.length - 1) {
        currentSwipeIndex++;
        updateCardPositions();
    }
}

function swipePrevious() {
    if (currentSwipeIndex > 0) {
        currentSwipeIndex--;
        updateCardPositions();
    }
}

// Touch swipe support
let touchStartX = 0;
let touchEndX = 0;

function handleSwipeGesture() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
        swipeNext();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
        swipePrevious();
    }
}

// Add touch listeners when results are shown
document.addEventListener('touchstart', (e) => {
    if (e.target.closest('.gig-card')) {
        touchStartX = e.changedTouches[0].screenX;
    }
}, { passive: true });

document.addEventListener('touchend', (e) => {
    if (e.target.closest('.gig-card')) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }
}, { passive: true });

function showMoreGigs() {
    displayedGigsCount += 20; // Show 20 more
    const summary = generateSummary();
    const gigsHtml = renderGigs(currentGigs);
    document.querySelector('.results-summary').innerHTML = summary + gigsHtml;
}

function showGigDetails(gigId) {
    // ID comparison needs to be loose or string-based because HTML attributes are strings
    const gig = currentGigs.find(g => String(g.id) === String(gigId));
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

    // Format location with town
    const locationText = gig.town ? `${gig.location}, ${gig.town}` : gig.location;

    container.innerHTML = `
        <div class="detail-hero">
            <img src="/gigfinder/Cal drummin.png" alt="${gig.name}">
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
                    <span class="detail-value">${locationText}</span>
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
                ${gig.isInternalTicketing
            ? `<button onclick="openBookingModal('${gig.id}')" class="btn-buy-large" style="background:var(--color-secondary);">Join Guest List (Free)</button>`
            : (gig.ticketUrl
                ? `<a href="${gig.ticketUrl}" target="_blank" rel="noopener noreferrer" class="btn-buy-large">Buy Tickets Now →</a>`
                : `<div style="text-align: center; padding: 2rem; background: var(--color-surface); border: 2px dashed var(--color-text-dim); border-radius: 8px;">
                        <p style="font-size: 1.2rem; margin-bottom: 1rem;">😕 Tickets Not Available Online</p>
                        <p style="color: var(--color-text-dim);">Please contact the venue directly for ticket information.</p>
                       </div>`)
        }
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

function showRejectionScreen() {
    const mainContent = document.getElementById('main-content');

    // Clear existing content
    mainContent.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem; animation: fadeIn 0.5s ease;">
            <div style="font-size: 5rem; margin-bottom: 2rem;">🚫</div>
            <h1 style="font-family: 'Permanent Marker', cursive; font-size: 3rem; color: var(--color-primary); margin-bottom: 2rem; line-height: 1.2;">
                Get tae fuck
            </h1>
            <p style="font-size: 1.5rem; color: var(--color-text-primary); margin-bottom: 3rem;">
                We don't advertise those gigs.
            </p>
             <p style="font-size: 1.2rem; color: var(--color-text-dim); margin-bottom: 3rem;">
                (We prefer the sweaty basements, thanks.)
            </p>
            <button class="btn-primary" onclick="window.location.reload()">Start Over</button>
        </div>
    `;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Booking Modal Logic ---

function openBookingModal(gigId) {
    const gig = currentGigs.find(g => g.id == gigId); // loose equality
    if (!gig) return;

    document.getElementById('booking-event-id').value = gig.id;
    document.getElementById('booking-event-name').textContent = gig.name + ' @ ' + gig.location;

    const modal = document.getElementById('booking-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
    }
}

function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
}

async function handleBookingSubmit(e) {
    e.preventDefault();

    let rawId = document.getElementById('booking-event-id').value;
    let eventId = rawId;

    if (String(rawId).startsWith('manual-')) {
        eventId = rawId.replace('manual-', '');
    }

    const name = document.getElementById('booking-name').value;
    const email = document.getElementById('booking-email').value;
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    btn.textContent = 'Processing...';
    btn.disabled = true;

    try {
        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId, name, email })
        });

        const data = await res.json();

        if (res.ok) {
            btn.textContent = 'Success!';
            alert(data.message);
            closeBookingModal();
            e.target.reset();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (err) {
        console.error(err);
        alert('Something went wrong. Please try again.');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// --- Quick Search Functionality ---

async function performQuickSearch() {
    const keyword = document.getElementById('searchInput').value.trim();
    const city = document.getElementById('searchCity').value.trim();
    const date = document.getElementById('searchDate').value;

    console.log('🚀 Performing Quick Search:', { keyword, city, date });

    // Show Results View immediately
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.progress-step').forEach(el => el.classList.remove('active', 'completed'));

    document.getElementById('results').classList.add('active');
    currentStep = 'results';

    const resultsContainer = document.querySelector('.results-summary');
    resultsContainer.innerHTML = '<div style="text-align:center; padding:2rem;"><p>Searching gigs...</p></div>';

    try {
        // Build API URL
        const params = new URLSearchParams();
        params.append('location', city);
        if (keyword) params.append('keyword', keyword);
        if (date) params.append('minDate', date);

        const response = await fetch(`/api/events?${params.toString()}`);
        const data = await response.json();

        if (data.events) {
            // Transform
            const gigs = data.events.map(event => ({
                ...event,
                dateObj: new Date(event.dateObj)
            })).sort((a, b) => a.dateObj - b.dateObj);

            // Render
            const html = renderGigs(gigs, true); // Show all results for search

            let summary = '<h2 style="margin-bottom: 1rem; color: var(--color-primary);">Search Results</h2>';
            if (keyword) summary += `<p>Keyword: <strong>${keyword}</strong></p>`;
            if (city) summary += `<p>Location: <strong>${city}</strong></p>`;
            if (date) summary += `<p>From: <strong>${date}</strong></p>`;

            resultsContainer.innerHTML = summary + html;

            // Re-init swipe if needed (though renderGigs does it timeout)
        } else {
            resultsContainer.innerHTML = '<p>No results found.</p>';
        }

    } catch (error) {
        console.error('Search failed:', error);
        resultsContainer.innerHTML = '<p>Error searching gigs. Please try again.</p>';
    }
}

// Expose to window
window.performQuickSearch = performQuickSearch;

// Add Enter key support for quick search
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performQuickSearch();
        });
    }
});
