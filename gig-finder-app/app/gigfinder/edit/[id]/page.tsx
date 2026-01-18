'use client';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, Suspense, useState, use } from 'react';
import styles from './edit-event.module.css';

interface Venue {
    id: number;
    name: string;
    city?: string;
    capacity?: number;
}

function EditEventForm({ eventId }: { eventId: string }) {
    const { isLoaded, isSignedIn } = useUser();
    const router = useRouter();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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

    // Booking count for validation
    const [bookingsCount, setBookingsCount] = useState(0);


    // Form data state
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        time: '',
        genre: '',
        description: '',
        price: '',
        presale_price: '',
        presale_caption: '',
        is_internal_ticketing: false,
        sell_tickets: false
    });

    // Redirect if not signed in
    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in');
        }
    }, [isLoaded, isSignedIn]);

    // Fetch venues on mount
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchVenues();
            fetchEventData();
        }
    }, [isLoaded, isSignedIn, eventId]);

    const fetchVenues = async () => {
        try {
            const res = await fetch('/api/venues');
            const data = await res.json();
            if (data.venues) {
                setVenues(data.venues);
            }
        } catch (error) {
            console.error('Failed to fetch venues:', error);
        }
    };

    const fetchEventData = async () => {
        try {
            const res = await fetch(`/api/events/user?id=${eventId}`);

            console.log('Fetch response status:', res.status);

            if (!res.ok) {
                const errorText = await res.text();
                console.error('API Error:', res.status, errorText);
                throw new Error(`Failed to load event (${res.status}): ${errorText}`);
            }

            const data = await res.json();
            console.log('Event data received:', data);

            if (data.event) {
                const event = data.event;

                // Parse date/time
                const dateObj = new Date(event.date);
                const dateStr = dateObj.toISOString().split('T')[0];
                const timeStr = dateObj.toTimeString().slice(0, 5);

                // Set form data
                setFormData({
                    name: event.name || '',
                    date: dateStr,
                    time: timeStr,
                    genre: event.genre || 'rock_blues_punk',
                    description: event.description || '',
                    price: (event.price || '').replace(/£/g, '').trim(),
                    presale_price: (event.presale_price?.toString() || '').replace(/£/g, '').trim(),
                    presale_caption: event.presale_caption || '',
                    is_internal_ticketing: event.is_internal_ticketing || false,
                    sell_tickets: event.sell_tickets || false
                });

                // Set venue
                setVenueInput(event.venue || '');
                if (event.venue_id) {
                    const venue = { id: event.venue_id, name: event.venue };
                    setSelectedVenue(venue);
                    setIsNewVenue(false);
                }

                // Set image if exists
                if (event.image_url) {
                    setPosterPreview(event.image_url);
                    setPosterBase64(event.image_url);
                }

                // Set booking count
                setBookingsCount(event.bookings_count || 0);

            }
        } catch (err) {
            console.error('Failed to fetch event:', err);
            setStatusMessage(`❌ Could not load event data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVenueInputChange = (value: string) => {
        setVenueInput(value);
        setShowVenueSuggestions(true);

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

        const formDataObj = new FormData(e.currentTarget);

        // Build payload
        const payload: any = {
            id: eventId,
            name: formDataObj.get('name') as string,
            date: formDataObj.get('date') as string,
            time: formDataObj.get('time') as string,
            genre: formDataObj.get('genre') as string,
            description: formDataObj.get('description') as string,
            price: formDataObj.get('price') as string,
            presale_price: formDataObj.get('presale_price') as string,
            presale_caption: formDataObj.get('presale_caption') as string,
            is_internal_ticketing: !!formDataObj.get('is_internal_ticketing'),
            sell_tickets: !!formDataObj.get('sell_tickets'),
            imageUrl: posterBase64
        };

        // Handle venue
        if (selectedVenue) {
            payload.venue_id = selectedVenue.id;
            payload.venue = selectedVenue.name;
        } else if (isNewVenue && venueInput) {
            payload.venue = venueInput;
            payload.new_venue = {
                name: venueInput,
                city: newVenueCity,
                capacity: parseInt(newVenueCapacity) || null
            };
        } else {
            setStatusMessage('❌ Please select or enter a venue');
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await fetch('/api/events/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setStatusMessage('✅ Event Updated Successfully!');
                setTimeout(() => router.push('/gigfinder/my-gigs'), 1500);
            } else {
                const data = await res.json();
                setStatusMessage(`❌ Error: ${data.error || 'Failed to update event'}`);
            }
        } catch (err) {
            setStatusMessage('❌ Network Error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isLoaded || isLoading) {
        return <div className={styles.loadingContainer}>Loading...</div>;
    }

    // Check if ticketing can be disabled (any bookings exist)
    const canDisableTicketing = bookingsCount === 0;


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
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className={`text-input ${styles.input}`}
                    defaultValue={formData.name}
                />
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

                    <div className={styles.newVenueGrid}>
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
                    <input
                        type="date"
                        id="date"
                        name="date"
                        required
                        className={`date-input ${styles.input}`}
                        defaultValue={formData.date}
                    />
                </div>
                <div>
                    <label htmlFor="time" className={styles.label}>Time</label>
                    <input
                        type="text"
                        id="time"
                        name="time"
                        placeholder="20:00"
                        className={`text-input ${styles.input}`}
                        defaultValue={formData.time}
                    />
                </div>
            </div>

            {/* Genre */}
            <div>
                <label htmlFor="genre" className={styles.label}>Genre</label>
                <select
                    id="genre"
                    name="genre"
                    className={`text-input ${styles.input}`}
                    defaultValue={formData.genre}
                >
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
                <textarea
                    id="description"
                    name="description"
                    className={`text-input ${styles.textareaLarge}`}
                    placeholder="Tell us about the gig..."
                    defaultValue={formData.description}
                ></textarea>
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
                        defaultValue={formData.price}
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
                        defaultValue={formData.presale_price}
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
                    defaultValue={formData.presale_caption}
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
                    <label className={canDisableTicketing ? styles.ticketingLabelEnabled : styles.ticketingLabelDisabled}>
                        <input
                            type="checkbox"
                            name="is_internal_ticketing"
                            value="true"
                            className={styles.ticketingCheckboxPrimary}
                            defaultChecked={formData.is_internal_ticketing}
                            disabled={!canDisableTicketing && formData.is_internal_ticketing}
                        />
                        <div className={styles.ticketingTextWrapper}>
                            <span className={styles.ticketingTitlePrimary}>Enable Guest List (Free)</span>
                            <span className={styles.ticketingDescription}>Let people book free tickets directly on GigFinder.</span>
                            {!canDisableTicketing && formData.is_internal_ticketing && (
                                <span className={styles.warningText}>
                                    ⚠️ Cannot disable - {bookingsCount} booking{bookingsCount !== 1 ? 's' : ''} exist
                                </span>
                            )}
                        </div>
                    </label>
                </div>

                {/* Paid Ticket Sales */}
                <div className={styles.ticketingOptionLast}>
                    <label className={canDisableTicketing ? styles.ticketingLabelEnabled : styles.ticketingLabelDisabled}>
                        <input
                            type="checkbox"
                            name="sell_tickets"
                            value="true"
                            className={styles.ticketingCheckboxSecondary}
                            defaultChecked={formData.sell_tickets}
                            disabled={!canDisableTicketing && formData.sell_tickets}
                        />
                        <div className={styles.ticketingTextWrapper}>
                            <span className={styles.ticketingTitleSecondary}>Sell Tickets (Paid)</span>
                            <span className={styles.ticketingDescription}>Sell paid tickets via Stripe. Set a ticket price above.</span>
                            {!canDisableTicketing && formData.sell_tickets && (
                                <span className={styles.warningText}>
                                    ⚠️ Cannot disable - {bookingsCount} booking{bookingsCount !== 1 ? 's' : ''} exist
                                </span>
                            )}
                        </div>
                    </label>
                </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isSubmitting} className={`btn-primary ${styles.submitButtonLarge}`}>
                {isSubmitting ? 'Updating...' : 'UPDATE EVENT'}
            </button>

            {/* Cancel Button */}
            <button
                type="button"
                onClick={() => router.push('/gigfinder/my-gigs')}
                className={`btn-back ${styles.cancelButton}`}
            >
                Cancel
            </button>
        </form>
    );
}

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const eventId = unwrappedParams.id;

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.pageHeader}>
                <h1 className={`main-title ${styles.pageTitle}`}>GIG<br />FINDER</h1>
            </header>

            <main className={`container ${styles.pageMain}`}>
                <div className={styles.pageCard}>
                    <h2 className={styles.pageCardTitle}>Edit Event</h2>

                    <Suspense fallback={<div>Loading form...</div>}>
                        <EditEventForm eventId={eventId} />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}
