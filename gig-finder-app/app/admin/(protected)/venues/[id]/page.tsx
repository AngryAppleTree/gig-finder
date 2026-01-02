'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface VenueData {
    id?: number;
    name: string;
    address: string;
    city: string;
    postcode: string;
    latitude: string;
    longitude: string;
    capacity: string;
    email: string;
    website: string;
    phone: string;
}

export default function EditVenuePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<VenueData>({
        name: '',
        address: '',
        city: '',
        postcode: '',
        latitude: '',
        longitude: '',
        capacity: '',
        email: '',
        website: '',
        phone: ''
    });

    useEffect(() => {
        if (id && id !== 'new') {
            fetchVenue();
        } else {
            setLoading(false);
        }
    }, [id]);

    const fetchVenue = async () => {
        try {
            const res = await fetch(`/api/admin/venues?id=${id}`);
            if (!res.ok) throw new Error('Failed to fetch venue');
            const data = await res.json();
            const v = data.venue;

            setFormData({
                name: v.name || '',
                address: v.address || '',
                city: v.city || '',
                postcode: v.postcode || '',
                latitude: v.latitude?.toString() || '',
                longitude: v.longitude?.toString() || '',
                capacity: v.capacity?.toString() || '',
                email: v.email || '',
                website: v.website || '',
                phone: v.phone || ''
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        const method = id === 'new' ? 'POST' : 'PUT';
        const payload = {
            ...formData,
            id: id === 'new' ? undefined : parseInt(id),
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            capacity: formData.capacity ? parseInt(formData.capacity) : null
        };

        try {
            const res = await fetch('/api/admin/venues', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to save');

            router.push('/admin/venues');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-white p-8">Loading venue details...</div>;

    return (
        <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">{id === 'new' ? 'Add New Venue' : 'Edit Venue'}</h2>

            {error && (
                <div className="bg-red-900/50 text-red-200 p-3 rounded mb-6 border border-red-500">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Venue Name*</label>
                        <input
                            name="name" type="text" required
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.name} onChange={handleChange}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Address</label>
                        <input
                            name="address" type="text"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.address} onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <input
                            name="city" type="text"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.city} onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Postcode</label>
                        <input
                            name="postcode" type="text"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.postcode} onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Latitude</label>
                        <input
                            name="latitude" type="number" step="any"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.latitude} onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Longitude</label>
                        <input
                            name="longitude" type="number" step="any"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.longitude} onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Capacity</label>
                        <input
                            name="capacity" type="number"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.capacity} onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input
                            name="phone" type="text"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.phone} onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            name="email" type="email"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.email} onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Website</label>
                        <input
                            name="website" type="text"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.website} onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="pt-6 flex gap-4">
                    <button
                        type="submit" disabled={saving}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : (id === 'new' ? 'Add Venue' : 'Update Venue')}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/admin/venues')}
                        className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
