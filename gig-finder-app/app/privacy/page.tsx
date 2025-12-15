'use client';

import React from 'react';
import styles from '../contact/contact.module.css';
import { Footer } from '../../components/gigfinder/Footer';

export default function PrivacyPage() {
    return (
        <div className={styles.container}>
            <main>
                <h1 className={styles.heroTitle}>Privacy Notice</h1>

                <div className={styles.card}>
                    <div style={{ color: '#e0e0e0', lineHeight: 1.6 }}>
                        <h2 style={{ fontSize: '1.5rem', color: '#ff3366', marginBottom: '1rem' }}>
                            🛡️ Angry Apple Tree Ltd - Privacy Notice / Policy
                        </h2>
                        <p style={{ marginBottom: '2rem' }}><strong>Last Updated:</strong> December 2, 2025</p>

                        <p>This Privacy Policy describes how Angry Apple Tree Ltd ("we," "us," or "our") collects, uses, and
                            discloses your personal information when you visit, use our services, or make a purchase from
                            www.angryappletree.com (the "Site").</p>

                        <h3 style={{ marginTop: '2rem', color: '#00d4ff', marginBottom: '1rem' }}>1. 🗄️ Collection of Personal Information</h3>
                        <p>We collect various types of information from and about you, including information that
                            identifies, relates to, describes, references, is capable of being associated with, or could
                            reasonably be linked, directly or indirectly, with a particular consumer or device ("Personal
                            Information").</p>

                        <h4 style={{ color: 'white', marginTop: '1rem', marginBottom: '0.5rem' }}>A. Information You Provide Directly</h4>
                        <p>When you interact with our Site, we collect information you voluntarily provide to us, such as:</p>
                        <ul style={{ listStyle: 'none', paddingLeft: '1rem', marginBottom: '1rem' }}>
                            <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#ff3366' }}>Contact Information:</strong> Name, email address, mailing address, and phone number.</li>
                            <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#ff3366' }}>Account Information:</strong> Username and password (encrypted).</li>
                            <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#ff3366' }}>Payment Information:</strong> Billing address and payment details (processed securely by third-party payment processors like Stripe/PayPal).</li>
                            <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#ff3366' }}>Communications:</strong> Information in emails or communications you send to us.</li>
                        </ul>

                        <h4 style={{ color: 'white', marginTop: '1rem', marginBottom: '0.5rem' }}>B. Information Collected Automatically (Usage Data)</h4>
                        <p>When you access the Site, we automatically collect certain information about your device and interaction with the Site using technologies like cookies, web beacons, and server logs.</p>

                        <h3 style={{ marginTop: '2rem', color: '#00d4ff', marginBottom: '1rem' }}>2. 💡 How We Use Your Personal Information</h3>
                        <p>We use the Personal Information we collect to operate, maintain, and improve the Site, fulfill orders, communicate with you, ensure security, analyze trends, and comply with laws.</p>

                        <h3 style={{ marginTop: '2rem', color: '#00d4ff', marginBottom: '1rem' }}>3. 🤝 Sharing of Personal Information</h3>
                        <p>We may share your Personal Information with Service Providers, for Legal Compliance, Business Transfers, or with Affiliates.</p>

                        <h3 style={{ marginTop: '2rem', color: '#00d4ff', marginBottom: '1rem' }}>4. 🍪 Cookies</h3>
                        <p>We use cookies and similar tracking technologies to track activity on our Site. You can refuse cookies, but some portions of our Service may not function.</p>

                        <h3 style={{ marginTop: '2rem', color: '#00d4ff', marginBottom: '1rem' }}>10. 📧 Contact Us</h3>
                        <p>If you have any questions about this Privacy Policy, please contact us via email on <a href="mailto:alex.bunch@angryappletree.com" className={styles.link}>alex.bunch@angryappletree.com</a>.</p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
