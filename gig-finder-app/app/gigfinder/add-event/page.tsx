'use client';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';

function AddEventForm() {
    const { isLoaded, isSignedIn } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const successParam = searchParams.get('success');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [posterPreview, setPosterPreview] = useState<string>('');
    const [posterBase64, setPosterBase64] = useState<string>('');
    const [statusMessage, setStatusMessage] = useState(successParam === 'true' ? '✅ Success! Gig added.' : '');

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in');
        }
    }, [isLoaded, isSignedIn, router]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // Initial Preview
                const tempUrl = URL.createObjectURL(file);
                setPosterPreview(tempUrl);

                // Resize and Compress
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
                    // Resize to max 600px width
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

                    // Compress to JPEG 70% quality
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

        const payload = {
            name: formData.get('name') as string,
            venue: formData.get('venue') as string,
            date: formData.get('date') as string,
            time: formData.get('time') as string,
            genre: formData.get('genre') as string,
            description: formData.get('description') as string,
            price: formData.get('price') as string,
            is_internal_ticketing: !!formData.get('is_internal_ticketing'),
            imageUrl: posterBase64 // Send logic string
        };

        try {
            const res = await fetch('/api/events/manual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Redirect logic
                router.push('/gigfinder/add-event?success=true');
                // Or just reset form
                setStatusMessage('✅ Event Added Successfully!');
                setPosterPreview('');
                setPosterBase64('');
                (e.target as HTMLFormElement).reset();
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

            {/* Venue */}
            <div>
                <label htmlFor="venue" style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-primary)', textTransform: 'uppercase' }}>Venue</label>
                <input type="text" id="venue" name="venue" required className="text-input" style={{ width: '100%' }} placeholder="e.g. Leith Depot" />
            </div>

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

            {/* Price (Optional) */}
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
                        onInput={(e) => {
                            const input = e.currentTarget;
                            // Remove any non-numeric characters except decimal point
                            let value = input.value.replace(/[^\d.]/g, '');
                            // Ensure only one decimal point
                            const parts = value.split('.');
                            if (parts.length > 2) {
                                value = parts[0] + '.' + parts.slice(1).join('');
                            }
                            // Limit to 2 decimal places
                            if (parts[1] && parts[1].length > 2) {
                                value = parts[0] + '.' + parts[1].substring(0, 2);
                            }
                            input.value = value;
                        }}
                    />
                </div>
                <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>
                    Enter amount in £ (e.g., 10 or 10.50). Use 0 for free entry.
                </p>
            </div>

            {/* Image Upload */}
            <div>
                <label htmlFor="poster" style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-primary)', textTransform: 'uppercase' }}>
                    Gig Poster / Image
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

            {/* Venue Capacity */}
            <div>
                <label htmlFor="max_capacity" style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-primary)', textTransform: 'uppercase' }}>
                    Venue Capacity
                </label>
                <input
                    type="number"
                    id="max_capacity"
                    name="max_capacity"
                    required
                    className="text-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. 100, 250, 500"
                    min="1"
                    max="10000"
                />
                <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>
                    Maximum number of people who can attend this event
                </p>
            </div>

            {/* Guest List Option */}
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px dashed #444', marginTop: '0.5rem', borderRadius: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="is_internal_ticketing" value="true" style={{ width: '24px', height: '24px', accentColor: 'var(--color-primary)' }} />
                    <div style={{ textAlign: 'left' }}>
                        <span style={{ fontFamily: 'var(--font-primary)', textTransform: 'uppercase', display: 'block', fontSize: '1.1rem', color: 'var(--color-primary)' }}>Enable Guest List?</span>
                        <span style={{ fontSize: '0.9rem', color: '#ccc' }}>Let people book a free spot directly on GigFinder.</span>
                    </div>
                </label>
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
