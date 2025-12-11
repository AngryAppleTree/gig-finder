'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, use } from 'react';

// Reusing form interface logic
interface EventFormState {
    name: string;
    venue: string;
    date: string;
    time: string;
    genre: string;
    description: string;
    price: string;
    ticketUrl: string;
    isInternalTicketing: boolean;
}

export default function EditGigPage({ params }: { params: Promise<{ id: string }> }) {
    // Correctly unwrap params using React.use() in Next.js 15+
    const unwrappedParams = use(params);
    const eventId = unwrappedParams.id;

    const { isLoaded, isSignedIn } = useUser();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState<EventFormState>({
        name: '',
        venue: '',
        date: '',
        time: '',
        genre: '',
        description: '',
        price: '',
        ticketUrl: '',
        isInternalTicketing: false
    });

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in');
            return;
        }
        if (isLoaded && isSignedIn) {
            fetchGigDetails();
        }
    }, [isLoaded, isSignedIn, eventId]);

    const fetchGigDetails = async () => {
        try {
            const res = await fetch(`/api/events/user?id=${eventId}`);
            if (!res.ok) throw new Error('Failed to load gig details');
            const data = await res.json();

            if (data.event) {
                // Determine Date/Time splitting from timestamp
                // Timestamp from DB usually ISO string "2024-12-25T20:00:00.000Z"
                const dateObj = new Date(data.event.date);
                const dateStr = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
                const timeStr = dateObj.toTimeString().slice(0, 5); // HH:MM

                setFormData({
                    name: data.event.name,
                    venue: data.event.venue,
                    date: dateStr,
                    time: timeStr,
                    genre: data.event.genre || '',
                    description: data.event.description || '',
                    price: data.event.price || '',
                    ticketUrl: data.event.ticket_url || '',
                    isInternalTicketing: data.event.is_internal_ticketing || false
                });
            }
        } catch (err) {
            console.error(err);
            setError('Could not find gig.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/events/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: eventId,
                    ...formData
                })
            });

            if (res.ok) {
                router.push('/gigfinder/my-gigs');
            } else {
                const errData = await res.json();
                setError(errData.error || 'Failed to update gig');
            }
        } catch (err) {
            console.error(err);
            setError('Something went wrong.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-white text-center p-10">Loading...</div>;

    if (error) return (
        <div className="text-white text-center p-10">
            <h2>Error: {error}</h2>
            <Link href="/gigfinder/my-gigs" className="btn-back">Go Back</Link>
        </div>
    );

    return (
        <div style={{ paddingBottom: '50px' }}>
            <header style={{ padding: '1rem', textAlign: 'center' }}>
                <h1 className="main-title" style={{ position: 'relative', margin: '0 0 2rem 0', fontSize: '2.5rem', top: 'auto', left: 'auto' }}>
                    EDIT GIG
                </h1>
            </header>

            <main className="container" style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--color-surface)', padding: '2rem', border: '3px solid var(--color-border)', boxShadow: '8px 8px 0 var(--color-primary)' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="form-group">
                        <label className="form-label">Band / Event Name</label>
                        <input type="text" name="name" className="text-input" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Venue</label>
                        <input type="text" name="venue" className="text-input" value={formData.venue} onChange={handleChange} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input type="date" name="date" className="date-input" value={formData.date} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Time</label>
                            <input type="time" name="time" className="text-input" value={formData.time} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Genre</label>
                        <select name="genre" className="text-input" style={{ width: '100%', height: '50px' }} value={formData.genre} onChange={handleChange} required>
                            <option value="">Select Genre...</option>
                            <option value="Rock">Rock / Punk</option>
                            <option value="Indie">Indie / Alt</option>
                            <option value="Metal">Metal</option>
                            <option value="Pop">Pop</option>
                            <option value="Electronic">Electronic</option>
                            <option value="HipHop">Hip Hop</option>
                            <option value="Acoustic">Acoustic / Folk</option>
                            <option value="Jazz">Jazz / Soul</option>
                            <option value="Classical">Classical</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Lineup / Description</label>
                        <textarea name="description" className="text-input" style={{ minHeight: '100px' }} value={formData.description} onChange={handleChange} placeholder="Who's playing?"></textarea>
                    </div>

                    <div className="form-group">
                        <input type="text" name="price" className="text-input" value={formData.price} onChange={handleChange} placeholder="e.g. 10.00 or Free" />
                    </div>

                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px dashed #444', borderRadius: '4px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="isInternalTicketing"
                                checked={formData.isInternalTicketing}
                                onChange={handleChange}
                                style={{ width: '24px', height: '24px', accentColor: 'var(--color-primary)' }}
                            />
                            <div style={{ textAlign: 'left' }}>
                                <span style={{ fontFamily: 'var(--font-primary)', textTransform: 'uppercase', display: 'block', fontSize: '1.1rem', color: 'var(--color-primary)' }}>GigFinder Guest List</span>
                                <span style={{ fontSize: '0.9rem', color: '#ccc' }}>Enable free bookings directly on the app.</span>
                            </div>
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={submitting}>
                            {submitting ? 'UPDATING...' : 'UPDATE GIG'}
                        </button>
                        <Link href="/gigfinder/my-gigs" className="btn-back" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            CANCEL
                        </Link>
                    </div>
                </form>
            </main>
        </div>
    );
}
