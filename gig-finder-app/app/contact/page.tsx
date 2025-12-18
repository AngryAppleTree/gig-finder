'use client';

import React, { useState } from 'react';
import styles from './contact.module.css';
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

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                setStatus('success');
                e.currentTarget.reset();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setStatus('error');
                setErrorMessage(result.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Contact form submission error:', error);
            setStatus('error');
            setErrorMessage('Network error. Please try again or email us directly.');
        }
    };

    return (
        <div className={styles.container}>
            <main>
                <h1 className={styles.heroTitle}>📧 Contact Us</h1>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <a href="/gigfinder" className={styles.btnSubmit} style={{ display: 'inline-block', textDecoration: 'none', padding: '0.75rem 1.5rem' }}>
                        ← Back to GigFinder
                    </a>
                </div>

                <div className={styles.card}>
                    {status === 'success' && (
                        <div className={styles.successMessage}>
                            ✅ Thank you! Your message has been sent successfully. We'll get back to you soon!
                        </div>
                    )}

                    {status === 'error' && (
                        <div className={styles.successMessage} style={{ background: '#fee', border: '1px solid #fcc' }}>
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
