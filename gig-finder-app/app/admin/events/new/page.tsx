"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Default form state
    const [formData, setFormData] = useState({
        name: '',
        venue: '',
        date: '', // YYYY-MM-DD
        time: '19:00', // HH:MM
        price: '0.00',
        ticket_url: '',
        description: '',
        genre: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to create');

            // Redirect to list
            router.push('/admin/events');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Create New Event</h2>

            {error && (
                <div className="bg-red-900/50 text-red-200 p-3 rounded mb-6 border border-red-500">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium mb-1">Event Name</label>
                    <input
                        name="name" type="text" required
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                        value={formData.name} onChange={handleChange}
                    />
                </div>

                {/* Venue */}
                <div>
                    <label className="block text-sm font-medium mb-1">Venue</label>
                    <input
                        name="venue" type="text" required list="venues"
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                        value={formData.venue} onChange={handleChange}
                    />
                    <datalist id="venues">
                        <option value="The Banshee Labyrinth" />
                        <option value="Sneaky Pete's" />
                        <option value="Stramash" />
                        <option value="Leith Depot" />
                        <option value="Bannermans" />
                    </datalist>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <input
                            name="date" type="date" required
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.date} onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Time</label>
                        <input
                            name="time" type="time" required
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.time} onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Genre & Price */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Genre</label>
                        <input
                            name="genre" type="text" placeholder="e.g. Rock, Jazz"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.genre} onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Price (£)</label>
                        <input
                            name="price" type="text"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.price} onChange={handleChange}
                        />
                    </div>
                </div>

                {/* URL */}
                <div>
                    <label className="block text-sm font-medium mb-1">Ticket URL</label>
                    <input
                        name="ticket_url" type="text" placeholder="https://..."
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                        value={formData.ticket_url} onChange={handleChange}
                    />
                </div>

                {/* Desc */}
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        name="description" rows={3}
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                        value={formData.description} onChange={handleChange}
                    />
                </div>

                <div className="pt-4 flex gap-4">
                    <button
                        type="submit" disabled={loading}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Create Event'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded"
                    >
                        Cancel
                    </button>
                </div>

            </form>
        </div>
    );
}
