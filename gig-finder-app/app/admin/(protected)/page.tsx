"use client";
import React, { useState } from 'react';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const triggerScraper = async (scraperParams: string) => {
        setLoading(true);
        setMessage('Running ' + scraperParams + '...');
        try {
            const res = await fetch('/api/admin/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scraper: scraperParams })
            });
            const data = await res.json();
            if (res.ok) {
                let msg = `Success: ${data.message}`;
                if (data.stats) {
                    const { count, skipped } = data.stats;
                    msg += ` (Added: ${count || 0}`;
                    if (skipped !== undefined) msg += `, Skipped: ${skipped}`;
                    msg += `)`;
                }
                setMessage(msg);
            } else {
                setMessage(`Error: ${data.error}`);
            }
        } catch (error: any) {
            setMessage(`Error: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const [stats, setStats] = useState<{ pendingEvents: number }>({ pendingEvents: 0 });

    React.useEffect(() => {
        // Fetch pending events count
        fetch('/api/admin/events')
            .then(res => res.json())
            .then(data => {
                if (data.events) {
                    const pending = data.events.filter((e: any) => !e.approved).length;
                    setStats({ pendingEvents: pending });
                }
            })
            .catch(err => console.error('Failed to fetch stats', err));
    }, []);

    return (
        <div className="flex flex-col gap-6">

            {/* Status Alert */}
            {stats.pendingEvents > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-600 p-4 rounded-lg flex justify-between items-center animate-pulse">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">⚠️</span>
                        <div>
                            <h3 className="font-bold text-yellow-500 text-lg">Approvals Required</h3>
                            <p className="text-gray-300">There are <strong className="text-white">{stats.pendingEvents}</strong> event(s) waiting for your approval.</p>
                        </div>
                    </div>
                    <a href="/admin/events" className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded shadow-lg transform hover:scale-105 transition-all">
                        Review Now
                    </a>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card 1: Scrapers */}
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-bold mb-4">Run Scrapers</h2>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => triggerScraper('banshee')}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded disabled:opacity-50"
                        >
                            Scrape Banshee Labyrinth
                        </button>
                        <button
                            onClick={() => triggerScraper('sneaky')}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded disabled:opacity-50"
                        >
                            Scrape Sneaky Pete's
                        </button>
                        <button
                            onClick={() => triggerScraper('stramash')}
                            disabled={loading}
                            className="bg-red-900/50 hover:bg-red-800 text-white py-2 px-4 rounded disabled:opacity-50 border border-red-500"
                        >
                            Scrape Stramash (RSS Only)
                        </button>
                        <button
                            onClick={() => triggerScraper('leith')}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded disabled:opacity-50"
                        >
                            Scrape Leith Depot
                        </button>
                        <button
                            onClick={async () => {
                                setLoading(true);
                                setMessage('Running Skiddle API...');
                                try {
                                    const res = await fetch('/api/admin/scrape-skiddle', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' }
                                    });
                                    const data = await res.json();
                                    if (res.ok) {
                                        const { stats } = data;
                                        setMessage(`✅ Skiddle Complete! Venues: ${stats.venuesCreated} new, ${stats.venuesExisting} existing | Events: ${stats.eventsCreated} new, ${stats.eventsExisting} existing`);
                                    } else {
                                        setMessage(`❌ Error: ${data.error}`);
                                    }
                                } catch (error: any) {
                                    setMessage(`❌ Error: ${error.message || 'Unknown error'}`);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white py-2 px-4 rounded disabled:opacity-50 font-semibold shadow-lg"
                        >
                            🎸 Scrape Skiddle API (Edinburgh)
                        </button>
                    </div>
                    {message && <div className="mt-4 p-3 bg-black/50 rounded text-sm font-mono">{message}</div>}
                </div>

                {/* Card 2: Quick Links */}
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-bold mb-4">Manage</h2>
                    <div className="flex flex-col gap-3">
                        <a href="/admin/events" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-center relative overflow-hidden group">
                            <span className="relative z-10">Manage All Events</span>
                            {stats.pendingEvents > 0 && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full z-10">
                                    {stats.pendingEvents}
                                </span>
                            )}
                        </a>
                        <a href="/admin/venues" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-center">
                            Manage Venues
                        </a>
                        <a href="/gigfinder" target="_blank" className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-center">
                            View Live Site
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
