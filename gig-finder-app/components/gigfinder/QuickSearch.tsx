'use client';

import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function QuickSearch() {

    const handleSearch = () => {
        // Integrate with existing script logic for Phase 1
        if (typeof window !== 'undefined' && (window as any).performQuickSearch) {
            (window as any).performQuickSearch();
        } else {
            console.warn("GigFinder Script API not loaded yet");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="p-6 mb-8 border-2 border-dashed border-[var(--color-primary)] bg-[rgba(255,255,255,0.05)] rounded-lg">
            <h3 className="text-xl font-bold uppercase mb-4 text-[var(--color-primary)] font-[family-name:var(--font-primary)] text-center md:text-left">
                Quick Search
            </h3>

            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-1/3">
                    <label htmlFor="searchCity" className="block text-sm uppercase mb-2 font-bold font-[family-name:var(--font-primary)]">City</label>
                    <Input
                        id="searchCity"
                        defaultValue="Edinburgh"
                        placeholder="e.g. Glasgow"
                        onKeyDown={handleKeyDown}
                    />
                </div>

                <div className="w-full md:w-1/3">
                    <label htmlFor="searchInput" className="block text-sm uppercase mb-2 font-bold font-[family-name:var(--font-primary)]">Keyword</label>
                    <Input
                        id="searchInput"
                        placeholder="Band, Venue, Genre..."
                        onKeyDown={handleKeyDown}
                    />
                </div>

                <div className="w-full md:w-1/3">
                    <label htmlFor="searchDate" className="block text-sm uppercase mb-2 font-bold font-[family-name:var(--font-primary)]">From Date</label>
                    <Input
                        type="date"
                        id="searchDate"
                        className="h-10"
                        onKeyDown={handleKeyDown}
                    />
                </div>

                <div className="w-full md:w-auto">
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleSearch}
                        className="w-full whitespace-nowrap"
                    >
                        SEARCH GIGS
                    </Button>
                </div>
            </div>
        </div>
    );
}
