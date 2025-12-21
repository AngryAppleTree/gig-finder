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
    approved?: boolean;
}

export default function VenuesPage() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });

    const fetchVenues = async (pageNum: number = page) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/venues?page=${pageNum}&limit=50`);
            const data = await res.json();
            if (data.venues) {
                setVenues(data.venues);
                setPagination(data.pagination);
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Failed to fetch venues:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVenues(1);
    }, []);

    const toggleApproval = async (id: number, currentApproved: boolean) => {
        try {
            const res = await fetch('/api/admin/venues', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, approved: !currentApproved })
            });
            if (res.ok) {
                fetchVenues(page);
            } else {
                alert('Failed to update approval status');
            }
        } catch (error) {
            console.error('Approval error:', error);
            alert('Failed to update approval status');
        }
    };

    if (loading) {
        return <div className="text-white p-8">Loading venues...</div>;
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Venue Management</h2>
                <a href="/admin/venues/new" className="text-sm bg-purple-600 px-3 py-1 rounded hover:bg-purple-500 text-white">
                    + Add Venue
                </a>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">City</th>
                            <th className="px-4 py-3 text-center">Capacity</th>
                            <th className="px-4 py-3 text-center">Events</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {venues.map((venue) => (
                            <tr key={venue.id} className={`hover:bg-gray-700/50 ${!venue.approved ? 'bg-yellow-900/10' : ''}`}>
                                <td className="px-4 py-3 text-sm font-medium">
                                    {venue.name}
                                    {!venue.approved && <span className="ml-2 text-xs bg-yellow-600 text-black px-1 rounded">PENDING</span>}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-400">{venue.city || '-'}</td>
                                <td className="px-4 py-3 text-sm text-center">{venue.capacity || '-'}</td>
                                <td className="px-4 py-3 text-sm text-center">{venue.event_count || 0}</td>
                                <td className="px-4 py-3 text-center">
                                    {!venue.approved ? (
                                        <div className="flex gap-1 justify-center">
                                            <button
                                                onClick={() => toggleApproval(venue.id, false)}
                                                className="px-2 py-1 text-xs rounded border bg-green-600 border-green-500 text-white font-bold hover:bg-green-500"
                                            >
                                                APPROVE
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Reject this venue? This will also delete any unapproved events at this venue.')) {
                                                        toggleApproval(venue.id, true);
                                                    }
                                                }}
                                                className="px-2 py-1 text-xs rounded border bg-red-600 border-red-500 text-white hover:bg-red-500"
                                            >
                                                REJECT
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="px-2 py-1 text-xs rounded border bg-green-900/30 border-green-700 text-green-400">
                                            Approved
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right text-sm">
                                    <a href={`/admin/venues/${venue.id}`} className="text-blue-400 hover:text-blue-300 mr-3">
                                        Edit
                                    </a>
                                </td>
                            </tr>
                        ))}
                        {venues.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-4">No venues found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!loading && pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
                    <div className="text-sm text-gray-400">
                        Showing {venues.length} of {pagination.total} venues (Page {pagination.page} of {pagination.totalPages})
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => fetchVenues(page - 1)}
                            disabled={page === 1}
                            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => fetchVenues(page + 1)}
                            disabled={page >= pagination.totalPages}
                            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
