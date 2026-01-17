'use client';

import React from 'react';
import { Gig } from './types';
import styles from './GigCard.module.css';

interface GigCardProps {
    gig: Gig;
}

export const GigCard: React.FC<GigCardProps> = ({ gig }) => {

    // Debug logging for ERTYU event
    if (gig.name.toLowerCase().includes('ertyu')) {
        console.log('🔍 ERTYU Event Debug:', {
            name: gig.name,
            source: gig.source,
            isInternalTicketing: gig.isInternalTicketing,
            sellTickets: gig.sellTickets,
            ticketUrl: gig.ticketUrl,
            priceVal: gig.priceVal,
            shouldShowButton: (gig.isInternalTicketing || gig.sellTickets) && gig.source === 'manual'
        });
    }

    // Legacy Script Logic for Location
    const locationText = gig.town ? `${gig.location}, ${gig.town}` : gig.location;

    const distanceHtml = gig.distance !== undefined
        ? <span className={styles.distanceText}>({gig.distance.toFixed(1)} miles away)</span>
        : null;

    const handleBooking = () => {
        window.dispatchEvent(new CustomEvent('gigfinder-open-booking', {
            detail: {
                id: gig.id,
                name: gig.name,
                price: gig.priceVal || 0,
                presale_price: gig.presale_price,
                presale_caption: gig.presale_caption
            }
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
                    alt={`${gig.name} at ${gig.venue} on ${gig.date}`}
                    onError={(e) => e.currentTarget.src = '/no-photo.png'}
                    className={styles.gigImage}
                />
            </div>
            <div className="gig-details">
                {gig.source !== 'manual' || gig.isVerified ? (
                    <div className="badge-verified">✓ Verified</div>
                ) : (
                    <div className="badge-unverified" title="This gig was posted by the community and is awaiting admin verification.">⚠ Community Post</div>
                )}
                <h3 className="gig-name">{gig.name}</h3>
                <div className="gig-info">
                    <p className="gig-location">📍 {locationText} {distanceHtml}</p>
                    <p className="gig-date">📅 {gig.date} at {gig.time}</p>
                    <p className="gig-price">🎟️ {gig.price}</p>
                    {gig.presale_price && (
                        <div className={styles.presaleContainer}>
                            <p className={styles.presalePrice}>
                                💿 Presale: £{typeof gig.presale_price === 'number' ? gig.presale_price.toFixed(2) : parseFloat(gig.presale_price).toFixed(2)}
                            </p>
                            {gig.presale_caption && (
                                <p className={styles.presaleCaption}>
                                    {gig.presale_caption}
                                </p>
                            )}
                        </div>
                    )}
                </div>
                <div className={styles.buttonContainer}>
                    <button
                        className={`btn-buy ${styles.viewButton}`}
                        onClick={() => window.location.href = `/gigfinder/event/${gig.id}`}
                    >
                        View Event
                    </button>
                </div>
            </div>
        </div>
    );
};
