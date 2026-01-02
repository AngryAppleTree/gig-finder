'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Venue {
    id: number;
    name: string;
}

interface EventData {
    id?: number;
    name: string;
    venueId: string;
    date: string;
    time: string;
    price: string;
    ticket_url: string;
    description: string;
    genre: string;
    approved: boolean;
}

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [venues, setVenues] = useState<Venue[]>([]);
    const [formData, setFormData] = useState<EventData>({
        name: '',
        venueId: '',
        date: '',
        time: '19:00',
        price: '',
        ticket_url: '',
        description: '',
        genre: '',
        approved: false
    });

    useEffect(() => {
        const init = async () => {
            await fetchVenues();
            if (id && id !== 'new') {
                await fetchEvent();
            } else {
                setLoading(false);
            }
        };
        init();
    }, [id]);

    const fetchVenues = async () => {
        try {
            const res = await fetch('/api/admin/venues?limit=500&approvedOnly=true'); // Get all approved for dropdown
            if (!res.ok) throw new Error('Failed to fetch venues');
            const data = await res.json();
            setVenues(data.venues || []);
        } catch (err: any) {
            console.error('Venue fetch error:', err);
        }
    };

    const fetchEvent = async () => {
        try {
            const res = await fetch(`/api/admin/events?id=${id}`);
            if (!res.ok) throw new Error('Failed to fetch event');
            const data = await res.json();
            const e = data.event;

            // Format date and time from ISO string
            const dateObj = new Date(e.date);
            const dateStr = dateObj.toISOString().split('T')[0];
            const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

            setFormData({
                name: e.name || '',
                venueId: e.venue_id?.toString() || '',
                date: dateStr,
                time: timeStr,
                price: e.price || '',
                ticket_url: e.ticket_url || '',
                description: e.description || '',
                genre: e.genre || '',
                approved: e.approved || false
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData({ ...formData, [name]: val });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        const method = id === 'new' ? 'POST' : 'PUT';
        const payload = {
            ...formData,
            id: id === 'new' ? undefined : parseInt(id),
            venueId: formData.venueId ? parseInt(formData.venueId) : null,
        };

        try {
            const res = await fetch('/api/admin/events', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to save');

            router.push('/admin/events');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-white p-8">Loading event details...</div>;

    return (
        <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">{id === 'new' ? 'Add New Event' : 'Edit Event'}</h2>

            {error && (
                <div className="bg-red-900/50 text-red-200 p-3 rounded mb-6 border border-red-500">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Event Name*</label>
                        <input
                            name="name" type="text" required
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.name} onChange={handleChange}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Venue*</label>
                        <select
                            name="venueId" required
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.venueId} onChange={handleChange}
                        >
                            <option value="">Select a venue...</option>
                            {venues.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-400 mt-1">
                            Only <strong>approved</strong> venues are shown. If a venue is missing, <a href="/admin/venues" target="_blank" className="text-purple-400 hover:underline">approve it here</a> first.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Date*</label>
                        <input
                            name="date" type="date" required
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.date} onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Time (HH:MM)*</label>
                        <input
                            name="time" type="time" required
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.time} onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Genre</label>
                        <input
                            name="genre" type="text" placeholder="e.g. Indie, Rock"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.genre} onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Price Text</label>
                        <input
                            name="price" type="text" placeholder="e.g. £10 or Free"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.price} onChange={handleChange}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Ticket URL</label>
                        <input
                            name="ticket_url" type="text" placeholder="https://..."
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.ticket_url} onChange={handleChange}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            name="description" rows={4}
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.description} onChange={handleChange}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                name="approved" type="checkbox"
                                className="w-5 h-5 accent-purple-600"
                                checked={formData.approved} onChange={handleChange}
                            />
                            <span className="text-sm font-medium">Approved / Live on Site</span>
                        </label>
                    </div>
                </div>

                <div className="pt-6 flex gap-4">
                    <button
                        type="submit" disabled={saving}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : (id === 'new' ? 'Create Event' : 'Update Event')}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/admin/events')}
                        className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
