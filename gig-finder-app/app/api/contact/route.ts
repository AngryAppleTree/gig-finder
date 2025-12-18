import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { name, email, subject, message } = await req.json();

        // Validate input
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Email to you (the site owner)
        const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';
        const toAddress = process.env.CONTACT_EMAIL || 'alex.bunch@angryappletree.com';

        if (!process.env.RESEND_API_KEY) {
            console.log('[DEV MODE] Contact form submission:');
            console.log(`From: ${name} <${email}>`);
            console.log(`Subject: ${subject}`);
            console.log(`Message: ${message}`);
            return NextResponse.json({
                success: true,
                message: 'DEV MODE: Email logged to console. Set RESEND_API_KEY to send real emails.'
            });
        }

        // Send email via Resend
        await resend.emails.send({
            from: fromAddress,
            to: toAddress,
            replyTo: email, // User's email for easy reply
            subject: `[GigFinder Contact] ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">New Contact Form Submission</h2>
                    
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>From:</strong> ${name}</p>
                        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        <p><strong>Subject:</strong> ${subject}</p>
                    </div>
                    
                    <div style="background: white; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                        <h3 style="margin-top: 0;">Message:</h3>
                        <p style="white-space: pre-wrap;">${message}</p>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #e8f4f8; border-radius: 8px;">
                        <p style="margin: 0; font-size: 14px; color: #666;">
                            💡 <strong>Tip:</strong> Click "Reply" to respond directly to ${email}
                        </p>
                    </div>
                </div>
            `,
        });

        return NextResponse.json({
            success: true,
            message: 'Message sent successfully!'
        });

    } catch (error: any) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'Failed to send message. Please try again or email us directly.' },
            { status: 500 }
        );
    }
}
