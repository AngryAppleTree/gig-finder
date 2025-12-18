'use client';

import { useState, useEffect } from 'react';

interface Venue {
    id: number;
    name: string;
    address?: string;
    city?: string;
    postcode?: string;
    latitude?: number;
    longitude?: number;
    capacity?: number;
    website?: string;
    phone?: string;
    event_count?: number;
}

export default function VenuesPage() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<Partial<Venue>>({});

    useEffect(() => {
        fetchVenues();
    }, []);

    const fetchVenues = async () => {
        try {
            const res = await fetch('/api/admin/venues');
            const data = await res.json();
            if (data.venues) {
                setVenues(data.venues);
            }
        } catch (error) {
            console.error('Failed to fetch venues:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setIsCreating(true);
        setEditingVenue(null);
        setFormData({});
    };

    const handleEdit = (venue: Venue) => {
        setEditingVenue(venue);
        setIsCreating(false);
        setFormData(venue);
    };

    const handleSave = async () => {
        try {
            const url = '/api/admin/venues';
            const method = editingVenue ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingVenue ? { ...formData, id: editingVenue.id } : formData)
            });

            if (res.ok) {
                await fetchVenues();
                setEditingVenue(null);
                setIsCreating(false);
                setFormData({});
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to save venue');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save venue');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this venue?')) return;

        try {
            const res = await fetch(`/api/admin/venues?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchVenues();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete venue');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete venue');
        }
    };

    const handleCancel = () => {
        setEditingVenue(null);
        setIsCreating(false);
        setFormData({});
    };

    if (loading) {
        return <div style={{ color: 'white', padding: '2rem' }}>Loading venues...</div>;
    }

    return (
        <div style={{ padding: '2rem', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontFamily: 'var(--font-primary)', fontSize: '2rem' }}>Venue Management</h1>
                <button
                    onClick={handleCreate}
                    style={{
                        background: 'var(--color-primary)',
                        color: 'black',
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-primary)'
                    }}
                >
                    + Add Venue
                </button>
            </div>

            {/* Edit/Create Form */}
            {(editingVenue || isCreating) && (
                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '2rem',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    border: '1px solid var(--color-primary)'
                }}>
                    <h2 style={{ marginBottom: '1rem', fontFamily: 'var(--font-primary)' }}>
                        {editingVenue ? 'Edit Venue' : 'Create New Venue'}
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name *</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>City</label>
                            <input
                                type="text"
                                value={formData.city || ''}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Address (Optional)</label>
                            <input
                                type="text"
                                value={formData.address || ''}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="e.g. 123 High Street"
                                style={{ width: '100%', padding: '0.5rem', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone (Optional)</label>
                            <input
                                type="tel"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="e.g. 0131 123 4567"
                                style={{ width: '100%', padding: '0.5rem', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Postcode</label>
                            <input
                                type="text"
                                value={formData.postcode || ''}
                                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Latitude</label>
                            <input
                                type="number"
                                step="0.000001"
                                value={formData.latitude || ''}
                                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                                style={{ width: '100%', padding: '0.5rem', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Longitude</label>
                            <input
                                type="number"
                                step="0.000001"
                                value={formData.longitude || ''}
                                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                                style={{ width: '100%', padding: '0.5rem', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Capacity</label>
                            <input
                                type="number"
                                value={formData.capacity || ''}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                style={{ width: '100%', padding: '0.5rem', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Website</label>
                            <input
                                type="url"
                                value={formData.website || ''}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '4px' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={handleSave}
                            style={{
                                background: 'var(--color-primary)',
                                color: 'black',
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-primary)'
                            }}
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            style={{
                                background: '#444',
                                color: 'white',
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Venues Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-primary)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>City</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Postcode</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Capacity</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Events</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {venues.map((venue) => (
                            <tr key={venue.id} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '1rem' }}>{venue.name}</td>
                                <td style={{ padding: '1rem' }}>{venue.city || '-'}</td>
                                <td style={{ padding: '1rem' }}>{venue.postcode || '-'}</td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>{venue.capacity || '-'}</td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>{venue.event_count || 0}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button
                                        onClick={() => handleEdit(venue)}
                                        style={{
                                            background: 'var(--color-secondary)',
                                            color: 'black',
                                            padding: '0.5rem 1rem',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            marginRight: '0.5rem'
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(venue.id)}
                                        style={{
                                            background: '#d32f2f',
                                            color: 'white',
                                            padding: '0.5rem 1rem',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {venues.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                    No venues found. Click "Add Venue" to create one.
                </div>
            )}
        </div>
    );
}
