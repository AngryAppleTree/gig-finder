"use client";
import React, { useEffect, useState } from 'react';

interface Event {
    id: number;
    date: string;
    name: string;
    venue: string;
    user_id: string;
    is_internal_ticketing?: boolean;
}

export default function AdminEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/events');
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events);
            } else {
                const err = await res.json();
                setError(err.error || `Error ${res.status}: ${res.statusText}`);
            }
        } catch (e) {
            setError('Failed to fetch events');
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const deleteEvent = async (id: number) => {
        if (!confirm('Are you sure?')) return;

        const res = await fetch('/api/admin/events', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        if (res.ok) {
            fetchEvents(); // Refresh
        } else {
            alert('Delete failed');
        }
    };

    const toggleTicketing = async (id: number, current: boolean) => {
        const res = await fetch('/api/admin/events', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, isInternalTicketing: !current })
        });
        if (res.ok) {
            fetchEvents();
        } else {
            alert('Update failed');
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Event Management</h2>
                <div className="flex gap-2">
                    <a href="/admin/events/new" className="text-sm bg-purple-600 px-3 py-1 rounded hover:bg-purple-500 text-white flex items-center">
                        + New Event
                    </a>
                    <button onClick={fetchEvents} className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">Refresh</button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center p-8">Loading events...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead>
                            <tr>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-left">Event</th>
                                <th className="px-4 py-3 text-left">Venue</th>
                                <th className="px-4 py-3 text-center">Ticketing</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {events.map((evt) => (
                                <tr key={evt.id} className="hover:bg-gray-700/50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        {new Date(evt.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium">{evt.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-400">{evt.venue}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => toggleTicketing(evt.id, !!evt.is_internal_ticketing)}
                                            className={`px-2 py-1 text-xs rounded border ${evt.is_internal_ticketing ? 'bg-green-600 border-green-500 text-white' : 'bg-transparent border-gray-600 text-gray-400'}`}
                                        >
                                            {evt.is_internal_ticketing ? 'Active' : 'Enable'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <button
                                            onClick={() => deleteEvent(evt.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {events.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-4">No events found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
