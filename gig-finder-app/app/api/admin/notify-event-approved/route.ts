import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
    try {
        if (!resend) {
            console.error('Resend not configured');
            return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
        }

        const { userEmail, eventName, userId } = await req.json();

        if (!userEmail) {
            return NextResponse.json({ error: 'User email is required' }, { status: 400 });
        }

        const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        await resend.emails.send({
            from: fromAddress,
            to: userEmail,
            subject: 'Success! Your event is live + Important Agency Agreement',
            html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; line-height: 1.6;">
                    <h1 style="color: #ff3366;">Hi fellow Gigster,</h1>
                    
                    <p>Great news—your first event <strong>"${eventName}"</strong> is now officially confirmed and live on Gig-finder.co.uk!</p>
                    
                    <h2 style="color: #00d4ff; font-size: 1.3rem; margin-top: 2rem;">What happens next?</h2>
                    
                    <p>Because this is your first event, an admin had to review and approve your listing. Unless an administrator restricts your account access for any reason in the future, all your subsequent events will be automatically approved the moment you create them.</p>
                    
                    <h2 style="color: #00d4ff; font-size: 1.3rem; margin-top: 2rem;">The Legal Bit: Our Partnership</h2>
                    
                    <p>By listing your event with us, you agree that our relationship is governed by the <a href="${appUrl}/terms" style="color: #ff3366;">Gig-finder.co.uk Terms of Service</a>.</p>
                    
                    <p>Under these terms, you are the <strong>"Principal"</strong> of the event. This means you own the event and the revenue it generates. To ensure we handle your taxes and payments correctly, please take note of Section 3: "Ticketing & Agency Status", which applies to this and all future listings.</p>
                    
                    <div style="background: #f5f5f5; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
                        <h3 style="margin-top: 0; color: #000;">Our Role:</h3>
                        <p>Gig-finder.co.uk acts solely as a disclosed agent on your behalf. We facilitate the sale, but the legal contract for the event is between you and the ticket buyer. This means that we will not handle taxes which may be due as part of the price of the ticket and we only collect VAT on platform and service fees.</p>
                        
                        <h3 style="color: #000; margin-top: 1.5rem;">Money & VAT:</h3>
                        <p>You own the "Face Value" of the tickets. Because we are acting as your agent, we do not charge VAT on your ticket price (if you are VAT-registered then you should pay VAT to HMRC. If you are VAT registered let us know as we will need to reflect this in the price of your ticket). We only charge VAT on our specific platform/booking fees.</p>
                        
                        <h3 style="color: #000; margin-top: 1.5rem;">Responsibility:</h3>
                        <p>As the Principal, you remain responsible for the delivery and safety of the event. We only handle the money and the ticketing system.</p>
                    </div>
                    
                    <p style="font-size: 14px; color: #666;">By continuing to use the platform and host this event, you confirm that you abide by these conditions and our full Terms of Service.</p>
                    
                    <h2 style="color: #00d4ff; font-size: 1.3rem; margin-top: 2rem;">Manage Your Event</h2>
                    
                    <p>You can view your ticket sales, edit event details, or message your attendees via your gig dashboard - when you log into gig-finder.co.uk you will see this at the bottom of most pages under "My gigs"</p>
                    
                    <div style="margin: 2rem 0;">
                        <a href="${appUrl}/gigfinder/my-gigs" 
                           style="display: inline-block; background: #ff3366; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 6px; font-weight: bold;">
                            View My Gigs Dashboard
                        </a>
                    </div>
                    
                    <p>We're excited to help you make this event a sell-out success! If you have any questions about how the agency agreement works, feel free to email us or contact us through the website.</p>
                    
                    <p style="margin-top: 2rem;">Best regards,</p>
                    <p><strong>The Gig-finder Team</strong><br>
                    Part of Angry Apple Tree Ltd<br>
                    <a href="mailto:alex.bunch@angryappletree.com" style="color: #ff3366;">alex.bunch@angryappletree.com</a></p>
                </div>
            `
        });

        console.log(`✅ Event approval email sent to ${userEmail}`);
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Event approval notification error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send notification' },
            { status: 500 }
        );
    }
}
