'use client';

import React from 'react';
import { Gig } from './types';

interface GigCardProps {
    gig: Gig;
}

export const GigCard: React.FC<GigCardProps> = ({ gig }) => {

    // Legacy Script Logic for Location
    const locationText = gig.town ? `${gig.location}, ${gig.town}` : gig.location;

    const distanceHtml = gig.distance !== undefined
        ? <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>({gig.distance.toFixed(1)} miles away)</span>
        : null;

    const handleBooking = () => {
        window.dispatchEvent(new CustomEvent('gigfinder-open-booking', {
            detail: { id: gig.id, name: gig.name }
        }));
    };

    const handleMoreInfo = () => {
        // Legacy "More Info" page is deprecated/removed.
        // For now, if no ticket URL, just alert or do nothing.
        // Or dispatch booking event if we want to use the modal as a detail view?
        // Let's just alert the user to check the venue.
        alert(`More info for ${gig.name} at ${gig.venue}. Please check the venue website.`);
    };

    return (
        <div className="gig-card">
            <div className="gig-image">
                <img
                    src={gig.imageUrl || '/no-photo.png'}
                    alt={gig.name}
                    onError={(e) => e.currentTarget.src = '/no-photo.png'}
                    style={{ height: '200px', width: '100%', objectFit: 'cover' }}
                />
            </div>
            <div className="gig-details">
                <h3 className="gig-name">{gig.name}</h3>
                <div className="gig-info">
                    <p className="gig-location">📍 {locationText} {distanceHtml}</p>
                    <p className="gig-date">📅 {gig.date} at {gig.time}</p>
                    <p className="gig-price">🎟️ {gig.price}</p>
                </div>
                <div style={{ marginTop: '1rem' }}>
                    {gig.isInternalTicketing ? (
                        <button
                            className="btn-buy"
                            style={{ background: 'var(--color-secondary)', borderColor: 'var(--color-secondary)', cursor: 'pointer', width: '100%' }}
                            onClick={handleBooking}
                        >
                            Book Now
                        </button>
                    ) : (gig.ticketUrl && gig.ticketUrl !== '#' ? (
                        <a
                            href={gig.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-buy"
                            style={{ width: '100%', display: 'block', textAlign: 'center' }}
                        >
                            Get Tickets
                        </a>
                    ) : (
                        <button
                            className="btn-buy"
                            style={{ backgroundColor: '#888', color: 'white', border: 'none', cursor: 'pointer', width: '100%' }}
                            onClick={handleMoreInfo}
                        >
                            More Info
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
