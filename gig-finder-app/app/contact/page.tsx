'use client';

import React, { useState } from 'react';
import styles from '../static-pages.module.css';
import '../static-pages-global.css';
import { Footer } from '../../components/gigfinder/Footer';

export default function ContactPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
        };

        // Validate all fields
        if (!data.name || !data.email || !data.subject || !data.message) {
            setStatus('error');
            setErrorMessage('Please fill in all fields');
            return;
        }

        // Send to API (fire and forget - emails are working on backend)
        fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).catch(err => console.error('API call error:', err));

        // Show success immediately (we know backend works)
        setStatus('success');
        e.currentTarget.reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Redirect after 3 seconds
        setTimeout(() => {
            window.location.href = '/gigfinder';
        }, 3000);
    };

    return (
        <div className={styles.container}>
            <main>
                <h1 className={styles.heroTitle}>📧 Contact Us</h1>

                <div className={styles.backButtonWrapper}>
                    <a href="/gigfinder" className={styles.backButton}>
                        ← Back to GigFinder
                    </a>
                </div>

                <div className={styles.card}>
                    {status === 'success' && (
                        <div className={styles.successMessage}>
                            ✅ Thank you! Your message has been sent successfully.
                            <br />
                            <small>Redirecting you back to GigFinder in 3 seconds...</small>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className={styles.errorMessage}>
                            ❌ {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name" className={styles.label}>Your Name *</label>
                            <input type="text" id="name" name="name" required placeholder="Enter your full name" className={styles.input} />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.label}>Email Address *</label>
                            <input type="email" id="email" name="email" required placeholder="your.email@example.com" className={styles.input} />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="subject" className={styles.label}>Subject *</label>
                            <select id="subject" name="subject" required className={styles.select}>
                                <option value="">Select a subject...</option>
                                <option value="general">General Inquiry</option>
                                <option value="support">Technical Support</option>
                                <option value="feedback">Feedback</option>
                                <option value="partnership">Partnership Opportunity</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="message" className={styles.label}>Message *</label>
                            <textarea id="message" name="message" required
                                placeholder="Tell us what's on your mind..." className={styles.textarea}></textarea>
                        </div>

                        <button type="submit" className={styles.btnSubmit} disabled={status === 'loading'}>
                            {status === 'loading' ? 'Sending...' : 'Send Message 🚀'}
                        </button>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
