'use client';

import React from 'react';
import styles from '../contact/contact.module.css';
import { Footer } from '../../components/gigfinder/Footer';

export default function TermsPage() {
    return (
        <div className={styles.container}>
            <main>
                <h1 className={styles.heroTitle}>Terms & Conditions</h1>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <a href="/gigfinder" className={styles.btnSubmit} style={{ display: 'inline-block', textDecoration: 'none', padding: '0.75rem 1.5rem' }}>
                        ← Back to GigFinder
                    </a>
                </div>

                <div className={styles.card}>
                    <div style={{ color: '#e0e0e0', lineHeight: 1.6 }}>
                        <h2 style={{ fontSize: '1.5rem', color: '#ff3366', marginBottom: '1rem' }}>
                            📜 Angry Apple Tree Ltd - Terms of Service
                        </h2>
                        <p style={{ marginBottom: '2rem' }}><strong>Last Updated:</strong> January 2, 2026</p>

                        <h3 style={{ marginTop: '2rem', color: '#00d4ff', marginBottom: '1rem' }}>1. Acceptance of Terms</h3>
                        <p>By accessing this website, we assume you accept these terms and conditions. Do not continue to use Angry Apple Tree if you do not agree to take all of the terms and conditions stated on this page.</p>

                        <h3 style={{ marginTop: '2rem', color: '#00d4ff', marginBottom: '1rem' }}>2. Services</h3>
                        <p>Angry Apple Tree Ltd provides IT services, Music Production, Game Development, and event discovery/ticketing via Gig-finder.co.uk. We reserve the right to withdraw or amend the services we provide without notice.</p>

                        <h3 style={{ marginTop: '2rem', color: '#00d4ff', marginBottom: '1rem' }}>3. Ticketing & Agency Status (Gig-finder.co.uk)</h3>
                        <p>For all ticket sales processed through Gig-finder.co.uk, the following terms apply:</p>

                        <p style={{ marginTop: '1rem' }}><strong>Disclosed Agent Status:</strong> Angry Apple Tree Ltd (trading as Gig-finder.co.uk) acts solely as a disclosed agent on behalf of the Event Organizer or Artist ("the Principal"). We facilitate the sale of tickets but are not the seller of the event experience itself.</p>

                        <p style={{ marginTop: '1rem' }}><strong>The Contract of Sale:</strong> When a user purchases a ticket, the legal contract for the event is formed directly between the Ticket Buyer and the Principal. Angry Apple Tree Ltd is not a party to that contract.</p>

                        <p style={{ marginTop: '1rem' }}><strong>Ownership of Funds:</strong> All funds collected from ticket sales (the "Face Value") belong to the Principal. Angry Apple Tree Ltd holds these funds in a fiduciary capacity until they are remitted to the Principal, less any agreed-upon platform fees.</p>

                        <p style={{ marginTop: '1rem' }}><strong>VAT & Taxes:</strong></p>
                        <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
                            <li><strong>Ticket Price:</strong> As the Principal is the seller, VAT is only applicable to the ticket price if the Principal is VAT-registered. If the Principal is not VAT-registered, no VAT will be charged on the ticket price.</li>
                            <li style={{ marginTop: '0.5rem' }}><strong>Platform Fees:</strong> Angry Apple Tree Ltd will charge a platform/service fee for its agency services. We will charge VAT only on this specific fee (where applicable), not on the total ticket value.</li>
                        </ul>

                        <p style={{ marginTop: '1rem' }}><strong>Liability for Events:</strong> As an agent, Angry Apple Tree Ltd is not responsible for event cancellations, quality, or safety. These responsibilities rest solely with the Principal.</p>

                        <h3 style={{ marginTop: '2rem', color: '#00d4ff', marginBottom: '1rem' }}>4. User Accounts</h3>
                        <p>If you create an account, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account.</p>

                        <h3 style={{ marginTop: '2rem', color: '#00d4ff', marginBottom: '1rem' }}>5. Intellectual Property</h3>
                        <p>Unless otherwise stated, Angry Apple Tree Ltd and/or its licensors own the intellectual property rights for all material on this website. All intellectual property rights are reserved.</p>

                        <h3 style={{ marginTop: '2rem', color: '#00d4ff', marginBottom: '1rem' }}>6. Limitation of Liability</h3>
                        <p>In no event shall Angry Apple Tree Ltd, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this website.</p>

                        <h3 style={{ marginTop: '2rem', color: '#00d4ff', marginBottom: '1rem' }}>Contact Us</h3>
                        <p>If you have any questions about these Terms, please contact us via email on <a href="mailto:alex.bunch@angryappletree.com" className={styles.link}>alex.bunch@angryappletree.com</a>.</p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
