import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { venueName, city, capacity, createdBy } = await req.json();

        if (!venueName) {
            return NextResponse.json({ error: 'Venue name is required' }, { status: 400 });
        }

        const adminEmail = process.env.ADMIN_EMAIL || 'alex.bunch@angryappletree.com';
        const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';

        if (!process.env.RESEND_API_KEY) {
            console.log('[DEV MODE] New venue notification:');
            console.log(`Venue: ${venueName}`);
            console.log(`City: ${city || 'Not specified'}`);
            console.log(`Capacity: ${capacity || 'Not specified'}`);
            console.log(`Created by: ${createdBy || 'Unknown'}`);
            return NextResponse.json({
                success: true,
                message: 'DEV MODE: Notification logged to console'
            });
        }

        // Send email to admin
        await resend.emails.send({
            from: fromAddress,
            to: adminEmail,
            subject: `🆕 New Venue Added: ${venueName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ff3366;">🆕 New Venue Requires Review</h2>
                    
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">Venue Details:</h3>
                        <p><strong>Name:</strong> ${venueName}</p>
                        <p><strong>City:</strong> ${city || 'Not specified'}</p>
                        <p><strong>Capacity:</strong> ${capacity || 'Not specified'}</p>
                        <p><strong>Created by:</strong> ${createdBy || 'Unknown user'}</p>
                    </div>
                    
                    <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #666;">
                            <strong>Action Required:</strong> Please review and update this venue's details in the admin panel.
                        </p>
                        <p style="margin: 10px 0 0 0;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://gig-finder.co.uk'}/admin/venues" 
                               style="display: inline-block; background: #ff3366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
                                Review in Admin Panel
                            </a>
                        </p>
                    </div>
                    
                    <p style="font-size: 12px; color: #999; margin-top: 30px;">
                        This is an automated notification from GigFinder.
                    </p>
                </div>
            `,
        });

        return NextResponse.json({
            success: true,
            message: 'Admin notified successfully'
        });

    } catch (error: any) {
        console.error('Admin notification error:', error);
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        );
    }
}
