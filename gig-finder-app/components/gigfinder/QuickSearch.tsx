'use client';

import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function QuickSearch() {

    const handleSearch = () => {
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
                    id="searchInput"
                    placeholder="Artist or Venue"
                    className="text-input"
                    style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.1)', border: '1px solid #444', color: 'white' }}
                    onKeyDown={handleKeyDown}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input
                        id="searchCity"
                        placeholder="City (e.g. Edinburgh)"
                        className="text-input"
                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.1)', border: '1px solid #444', color: 'white' }}
                        onKeyDown={handleKeyDown}
                    />
                    <Input
                        type="date"
                        id="searchDate"
                        className="text-input"
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
                style={{ width: '100%', marginTop: '1rem' }}
            >
                SEARCH GIGS
            </Button>
        </div>
    );
}
