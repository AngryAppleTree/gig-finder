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
                        <p style={{ marginBottom: '2rem' }}><strong>Last Updated:</strong> December 2, 2025</p>

                        <p>Welcome to Angry Apple Tree Ltd! These Terms and Conditions outline the rules and regulations for the use of our website and services.</p>

                        <h3 style={{ marginTop: '2rem', color: '#00d4ff', marginBottom: '1rem' }}>1. Acceptance of Terms</h3>
                        <p>By accessing this website, we assume you accept these terms and conditions. Do not continue to use Angry Apple Tree if you do not agree to take all of the terms and conditions stated on this page.</p>

                        <h3 style={{ marginTop: '2rem', color: '#00d4ff', marginBottom: '1rem' }}>2. Services</h3>
                        <p>Angry Apple Tree Ltd provides IT services, Music Production, and Game Development. We reserve the right to withdraw or amend the services we provide without notice.</p>

                        <h3 style={{ marginTop: '2rem', color: '#00d4ff', marginBottom: '1rem' }}>3. User Accounts</h3>
                        <p>If you create an account, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account.</p>

                        <h3 style={{ marginTop: '2rem', color: '#00d4ff', marginBottom: '1rem' }}>4. Intellectual Property</h3>
                        <p>Unless otherwise stated, Angry Apple Tree Ltd and/or its licensors own the intellectual property rights for all material on this website. All intellectual property rights are reserved.</p>

                        <h3 style={{ marginTop: '2rem', color: '#00d4ff', marginBottom: '1rem' }}>5. Limitation of Liability</h3>
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
