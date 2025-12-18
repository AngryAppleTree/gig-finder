'use client';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';

interface Venue {
    id: number;
    name: string;
    city?: string;
    capacity?: number;
}

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

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in');
        }
    }, [isLoaded, isSignedIn, router]);

    // Show success message for new venue
    useEffect(() => {
        if (newVenueParam) {
            setStatusMessage(`✅ Thanks for submitting a gig! We have notified the admin so they can add the new venue as "${newVenueParam}" was not yet on our radar.`);
        }
    }, [newVenueParam]);

    // Fetch venues on mount
    useEffect(() => {
        fetchVenues();
    }, []);

    const fetchVenues = async () => {
        try {
            const res = await fetch('/api/venues');
            const data = await res.json();
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
        } else if (isNewVenue && venueInput) {
            // New venue - create it
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
            const res = await fetch('/api/events/manual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                if (isNewVenue) {
                    // Redirect with new venue message
                    router.push(`/gigfinder/add-event?newVenue=${encodeURIComponent(venueInput)}`);
                } else {
                    // Normal success
                    setStatusMessage('✅ Event Added Successfully!');
                    setPosterPreview('');
                    setPosterBase64('');
                    setVenueInput('');
                    setSelectedVenue(null);
                    setIsNewVenue(false);
                    (e.target as HTMLFormElement).reset();
                }
            } else {
                const data = await res.json();
                setStatusMessage(`❌ Error: ${data.error || 'Failed to add event'}`);
            }
        } catch (err) {
            setStatusMessage('❌ Network Error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isLoaded || !isSignedIn) {
        return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Status Message */}
            {statusMessage && (
                <div style={{
                    padding: '1rem',
                    background: statusMessage.startsWith('✅') ? 'var(--color-secondary)' : '#511',
                    color: 'white',
                    fontFamily: 'var(--font-primary)',
                    textAlign: 'center',
                    borderRadius: '4px'
                }}>
                    {statusMessage}
                </div>
            )}

            {/* Event Name */}
            <div>
                <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-primary)', textTransform: 'uppercase' }}>Event / Artist Name</label>
                <input type="text" id="name" name="name" required className="text-input" style={{ width: '100%' }} placeholder="e.g. The Spiders from Mars" />
            </div>

            {/* Venue with Autocomplete */}
            <div style={{ position: 'relative' }}>
                <label htmlFor="venue" style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-primary)', textTransform: 'uppercase' }}>Venue</label>
                <input
                    type="text"
                    id="venue"
                    value={venueInput}
                    onChange={(e) => handleVenueInputChange(e.target.value)}
                    onFocus={() => setShowVenueSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowVenueSuggestions(false), 200)}
                    required
                    className="text-input"
                    style={{ width: '100%' }}
                    placeholder="Start typing venue name..."
                    autoComplete="off"
                />

                {/* Autocomplete Dropdown */}
                {showVenueSuggestions && venueInput && filteredVenues.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#222',
                        border: '1px solid var(--color-primary)',
                        borderRadius: '4px',
                        marginTop: '4px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 1000
                    }}>
                        {filteredVenues.map(venue => (
                            <div
                                key={venue.id}
                                onClick={() => handleVenueSelect(venue)}
                                style={{
                                    padding: '0.75rem',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #333',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ fontWeight: 'bold' }}>{venue.name}</div>
                                <div style={{ fontSize: '0.85rem', color: '#888' }}>
                                    {venue.city || 'Unknown city'} • Capacity: {venue.capacity || 'Unknown'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* New Venue Indicator */}
                {isNewVenue && venueInput && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', marginTop: '0.5rem' }}>
                        ✨ New venue - we'll add "{venueInput}" to our database
                    </p>
                )}
            </div>

            {/* Conditional: New Venue Fields */}
            {isNewVenue && venueInput && (
                <div style={{
                    padding: '1rem',
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '2px solid var(--color-secondary)',
                    borderRadius: '8px'
                }}>
                    <h3 style={{
                        fontFamily: 'var(--font-primary)',
                        fontSize: '1.2rem',
                        marginBottom: '1rem',
                        color: 'var(--color-secondary)'
                    }}>
                        New Venue Details
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-primary)', textTransform: 'uppercase' }}>
                                Town/City *
                            </label>
                            <input
                                type="text"
                                value={newVenueCity}
                                onChange={(e) => setNewVenueCity(e.target.value)}
                                required={isNewVenue}
                                className="text-input"
                                style={{ width: '100%' }}
                                placeholder="e.g. Edinburgh"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-primary)', textTransform: 'uppercase' }}>
                                Venue Capacity *
                            </label>
                            <input
                                type="number"
                                value={newVenueCapacity}
                                onChange={(e) => setNewVenueCapacity(e.target.value)}
                                required={isNewVenue}
                                className="text-input"
                                style={{ width: '100%' }}
                                placeholder="e.g. 200"
                                min="1"
                                max="10000"
                            />
                        </div>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: '#ccc', marginTop: '0.5rem' }}>
                        💡 This information helps us categorize the venue correctly
                    </p>
                </div>
            )}

            {/* Date & Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label htmlFor="date" style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-primary)', textTransform: 'uppercase' }}>Date</label>
                    <input type="date" id="date" name="date" required className="date-input" style={{ width: '100%' }} />
                </div>
                <div>
                    <label htmlFor="time" style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-primary)', textTransform: 'uppercase' }}>Time</label>
                    <input type="text" id="time" name="time" placeholder="20:00" className="text-input" style={{ width: '100%' }} />
                </div>
            </div>

            {/* Genre */}
            <div>
                <label htmlFor="genre" style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-primary)', textTransform: 'uppercase' }}>Genre</label>
                <select id="genre" name="genre" className="text-input" style={{ width: '100%' }}>
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
                <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-primary)', textTransform: 'uppercase' }}>Description</label>
                <textarea id="description" name="description" className="text-input" style={{ width: '100%', minHeight: '100px', textTransform: 'none' }} placeholder="Tell us about the gig..."></textarea>
            </div>

            {/* Price */}
            <div>
                <label htmlFor="price" style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-primary)', textTransform: 'uppercase' }}>Price</label>
                <div style={{ position: 'relative' }}>
                    <span style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-primary)',
                        fontFamily: 'var(--font-primary)',
                        fontSize: '1.2rem',
                        pointerEvents: 'none'
                    }}>£</span>
                    <input
                        type="text"
                        id="price"
                        name="price"
                        className="text-input"
                        style={{ width: '100%', paddingLeft: '32px' }}
                        placeholder="10.00 or 0 for Free"
                        pattern="^\d+(\.\d{0,2})?$"
                        title="Enter a valid price (e.g., 10 or 10.50). Use 0 for free entry."
                    />
                </div>
                <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>
                    Enter amount in £ (e.g., 10 or 10.50). Use 0 for free entry.
                </p>
            </div>

            {/* Presale Price (Optional) */}
            <div>
                <label htmlFor="presale_price" style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-primary)', textTransform: 'uppercase' }}>
                    Record Presale Price (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                    <span style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-primary)',
                        fontFamily: 'var(--font-primary)',
                        fontSize: '1.2rem',
                        pointerEvents: 'none'
                    }}>£</span>
                    <input
                        type="text"
                        id="presale_price"
                        name="presale_price"
                        className="text-input"
                        style={{ width: '100%', paddingLeft: '32px' }}
                        placeholder="8.00"
                        pattern="^\d+(\.\d{0,2})?$"
                        title="Enter a valid price (e.g., 8 or 8.50)"
                    />
                </div>
                <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>
                    Discounted price for customers who pre-buy records
                </p>
            </div>

            {/* Presale Caption (Optional) */}
            <div>
                <label htmlFor="presale_caption" style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-primary)', textTransform: 'uppercase' }}>
                    Presale Explanation (Optional)
                </label>
                <input
                    type="text"
                    id="presale_caption"
                    name="presale_caption"
                    className="text-input"
                    style={{ width: '100%' }}
                    placeholder="e.g., Buy our new album and get £2 off entry!"
                    maxLength={200}
                />
                <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>
                    Explain the presale offer (max 200 characters)
                </p>
            </div>

            {/* Image Upload */}
            <div>
                <label htmlFor="poster" style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-primary)', textTransform: 'uppercase' }}>
                    Gig Poster / Image (Optional)
                </label>
                <input
                    type="file"
                    id="poster"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-input"
                    style={{ width: '100%', padding: '0.5rem' }}
                />
                {posterPreview && (
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <img src={posterPreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', border: '2px solid #555' }} />
                    </div>
                )}
            </div>

            {/* Ticketing Options */}
            <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-primary)', textTransform: 'uppercase' }}>
                    Ticketing Options
                </label>

                {/* Free Guest List */}
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px dashed #444', marginBottom: '0.5rem', borderRadius: '4px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                        <input type="checkbox" name="is_internal_ticketing" value="true" style={{ width: '24px', height: '24px', accentColor: 'var(--color-primary)' }} />
                        <div style={{ textAlign: 'left' }}>
                            <span style={{ fontFamily: 'var(--font-primary)', textTransform: 'uppercase', display: 'block', fontSize: '1.1rem', color: 'var(--color-primary)' }}>Enable Guest List (Free)</span>
                            <span style={{ fontSize: '0.9rem', color: '#ccc' }}>Let people book free tickets directly on GigFinder.</span>
                        </div>
                    </label>
                </div>

                {/* Paid Ticket Sales */}
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px dashed #444', borderRadius: '4px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                        <input type="checkbox" name="sell_tickets" value="true" style={{ width: '24px', height: '24px', accentColor: 'var(--color-secondary)' }} />
                        <div style={{ textAlign: 'left' }}>
                            <span style={{ fontFamily: 'var(--font-primary)', textTransform: 'uppercase', display: 'block', fontSize: '1.1rem', color: 'var(--color-secondary)' }}>Sell Tickets (Paid)</span>
                            <span style={{ fontSize: '0.9rem', color: '#ccc' }}>Sell paid tickets via Stripe. Set a ticket price above.</span>
                        </div>
                    </label>
                </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
                {isSubmitting ? 'Uploading...' : 'SUBMIT GIG'}
            </button>
        </form>
    );
}

export default function AddEventPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
            <header style={{ padding: '1rem', textAlign: 'left' }}>
                <h1 className="main-title" style={{ position: 'relative', margin: '0', fontSize: '3rem' }}>GIG<br />FINDER</h1>
            </header>

            <main className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
                <div style={{ background: 'var(--color-surface)', padding: '2rem', border: '3px solid var(--color-border)', boxShadow: '8px 8px 0 var(--color-primary)' }}>
                    <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center', textTransform: 'uppercase' }}>Add Your Event</h2>

                    <Suspense fallback={<div>Loading form...</div>}>
                        <AddEventForm />
                    </Suspense>
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <a href="/gigfinder" className="btn-back" style={{ textDecoration: 'none' }}>← Back to Finder</a>
                </div>
            </main>
        </div>
    );
}
