import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
    try {
        if (!resend) {
            console.error('Resend not configured');
            return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
        }

        const { eventId, eventName, venueName, date, userId, userEmail } = await req.json();

        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            console.error('ADMIN_EMAIL not configured');
            return NextResponse.json({ error: 'Admin email not configured' }, { status: 503 });
        }

        const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const dateStr = new Date(date).toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        await resend.emails.send({
            from: fromAddress,
            to: adminEmail,
            subject: `🆕 First Event Submission - Requires Approval`,
            html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px;">
                    <h1 style="color: #ff3366;">New User - First Event Submission</h1>
                    
                    <p>A user has submitted their <strong>first event</strong> and it requires your approval.</p>
                    
                    <div style="background: #f5f5f5; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
                        <h2 style="margin-top: 0; color: #000;">Event Details</h2>
                        <p><strong>Event:</strong> ${eventName}<br>
                        <strong>Venue:</strong> ${venueName}<br>
                        <strong>Date:</strong> ${dateStr}</p>
                        
                        <h3 style="color: #000; margin-top: 1.5rem;">User Information</h3>
                        <p><strong>User ID:</strong> ${userId}<br>
                        <strong>Email:</strong> ${userEmail}</p>
                    </div>
                    
                    <div style="margin: 2rem 0;">
                        <a href="${appUrl}/admin/events" 
                           style="display: inline-block; background: #ff3366; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 6px; font-weight: bold;">
                            Review in Admin Panel
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; margin-top: 2rem;">
                        <strong>Why this notification?</strong><br>
                        First-time event submissions require manual approval to prevent spam and ensure quality.
                        Once approved, this user's future events will be auto-approved.
                    </p>
                </div>
            `
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('First event notification error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send notification' },
            { status: 500 }
        );
    }
}
