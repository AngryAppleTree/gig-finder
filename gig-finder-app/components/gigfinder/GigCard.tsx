'use client';

import React from 'react';
import { Gig } from './types';

interface GigCardProps {
    gig: Gig;
}

export const GigCard: React.FC<GigCardProps> = ({ gig }) => {
    const dateObj = new Date(gig.date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
    const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const handleMoreInfo = () => {
        if (typeof window !== 'undefined' && (window as any).showGigDetails) {
            (window as any).showGigDetails(String(gig.id));
        }
    };

    return (
        <div className="gig-card" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="gig-date">
                <span className="day">{day}</span>
                <span className="month">{month}</span>
            </div>
            <img
                src={gig.image || '/gigfinder/images/default-gig.jpg'}
                alt={gig.name}
                className="gig-image"
                onError={(e) => e.currentTarget.src = '/gigfinder/images/default-gig.jpg'}
            />
            <div className="gig-details">
                <h3 className="gig-title">{gig.name}</h3>
                <p className="gig-venue">📍 {gig.venue}</p>
                <p className="gig-time" style={{ color: '#aaa', marginBottom: '1rem' }}>⏰ {time}</p>
                <div className="gig-actions">
                    {gig.ticketUrl ? (
                        <a
                            href={gig.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-buy"
                        >
                            Get Tickets
                        </a>
                    ) : (
                        <button
                            className="btn-buy"
                            style={{ backgroundColor: '#888', color: 'white', border: 'none', cursor: 'pointer' }}
                            onClick={handleMoreInfo}
                        >
                            More Info
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
