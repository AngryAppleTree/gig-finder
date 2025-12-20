/**
 * Safe logging utility that redacts sensitive information
 */

const SENSITIVE_PATTERNS = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email addresses
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // Credit card numbers
    /\bsk_live_[A-Za-z0-9]+/g, // Stripe live keys
    /\bsk_test_[A-Za-z0-9]+/g, // Stripe test keys
    /\bpk_live_[A-Za-z0-9]+/g, // Stripe publishable keys
    /\bpk_test_[A-Za-z0-9]+/g, // Stripe publishable test keys
];

/**
 * Redact sensitive information from a string
 */
function redactSensitiveInfo(text: string): string {
    let redacted = text;

    // Redact email addresses
    redacted = redacted.replace(SENSITIVE_PATTERNS[0], '[EMAIL_REDACTED]');

    // Redact credit card numbers
    redacted = redacted.replace(SENSITIVE_PATTERNS[1], '[CARD_REDACTED]');

    // Redact Stripe keys
    for (let i = 2; i < SENSITIVE_PATTERNS.length; i++) {
        redacted = redacted.replace(SENSITIVE_PATTERNS[i], '[API_KEY_REDACTED]');
    }

    return redacted;
}

/**
 * Safe console.log that redacts sensitive information in production
 */
export function safeLog(...args: any[]): void {
    if (process.env.NODE_ENV === 'production') {
        // In production, redact sensitive info
        const redactedArgs = args.map(arg => {
            if (typeof arg === 'string') {
                return redactSensitiveInfo(arg);
            }
            if (typeof arg === 'object' && arg !== null) {
                return redactSensitiveInfo(JSON.stringify(arg));
            }
            return arg;
        });
        console.log(...redactedArgs);
    } else {
        // In development, log everything
        console.log(...args);
    }
}

/**
 * Safe console.error that redacts sensitive information in production
 */
export function safeError(...args: any[]): void {
    if (process.env.NODE_ENV === 'production') {
        const redactedArgs = args.map(arg => {
            if (typeof arg === 'string') {
                return redactSensitiveInfo(arg);
            }
            if (typeof arg === 'object' && arg !== null) {
                return redactSensitiveInfo(JSON.stringify(arg));
            }
            return arg;
        });
        console.error(...redactedArgs);
    } else {
        console.error(...args);
    }
}

/**
 * Log only in development
 */
export function devLog(...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
        console.log(...args);
    }
}

/**
 * Redact email from string for logging
 */
export function redactEmail(email: string): string {
    if (!email || typeof email !== 'string') return '[INVALID_EMAIL]';
    const [local, domain] = email.split('@');
    if (!domain) return '[INVALID_EMAIL]';
    return `${local.substring(0, 2)}***@${domain}`;
}
