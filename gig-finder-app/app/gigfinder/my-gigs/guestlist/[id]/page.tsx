'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';

interface Booking {
    id: number;
    customer_name: string;
    customer_email: string;
    status: string;
    created_at: string;
}

export default function GuestListPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const eventId = unwrappedParams.id;
    const { isLoaded, isSignedIn } = useUser();
    const router = useRouter();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    // Add Guest Form State
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');

    // Email Modal State
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);

    useEffect(() => {
        if (isLoaded && !isSignedIn) router.push('/sign-in');
        if (isLoaded && isSignedIn && eventId) fetchBookings();
    }, [isLoaded, isSignedIn, eventId]);

    const fetchBookings = async () => {
        try {
            const res = await fetch(`/api/bookings?eventId=${eventId}`);
            if (res.ok) {
                const data = await res.json();
                setBookings(data.bookings);
            } else {
                console.error('Failed to load bookings');
                // You might handle 404 or 403 here
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddGuest = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId, name: newName, email: newEmail })
            });
            if (res.ok) {
                setNewName('');
                setNewEmail('');
                fetchBookings(); // Refresh list automatically
                // alert('Guest Added!'); // Silent success is cleaner, just see list update
            } else {
                const err = await res.json();
                alert('Failed to add guest: ' + err.error);
            }
        } finally {
            setAdding(false);
        }
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setSendingEmail(true);
        try {
            const res = await fetch('/api/bookings/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId, subject: emailSubject, message: emailMessage })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                setShowEmailModal(false);
                setEmailSubject('');
                setEmailMessage('');
            } else {
                alert('Error: ' + data.error);
            }
        } catch (err) {
            alert('Failed to send email');
        } finally {
            setSendingEmail(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-white" style={{ paddingTop: '100px' }}>Loading guest list...</div>;

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '3rem', background: '#0a0a0a', color: '#fff' }}>
            <header style={{ padding: '2rem', textAlign: 'center' }}>
                <h1 className="main-title" style={{ fontSize: '2.5rem', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>GUEST LIST</h1>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link href="/gigfinder/my-gigs" className="btn-back" style={{ textDecoration: 'none' }}>← Back to My Gigs</Link>
                    {bookings.length > 0 && (
                        <button onClick={() => setShowEmailModal(true)} className="btn-primary" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                            ✉️ Email Guests
                        </button>
                    )}
                </div>
            </header>

            <main className="container" style={{ maxWidth: '800px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem' }}>
                {/* Add Guest Section */}
                <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #333' }}>
                    <h3 style={{ color: 'var(--color-primary)', marginBottom: '1rem', fontFamily: 'var(--font-primary)' }}>+ Add Guest Manually</h3>
                    <form onSubmit={handleAddGuest} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            placeholder="Guest Name"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            required
                            className="text-input"
                            style={{ flex: 1, minWidth: '200px', padding: '0.8rem', background: '#000', border: '1px solid #444', color: 'white' }}
                        />
                        <input
                            type="email"
                            placeholder="Guest Email"
                            value={newEmail}
                            onChange={e => setNewEmail(e.target.value)}
                            required
                            className="text-input"
                            style={{ flex: 1, minWidth: '200px', padding: '0.8rem', background: '#000', border: '1px solid #444', color: 'white' }}
                        />
                        <button type="submit" disabled={adding} className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                            {adding ? 'Adding...' : 'Add'}
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: '8px', border: '1px solid #333' }}>
                    <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem', fontFamily: 'var(--font-primary)' }}>
                        Total Names: {bookings.length}
                    </h2>

                    {bookings.length === 0 ? (
                        <p style={{ color: '#888', fontStyle: 'italic' }}>No names on the list yet.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #555' }}>
                                        <th style={{ padding: '1rem' }}>Name</th>
                                        <th style={{ padding: '1rem' }}>Email</th>
                                        <th style={{ padding: '1rem' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => (
                                        <tr key={b.id} style={{ borderBottom: '1px solid #222' }}>
                                            <td style={{ padding: '1rem' }}>{b.customer_name}</td>
                                            <td style={{ padding: '1rem', color: '#aaa' }}>{b.customer_email}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px',
                                                    background: '#113311',
                                                    color: '#44ff44',
                                                    fontSize: '0.8rem',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Email Modal */}
                {showEmailModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{ background: '#222', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '500px', border: '1px solid var(--color-primary)' }}>
                            <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Email All Guests</h2>
                            <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Subject"
                                    value={emailSubject}
                                    onChange={e => setEmailSubject(e.target.value)}
                                    required
                                    className="text-input"
                                    style={{ width: '100%' }}
                                />
                                <textarea
                                    placeholder="Message..."
                                    value={emailMessage}
                                    onChange={e => setEmailMessage(e.target.value)}
                                    required
                                    className="text-input"
                                    style={{ width: '100%', minHeight: '150px' }}
                                ></textarea>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    <button type="button" onClick={() => setShowEmailModal(false)} className="btn-back" style={{ border: 'none', background: 'none', textDecoration: 'underline' }}>Cancel</button>
                                    <button type="submit" disabled={sendingEmail} className="btn-primary">
                                        {sendingEmail ? 'Sending...' : 'Send Broadcast'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
