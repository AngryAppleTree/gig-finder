'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import styles from './GuestList.module.css';

interface Booking {
    id: number;
    customer_name: string;
    customer_email: string;
    quantity: number;
    records_quantity?: number;
    records_price?: number;
    platform_fee?: number;
    status: string;
    created_at: string;
    checked_in_at?: string | null;
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
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={`main-title ${styles.title}`}>GUEST LIST</h1>
                <div className={styles.headerActions}>
                    <Link href="/gigfinder/my-gigs" className={`btn-back ${styles.backLink}`}>← Back to My Gigs</Link>

                    {bookings.length > 0 && (
                        <button onClick={() => setShowEmailModal(true)} className={`btn-primary ${styles.emailButton}`}>
                            ✉️ Email Guests
                        </button>
                    )}

                    {bookings.length > 0 && (
                        <Link href={`/gigfinder/my-gigs/scan/${eventId}`} className={`btn-primary ${styles.scanButton}`}>
                            📷 Scan Tickets
                        </Link>
                    )}
                </div>
            </header>

            <main className={`container ${styles.main}`} role="main">
                {/* Add Guest Section */}
                <div className={styles.addGuestSection}>
                    <h3 className={styles.addGuestTitle}>+ Add Guest Manually</h3>
                    <form onSubmit={handleAddGuest} className={styles.addGuestForm}>
                        <input
                            type="text"
                            placeholder="Guest Name"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            required
                            className={`text-input ${styles.guestInput}`}
                        />
                        <input
                            type="email"
                            placeholder="Guest Email"
                            value={newEmail}
                            onChange={e => setNewEmail(e.target.value)}
                            required
                            className={`text-input ${styles.guestInput}`}
                        />
                        <button type="submit" disabled={adding} className={`btn-primary ${styles.addButton}`}>
                            {adding ? 'Adding...' : 'Add'}
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className={styles.guestListSection}>
                    <h2 className={styles.guestListTitle}>
                        Total Names: {bookings.length}
                    </h2>

                    {bookings.length === 0 ? (
                        <p className={styles.emptyMessage}>No names on the list yet.</p>
                    ) : (
                        <div className={styles.guestListItems}>
                            {bookings.map(b => (
                                <div key={b.id} className={`${styles.guestItem} ${b.checked_in_at ? styles.checkedIn : ''}`}>
                                    <div className={styles.guestItemHeader}>
                                        <div className={styles.guestInfo}>
                                            <div className={styles.guestName}>
                                                {b.customer_name}
                                            </div>
                                            <div className={styles.guestEmail}>
                                                {b.customer_email}
                                            </div>
                                        </div>
                                        <span className={`${styles.statusBadge} ${b.checked_in_at ? styles.checkedIn : styles.notScanned}`}>
                                            {b.checked_in_at ? '✓ CHECKED IN' : 'NOT SCANNED'}
                                        </span>
                                    </div>

                                    <div className={styles.guestItemDetails}>
                                        <div>
                                            <div className={styles.detailLabel}>Tickets</div>
                                            <div className={styles.ticketCount}>
                                                🎟️ {b.quantity || 1}
                                            </div>
                                        </div>
                                        {b.records_quantity && b.records_quantity > 0 && (
                                            <div>
                                                <div className={styles.detailLabel}>Records</div>
                                                <div className={styles.recordCount}>
                                                    💿 {b.records_quantity}
                                                </div>
                                            </div>
                                        )}
                                        {b.checked_in_at && (
                                            <div>
                                                <div className={styles.detailLabel}>Checked In</div>
                                                <div className={styles.checkInTime}>
                                                    {new Date(b.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Email Modal */}
                {showEmailModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h2 className={styles.modalTitle}>Email All Guests</h2>
                            <form onSubmit={handleSendEmail} className={styles.modalForm}>
                                <input
                                    type="text"
                                    placeholder="Subject"
                                    value={emailSubject}
                                    onChange={e => setEmailSubject(e.target.value)}
                                    required
                                    className={`text-input ${styles.modalInput}`}
                                />
                                <textarea
                                    placeholder="Message..."
                                    value={emailMessage}
                                    onChange={e => setEmailMessage(e.target.value)}
                                    required
                                    className={`text-input ${styles.modalTextarea}`}
                                ></textarea>
                                <div className={styles.modalActions}>
                                    <button type="button" onClick={() => setShowEmailModal(false)} className={`btn-back ${styles.cancelButton}`}>Cancel</button>
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
