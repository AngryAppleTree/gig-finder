'use client';

import React from 'react';
import styles from '../static-pages.module.css';
import '../static-pages-global.css';
import { Footer } from '../../components/gigfinder/Footer';

export default function PledgePage() {
    return (
        <div className={styles.container}>
            <main>
                <h1 className={styles.heroTitle}>🎵 Our Pledge</h1>

                <div className={styles.backButtonWrapper}>
                    <a href="/gigfinder" className={styles.backButton}>
                        ← Back to GigFinder
                    </a>
                </div>

                <div className={styles.card}>
                    <h2 className={styles.sectionTitle}>
                        The Gig-Finder Pledge: More Than Just a Ticket
                    </h2>

                    <p>
                        At gig-finder.co.uk, we believe that the heart of the music scene beats in small venues, powered by independent and emerging artists. We created this platform not just to sell tickets, but to nurture the very ecosystem we love.
                    </p>

                    <p style={{ fontStyle: 'italic', marginBottom: '2rem' }}>
                        This isn't just a business model—it's a commitment to the artists and venues who give music its vital energy.
                    </p>

                    <h3 className={styles.sectionHeading}>
                        🌟 Our Ethos: Putting Power Back into the Hands of the Artist
                    </h3>

                    <p>
                        We understand the challenges faced by small bands and artists. High commission fees on ticket sales often mean that the financial benefit of a successful gig barely makes it to the performers. Our pledge is to change that:
                    </p>

                    <ul className={styles.bulletList}>
                        <li className={styles.bulletItem}>
                            <strong>Fairer Commission:</strong> We commit to providing a sustainable ticketing solution that takes less commission from bands and artists than industry-standard platforms. We believe artists deserve to be compensated fairly for their hard work and creativity.
                        </li>
                        <li className={styles.bulletItem}>
                            <strong>Supporting Venues:</strong> Small, independent venues are the essential training grounds and community hubs for musicians. By offering reliable, low-cost ticketing, we help these venues thrive, ensuring there are stages for emerging talent to play on.
                        </li>
                    </ul>

                    <h3 className={styles.sectionHeading}>
                        💰 Our Groundbreaking Commitment: The 50% Vinyl Reinvestment
                    </h3>

                    <p>
                        To truly turn our passion into action, we are enshrining a unique promise in our business model:
                    </p>

                    <p style={{
                        padding: '1.5rem',
                        background: 'rgba(255, 215, 0, 0.1)',
                        border: '2px solid #ff3366',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        marginBottom: '1.5rem'
                    }}>
                        We pledge to re-invest 50% of our total platform margin (commission earned minus the running costs of the platform and the commission taken by our payment provider) directly into the independent music scene.
                    </p>

                    <h4 className={styles.subHeading}>
                        How will we do this?
                    </h4>

                    <p>
                        We will use this fund to finance the production and release of new music on vinyl for the small and emerging bands using gig-finder.co.uk.
                    </p>

                    <p>
                        Vinyl represents the ultimate investment in a band's craft—a tangible, high-quality product that provides lasting value for both the artist and their fans. By funding these releases, we help bands secure a physical product, a new revenue stream, and a legacy for their music.
                    </p>

                    <h3 className={styles.sectionHeading}>
                        Join Us
                    </h3>

                    <p>
                        When you buy a ticket through gig-finder.co.uk, you're not just securing a spot at a show. You are becoming an active patron of the arts. You are directly enabling a band to receive fairer pay and helping them press their next record.
                    </p>

                    <p style={{ marginBottom: 0 }}>
                        As an artist, when you sell tickets for your gigs, you know where we spend the money we make. It could even end up being you on vinyl as we will listen to all the bands who use our platform and potentially reach out.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
