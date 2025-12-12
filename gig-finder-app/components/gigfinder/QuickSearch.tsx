'use client';

import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Gig } from './types';

export function QuickSearch() {
    const [keyword, setKeyword] = useState('');
    const [city, setCity] = useState('');
    const [date, setDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        setIsLoading(true);
        try {
            // Scroll to results immediately to show responsiveness
            const resultsSection = document.getElementById('results');
            if (resultsSection) {
                resultsSection.classList.add('active');
                resultsSection.scrollIntoView({ behavior: 'smooth' });
            }

            // Dispatch clear event
            window.dispatchEvent(new CustomEvent('gigfinder-results-clear'));

            // Build Params
            const params = new URLSearchParams();
            if (keyword) params.append('keyword', keyword);
            if (city) params.append('location', city);
            if (date) params.append('minDate', date);

            // Allow all genres implicitly or handle generic search
            const response = await fetch(`/api/events?${params.toString()}`);
            const data = await response.json();

            if (data.success && data.events) {
                // Transform Data
                const gigs: Gig[] = data.events.map((event: any) => ({
                    id: event.id,
                    name: event.name || event.eventname,
                    venue: event.venue.name || event.venue,
                    location: event.venue.name || event.location, // Normalized
                    town: event.venue.town || event.town,
                    date: typeof event.date === 'string' ? event.date : new Date(event.dateObj).toLocaleDateString(),
                    time: event.time || event.openingtimes?.doorsopen || 'TBA',
                    dateObj: event.dateObj,
                    description: event.description,
                    imageUrl: event.imageurl || event.imageUrl, // Handle both cases
                    image: event.imageurl || event.imageUrl,
                    ticketUrl: event.link || event.ticketUrl,
                    isInternalTicketing: event.isInternalTicketing,
                    price: event.price || event.entryprice,
                    distance: event.distance
                }));

                // Dispatch
                window.dispatchEvent(new CustomEvent('gigfinder-results-updated', { detail: gigs }));
            } else {
                // Dispatch empty
                window.dispatchEvent(new CustomEvent('gigfinder-results-updated', { detail: [] }));
            }

        } catch (error) {
            console.error("Search failed", error);
            // Dispatch empty to show "No Results" or handle error UI
            window.dispatchEvent(new CustomEvent('gigfinder-results-updated', { detail: [] }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent legacy script interference
            e.stopPropagation();
            handleSearch();
        }
    };

    return (
        <div style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid var(--color-border)'
        }}>
            <h3 style={{
                marginTop: 0,
                fontFamily: 'var(--font-primary)',
                textTransform: 'uppercase',
                color: 'var(--color-text)',
                fontSize: '1.2rem',
                marginBottom: '1rem'
            }}>
                Quick Search
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input
                    id="searchInputReact" // ID Changed to avoid legacy script listener
                    placeholder="Artist or Venue"
                    className="text-input"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.1)', border: '1px solid #444', color: 'white' }}
                    onKeyDown={handleKeyDown}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input
                        id="searchCityReact"
                        placeholder="City (e.g. Edinburgh)"
                        className="text-input"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.1)', border: '1px solid #444', color: 'white' }}
                        onKeyDown={handleKeyDown}
                    />
                    <Input
                        type="date"
                        id="searchDateReact"
                        className="text-input"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.1)', border: '1px solid #444', color: 'white' }}
                        onKeyDown={handleKeyDown}
                    />
                </div>
            </div>

            <Button
                variant="primary"
                size="lg"
                onClick={handleSearch}
                className="btn-primary"
                disabled={isLoading}
                style={{ width: '100%', marginTop: '1rem' }}
            >
                {isLoading ? 'SEARCHING...' : 'SEARCH GIGS'}
            </Button>
        </div>
    );
}
