'use client';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function AddEventForm() {
    const { isLoaded, isSignedIn } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const success = searchParams.get('success');

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in');
        }
    }, [isLoaded, isSignedIn, router]);

    if (!isLoaded || !isSignedIn) {
        return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
    }

    return (
        <form action="/api/events/manual" method="POST" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Status Message */}
            {success === 'true' && (
                <div style={{
                    padding: '1rem',
                    background: 'var(--color-secondary)',
                    color: 'var(--color-bg)',
                    fontFamily: 'var(--font-primary)',
                    textAlign: 'center'
                }}>
                    ✅ Success! Gig added.
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
                <input type="text" id="price" name="price" className="text-input" style={{ width: '100%' }} placeholder="e.g. £10 or Free" />
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
                SUBMIT GIG
            </button>
        </form>
    );
}

export default function AddEventPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
            <link rel="stylesheet" href="/gigfinder/style.css?v=99" />

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
