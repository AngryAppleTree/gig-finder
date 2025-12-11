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

    return (
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
                </div>
                {message && <div className="mt-4 p-3 bg-black/50 rounded text-sm font-mono">{message}</div>}
            </div>

            {/* Card 2: Quick Links */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Manage</h2>
                <div className="flex flex-col gap-3">
                    <a href="/admin/events" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-center">
                        Manage All Events
                    </a>
                    <a href="/gigfinder" target="_blank" className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-center">
                        View Live Site
                    </a>
                </div>
            </div>

        </div>
    );
}
