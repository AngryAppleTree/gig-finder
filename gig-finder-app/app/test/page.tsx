'use client';

import { useState, useEffect } from 'react';

interface GigEvent {
    id: number;
    name: string;
    location: string;
    date: string;
    time: string;
    price: string;
    ticketUrl: string;
    vibe: string;
    source: string;
}

export default function TestPage() {
    const [events, setEvents] = useState<GigEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState('Edinburgh');

    useEffect(() => {
        fetchEvents();
    }, [location]);

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/events?location=${location}`);
            const data = await response.json();

            if (data.error) {
                setError(data.error);
            } else {
                setEvents(data.events || []);
            }
        } catch (err) {
            setError('Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                🎸 Skiddle API Test
            </h1>

            <div style={{ marginBottom: '2rem' }}>
                <label style={{ marginRight: '1rem' }}>
                    Location:
                    <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        style={{ marginLeft: '0.5rem', padding: '0.5rem', fontSize: '1rem' }}
                    >
                        <option value="Edinburgh">Edinburgh</option>
                        <option value="Glasgow">Glasgow</option>
                    </select>
                </label>
                <button
                    onClick={fetchEvents}
                    style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}
                >
                    Refresh
                </button>
            </div>

            {loading && <p>Loading events...</p>}

            {error && (
                <div style={{
                    padding: '1rem',
                    background: '#fee',
                    border: '1px solid #fcc',
                    borderRadius: '4px',
                    marginBottom: '1rem'
                }}>
                    <strong>Error:</strong> {error}
                    <br />
                    <small>Make sure you've added your Skiddle API key to .env.local</small>
                </div>
            )}

            {!loading && !error && (
                <>
                    <h2 style={{ marginBottom: '1rem' }}>
                        Found {events.length} events in {location}
                    </h2>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {events.map((event) => (
                            <div
                                key={event.id}
                                style={{
                                    border: '2px solid #333',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    background: '#f9f9f9'
                                }}
                            >
                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>
                                    {event.name}
                                </h3>
                                <p style={{ margin: '0.25rem 0' }}>
                                    <strong>📍 Venue:</strong> {event.location}
                                </p>
                                <p style={{ margin: '0.25rem 0' }}>
                                    <strong>📅 Date:</strong> {event.date} at {event.time}
                                </p>
                                <p style={{ margin: '0.25rem 0' }}>
                                    <strong>💰 Price:</strong> {event.price}
                                </p>
                                <p style={{ margin: '0.25rem 0' }}>
                                    <strong>🎵 Genre:</strong> {event.vibe.replace(/_/g, ' ')}
                                </p>
                                <p style={{ margin: '0.25rem 0' }}>
                                    <strong>🔗 Source:</strong> {event.source}
                                </p>
                                {event.ticketUrl && (
                                    <a
                                        href={event.ticketUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-block',
                                            marginTop: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            background: '#007bff',
                                            color: 'white',
                                            textDecoration: 'none',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        Get Tickets
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
