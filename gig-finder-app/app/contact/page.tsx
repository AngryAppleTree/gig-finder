'use client';

import React, { useState } from 'react';
import styles from './contact.module.css';
import { Footer } from '../../components/gigfinder/Footer';

export default function ContactPage() {
    const [status, setStatus] = useState<'idle' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate submission
        console.log("Form Submitted");
        setStatus('success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className={styles.container}>
            <main>
                <h1 className={styles.heroTitle}>📧 Contact Us</h1>

                <div className={styles.card}>
                    {status === 'success' && (
                        <div className={styles.successMessage}>
                            ✅ Thank you! Your message has been sent successfully. We'll get back to you soon!
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

                        <button type="submit" className={styles.btnSubmit}>Send Message 🚀</button>
                    </form>

                    <div className={styles.contactInfo}>
                        <h3>Other Ways to Reach Us</h3>
                        <p><strong>Email:</strong> <a href="mailto:alex.bunch@angryappletree.com" className={styles.link}>alex.bunch@angryappletree.com</a></p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
