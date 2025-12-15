'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function QuickSearch() {
    const router = useRouter();
    const [keyword, setKeyword] = useState('');
    const [city, setCity] = useState('');
    const [date, setDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        setIsLoading(true);

        // Build URL search parameters for the results page
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (city) params.append('location', city);
        if (date) params.append('minDate', date);

        // Navigate to results page
        router.push(`/gigfinder/results?${params.toString()}`);
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
