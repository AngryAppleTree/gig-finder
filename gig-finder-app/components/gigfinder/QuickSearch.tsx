'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import styles from './QuickSearch.module.css';

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
        <div className={styles.container}>
            <h3 className={styles.title}>
                Quick Search
            </h3>

            <div className={styles.formWrapper}>
                <Input
                    id="searchInputReact" // ID Changed to avoid legacy script listener
                    placeholder="Artist or Venue"
                    className={`text-input ${styles.input}`}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                />

                <div className={styles.inputGrid}>
                    <Input
                        id="searchCityReact"
                        placeholder="City (e.g. Edinburgh)"
                        className={`text-input ${styles.input}`}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <Input
                        type="date"
                        id="searchDateReact"
                        className={`text-input ${styles.input}`}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
            </div>

            <Button
                variant="primary"
                size="lg"
                onClick={handleSearch}
                className={`btn-primary ${styles.searchButton}`}
                disabled={isLoading}
            >
                {isLoading ? 'SEARCHING...' : 'SEARCH GIGS'}
            </Button>
        </div>
    );
}
