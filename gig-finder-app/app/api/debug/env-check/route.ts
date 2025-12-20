import { NextResponse } from 'next/server';

export async function GET() {
    // Only allow in non-production
    if (process.env.VERCEL_ENV === 'production') {
        return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    return NextResponse.json({
        environment: process.env.VERCEL_ENV || 'local',
        hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
        hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        hasResendKey: !!process.env.RESEND_API_KEY,
        stripeSecretPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'missing',
        webhookSecretPrefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 7) || 'missing',
        timestamp: new Date().toISOString()
    });
}
