'use client';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';
import styles from './add-event.module.css';
import { api } from '@/lib/api-client';
import { ApiError } from '@/lib/errors/ApiError';
import type { Venue } from '@/lib/api-types';

function AddEventForm() {
    const { isLoaded, isSignedIn } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const newVenueParam = searchParams.get('newVenue');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [posterPreview, setPosterPreview] = useState<string>('');
    const [posterBase64, setPosterBase64] = useState<string>('');
    const [statusMessage, setStatusMessage] = useState('');

    // Venue autocomplete state
    const [venues, setVenues] = useState<Venue[]>([]);
    const [venueInput, setVenueInput] = useState('');
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [showVenueSuggestions, setShowVenueSuggestions] = useState(false);
    const [isNewVenue, setIsNewVenue] = useState(false);

    // New venue fields
    const [newVenueCity, setNewVenueCity] = useState('');
    const [newVenueCapacity, setNewVenueCapacity] = useState('');

    // State for restoring draft
    const [isRestoring, setIsRestoring] = useState(true);

    // Restore draft functionality
    useEffect(() => {
        const checkRestore = async () => {
            if (isLoaded) {
                const savedDraft = sessionStorage.getItem('GIGFINDER_DRAFT_EVENT');
                if (savedDraft) {
                    try {
                        const draft = JSON.parse(savedDraft);
                        console.log("Restoring draft...", draft);

                        // Restore fields
                        if (draft.name) (document.getElementById('name') as HTMLInputElement).value = draft.name;
                        if (draft.date) (document.getElementById('date') as HTMLInputElement).value = draft.date;
                        if (draft.time) (document.getElementById('time') as HTMLInputElement).value = draft.time;
                        if (draft.genre) (document.getElementById('genre') as HTMLSelectElement).value = draft.genre;
                        if (draft.description) (document.getElementById('description') as HTMLTextAreaElement).value = draft.description;
                        if (draft.price) (document.getElementById('price') as HTMLInputElement).value = draft.price;

                        // Restore optional fields
                        if (draft.presale_price) (document.getElementById('presale_price') as HTMLInputElement).value = draft.presale_price;
                        if (draft.presale_caption) (document.getElementById('presale_caption') as HTMLInputElement).value = draft.presale_caption;

                        // Restore checkboxes (a bit hacky with DOM but works for standard uncontrolled inputs)
                        if (draft.is_internal_ticketing) {
                            const el = document.querySelector('input[name="is_internal_ticketing"]') as HTMLInputElement;
                            if (el) el.checked = true;
                        }
                        if (draft.sell_tickets) {
                            const el = document.querySelector('input[name="sell_tickets"]') as HTMLInputElement;
                            if (el) el.checked = true;
                        }

                        // Restore Venue State
                        if (draft.venueInput) {
                            setVenueInput(draft.venueInput);
                            // Re-trigger logic? Ideally we'd just set the state if we had creating the venue logic fully controllable
                            // matching venue logic:
                            if (draft.selectedVenue) {
                                setSelectedVenue(draft.selectedVenue);
                                setIsNewVenue(false);
                            } else {
                                setIsNewVenue(true);
                                // Restore new venue details
                                if (draft.newVenueCity) setNewVenueCity(draft.newVenueCity);
                                if (draft.newVenueCapacity) setNewVenueCapacity(draft.newVenueCapacity);
                            }
                        }

                        // Restore Image
                        if (draft.imageUrl) {
                            setPosterBase64(draft.imageUrl);
                            setPosterPreview(draft.imageUrl);
                        }

                        if (isSignedIn) {
                            setStatusMessage("📝 Retrieved your saved gig details. Ready to submit!");
                        }

                    } catch (e) {
                        console.error("Failed to restore draft", e);
                    }
                }
                setIsRestoring(false);
            }
        };

        checkRestore();
    }, [isLoaded, isSignedIn]);


    // Fetch venues on mount
    useEffect(() => {
        fetchVenues();
    }, []);

    const fetchVenues = async () => {
        try {
            const data = await api.venues.getAll();
            if (data.venues) {
                setVenues(data.venues);
                console.log('Loaded venues:', data.venues);
            }
        } catch (error) {
            console.error('Failed to fetch venues:', error);
        }
    };

    const handleVenueInputChange = (value: string) => {
        setVenueInput(value);
        setShowVenueSuggestions(true);

        // Check if it matches an existing venue
        const match = venues.find(v => v.name.toLowerCase() === value.toLowerCase());
        if (match) {
            setSelectedVenue(match);
            setIsNewVenue(false);
        } else {
            setSelectedVenue(null);
            setIsNewVenue(value.length > 0);
        }
    };

    const handleVenueSelect = (venue: Venue) => {
        setVenueInput(venue.name);
        setSelectedVenue(venue);
        setIsNewVenue(false);
        setShowVenueSuggestions(false);
    };

    const filteredVenues = venues.filter(v =>
        v.name.toLowerCase().includes(venueInput.toLowerCase())
    ).slice(0, 5);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const tempUrl = URL.createObjectURL(file);
                setPosterPreview(tempUrl);
                const resized = await resizeImage(file);
                setPosterBase64(resized);
            } catch (err) {
                console.error("Image processing failed", err);
                alert("Could not process image.");
            }
        }
    };

    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const MAX_WIDTH = 600;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height = height * (MAX_WIDTH / width);
                        width = MAX_WIDTH;
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMessage('');

        const formData = new FormData(e.currentTarget);

        // Build payload
        const payload: any = {
            name: formData.get('name') as string,
            date: formData.get('date') as string,
            time: formData.get('time') as string,
            genre: formData.get('genre') as string,
            description: formData.get('description') as string,
            price: formData.get('price') as string,
            presale_price: formData.get('presale_price') as string,
            presale_caption: formData.get('presale_caption') as string,
            is_internal_ticketing: !!formData.get('is_internal_ticketing'),
            sell_tickets: !!formData.get('sell_tickets'),
            imageUrl: posterBase64
        };

        // Handle venue
        if (selectedVenue) {
            // Existing venue
            payload.venue_id = selectedVenue.id;
            payload.venue = selectedVenue.name; // For backward compatibility
            payload.selectedVenue = selectedVenue; // Save full obj for restore
        } else if (isNewVenue && venueInput) {
            // New venue - create it
            payload.venue = venueInput;
            payload.venueInput = venueInput;
            payload.new_venue = {
                name: venueInput,
                city: newVenueCity,
                capacity: parseInt(newVenueCapacity) || null
            };
            // Save state for restore
            payload.newVenueCity = newVenueCity;
            payload.newVenueCapacity = newVenueCapacity;
        } else {
            setStatusMessage('❌ Please select or enter a venue');
            setIsSubmitting(false);
            return;
        }

        // 🛑 AUTH CHECK: If not signed in, save state and redirect
        if (!isSignedIn) {
            try {
                // Add venue input explicitly if not captured above
                if (!payload.venueInput) payload.venueInput = venueInput;

                console.log("User not signed in. Saving draft:", payload);
                sessionStorage.setItem('GIGFINDER_DRAFT_EVENT', JSON.stringify(payload));

                // Redirect to sign up, then back here
                const returnUrl = '/gigfinder/add-event';
                router.push(`/sign-up?redirect_url=${encodeURIComponent(returnUrl)}`);
                return;
            } catch (err) {
                console.error("Failed to save draft", err);
                setStatusMessage('❌ Error: Could not save draft. Please try again or sign in first.');
                setIsSubmitting(false);
                return;
            }
        }

        try {
            const data = await api.events.create(payload);

            // ✅ Success - Clear draft
            sessionStorage.removeItem('GIGFINDER_DRAFT_EVENT');

            if (isNewVenue) {
                // Redirect with new venue message
                router.push(`/gigfinder/add-event?newVenue=${encodeURIComponent(venueInput)}`);
            } else {
                // Check if approval is needed
                if (data.needsApproval) {
                    setStatusMessage('✅ Event Submitted! Your first event requires admin approval. You\'ll be notified once it\'s live.');
                } else {
                    setStatusMessage('✅ Event Added Successfully!');
                }
                setPosterPreview('');
                setPosterBase64('');
                setVenueInput('');
                setSelectedVenue(null);
                setIsNewVenue(false);
                // Reset fields
                setNewVenueCity('');
                setNewVenueCapacity('');
                (e.target as HTMLFormElement).reset();
            }
        } catch (err) {
            console.error(err);
            if (err instanceof ApiError) {
                setStatusMessage(`❌ Error: ${err.getUserMessage()}`);
            } else {
                setStatusMessage('❌ Failed to add event');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // If still checking auth/restoring, show loading? 
    // Actually, we want to show form immediately for anon users, so we just wait for isLoaded
    if (!isLoaded) {
        return <div className={styles.loadingContainer}>Loading...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>

            {/* Status Message */}
            {statusMessage && (
                <div className={`${styles.statusMessageContainer} ${statusMessage.startsWith('✅') ? styles.statusMessageSuccess :
                    statusMessage.startsWith('❌') ? styles.statusMessageError :
                        styles.statusMessageInfo
                    }`}>
                    {statusMessage}
                </div>
            )}

            {/* Event Name */}
            <div>
                <label htmlFor="name" className={styles.label}>Event / Artist Name</label>
                <input type="text" id="name" name="name" required className={`text-input ${styles.input}`} placeholder="e.g. The Spiders from Mars" />
            </div>

            {/* Venue with Autocomplete */}
            <div className={styles.venueInputContainer}>
                <label htmlFor="venue" className={styles.label}>Venue</label>
                <input
                    type="text"
                    id="venue"
                    value={venueInput}
                    onChange={(e) => handleVenueInputChange(e.target.value)}
                    onFocus={() => setShowVenueSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowVenueSuggestions(false), 200)}
                    required
                    className={`text-input ${styles.input}`}
                    placeholder="Start typing venue name..."
                    autoComplete="off"
                />

                {/* Autocomplete Dropdown */}
                {showVenueSuggestions && venueInput && filteredVenues.length > 0 && (
                    <div className={styles.venueDropdown}>
                        {filteredVenues.map(venue => (
                            <div
                                key={venue.id}
                                onClick={() => handleVenueSelect(venue)}
                                className={styles.venueOption}
                            >
                                <div className={styles.venueOptionName}>{venue.name}</div>
                                <div className={styles.venueOptionDetails}>
                                    {venue.city || 'Unknown city'} • Capacity: {venue.capacity || 'Unknown'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* New Venue Indicator */}
                {isNewVenue && venueInput && (
                    <p className={styles.newVenueIndicator}>
                        ✨ New venue - we'll add "{venueInput}" to our database
                    </p>
                )}
            </div>

            {/* Conditional: New Venue Fields */}
            {isNewVenue && venueInput && (
                <div className={styles.newVenueSection}>
                    <h3 className={styles.newVenueTitle}>
                        New Venue Details
                    </h3>

                    <div className={styles.formGrid}>
                        <div>
                            <label className={styles.label}>
                                Town/City *
                            </label>
                            <input
                                type="text"
                                value={newVenueCity}
                                onChange={(e) => setNewVenueCity(e.target.value)}
                                required={isNewVenue}
                                className={`text-input ${styles.input}`}
                                placeholder="e.g. Edinburgh"
                            />
                        </div>

                        <div>
                            <label className={styles.label}>
                                Venue Capacity (Optional)
                            </label>
                            <input
                                type="number"
                                value={newVenueCapacity}
                                onChange={(e) => setNewVenueCapacity(e.target.value)}
                                className={`text-input ${styles.input}`}
                                placeholder="e.g. 200 (leave blank if unknown)"
                                min="1"
                                max="10000"
                            />
                        </div>
                    </div>

                    <p className={styles.newVenueHint}>
                        💡 If you don't know the capacity, leave it blank - admin will update it
                    </p>
                </div>
            )}

            {/* Date & Time */}
            <div className={styles.formGrid}>
                <div>
                    <label htmlFor="date" className={styles.label}>Date</label>
                    <input type="date" id="date" name="date" required className={`date-input ${styles.input}`} />
                </div>
                <div>
                    <label htmlFor="time" className={styles.label}>Time</label>
                    <input type="text" id="time" name="time" placeholder="20:00" className={`text-input ${styles.input}`} />
                </div>
            </div>

            {/* Genre */}
            <div>
                <label htmlFor="genre" className={styles.label}>Genre</label>
                <select id="genre" name="genre" className={`text-input ${styles.input}`}>
                    <option value="rock_blues_punk">Rock / Punk / Blues</option>
                    <option value="indie_alt">Indie / Alternative</option>
                    <option value="metal">Metal</option>
                    <option value="pop">Pop</option>
                    <option value="electronic">Electronic</option>
                    <option value="hiphop">Hip Hop</option>
                    <option value="acoustic">Acoustic / Folk</option>
                    <option value="classical">Classical</option>
                </select>
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className={styles.label}>Description</label>
                <textarea id="description" name="description" className={`text-input ${styles.textareaLarge}`} placeholder="Tell us about the gig..."></textarea>
            </div>

            {/* Price */}
            <div>
                <label htmlFor="price" className={styles.label}>Price</label>
                <div className={styles.priceInputContainer}>
                    <span className={styles.priceSymbol}>£</span>
                    <input
                        type="text"
                        id="price"
                        name="price"
                        className={`text-input ${styles.priceInput}`}
                        placeholder="10.00 or 0 for Free"
                        pattern="^\d+(\.\d{0,2})?$"
                        title="Enter a valid price (e.g., 10 or 10.50). Use 0 for free entry."
                    />
                </div>
                <p className={styles.helpText}>
                    Enter amount in £ (e.g., 10 or 10.50). Use 0 for free entry.
                </p>
            </div>

            {/* Presale Price (Optional) */}
            <div>
                <label htmlFor="presale_price" className={styles.label}>
                    Record Presale Price (Optional)
                </label>
                <div className={styles.priceInputContainer}>
                    <span className={styles.priceSymbol}>£</span>
                    <input
                        type="text"
                        id="presale_price"
                        name="presale_price"
                        className={`text-input ${styles.priceInput}`}
                        placeholder="8.00"
                        pattern="^\d+(\.\d{0,2})?$"
                        title="Enter a valid price (e.g., 8 or 8.50)"
                    />
                </div>
                <p className={styles.helpText}>
                    Discounted price for customers who pre-buy records
                </p>
            </div>

            {/* Presale Caption (Optional) */}
            <div>
                <label htmlFor="presale_caption" className={styles.label}>
                    Presale Explanation (Optional)
                </label>
                <input
                    type="text"
                    id="presale_caption"
                    name="presale_caption"
                    className={`text-input ${styles.input}`}
                    placeholder="e.g., Buy our new album and get £2 off entry!"
                    maxLength={200}
                />
                <p className={styles.helpText}>
                    Explain the presale offer (max 200 characters)
                </p>
            </div>

            {/* Image Upload */}
            <div>
                <label htmlFor="poster" className={styles.label}>
                    Gig Poster / Image (Optional)
                </label>
                <input
                    type="file"
                    id="poster"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={`text-input ${styles.imageInput}`}
                />
                {posterPreview && (
                    <div className={styles.imagePreviewWrapper}>
                        <img src={posterPreview} alt="Preview" className={styles.imagePreviewImg} />
                    </div>
                )}
            </div>

            {/* Ticketing Options */}
            <div className={styles.ticketingWrapper}>
                <label className={styles.label}>
                    Ticketing Options
                </label>

                {/* Free Guest List */}
                <div className={styles.ticketingOption}>
                    <label className={styles.ticketingCheckboxLabel}>
                        <input type="checkbox" name="is_internal_ticketing" value="true" className={styles.ticketingCheckboxPrimary} />
                        <div className={styles.ticketingTextWrapper}>
                            <span className={styles.ticketingTitlePrimary}>Enable Guest List (Free)</span>
                            <span className={styles.ticketingDescription}>Let people book free tickets directly on GigFinder.</span>
                        </div>
                    </label>
                </div>

                {/* Paid Ticket Sales */}
                <div className={styles.ticketingOptionLast}>
                    <label className={styles.ticketingCheckboxLabel}>
                        <input type="checkbox" name="sell_tickets" value="true" className={styles.ticketingCheckboxSecondary} />
                        <div className={styles.ticketingTextWrapper}>
                            <span className={styles.ticketingTitleSecondary}>Sell Tickets (Paid)</span>
                            <span className={styles.ticketingDescription}>Sell paid tickets via Stripe. Set a ticket price above.</span>
                        </div>
                    </label>
                </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isSubmitting} className={`btn-primary ${styles.submitButtonLarge}`}>
                {isSubmitting ? 'Uploading...' : 'SUBMIT GIG'}
            </button>
        </form>
    );
}

export default function AddEventPage() {
    return (
        <div className={styles.pageWrapper}>
            <header className={styles.pageHeader}>
                <h1 className={`main-title ${styles.pageTitle}`}>GIG<br />FINDER</h1>
            </header>

            <main className={`container ${styles.pageMain}`}>
                <div className={styles.pageCard}>
                    <h2 className={styles.pageCardTitle}>Add Your Event</h2>

                    <Suspense fallback={<div>Loading form...</div>}>
                        <AddEventForm />
                    </Suspense>
                </div>

                <div className={styles.pageFooter}>
                    <a href="/gigfinder" className={`btn-back ${styles.pageBackLink}`}>← Back to Finder</a>
                </div>
            </main>
        </div>
    );
}
