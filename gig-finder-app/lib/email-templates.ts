/**
 * Email Templates for Ticket Confirmations
 * 
 * Provides reusable email templates for:
 * - Manual guest bookings
 * - Stripe payment confirmations
 * 
 * Note: QR codes are embedded only (no separate attachment)
 */

// Constants
export const QR_CODE_CONTENT_ID = 'ticket-qr';

export interface TicketEmailData {
    customerName: string;
    eventName: string;
    venueName: string;
    eventDate: Date;
    bookingId: number;
    ticketQuantity: number;
    recordsQuantity?: number;
}

export interface PaymentEmailData extends TicketEmailData {
    ticketPrice: number;
    recordsPrice?: number;
    platformFee: number;
}

/**
 * Create QR code attachment configuration
 * Ensures consistent attachment format across all emails
 */
export function createQRAttachment(bookingId: number, qrBuffer: Buffer) {
    return {
        filename: `ticket-${bookingId}.png`,
        content: qrBuffer,
        contentId: QR_CODE_CONTENT_ID
    };
}

/**
 * Safely format event date with fallback
 * Prevents email generation from failing due to invalid dates
 */
function formatEventDate(date: Date): string {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            return 'Date TBA';
        }
        return d.toLocaleDateString();
    } catch {
        return 'Date TBA';
    }
}

/**
 * Generate base ticket confirmation email HTML
 * Used for both manual and paid bookings
 */
function generateBaseTicketEmail(data: TicketEmailData, additionalContent: string = ''): string {
    // Validate required fields
    if (!data.customerName?.trim()) {
        throw new Error('Customer name is required for email generation');
    }
    if (!data.eventName?.trim()) {
        throw new Error('Event name is required for email generation');
    }
    if (!data.bookingId || data.bookingId <= 0) {
        throw new Error('Valid booking ID is required for email generation');
    }

    // Safe date formatting with fallback
    const dateStr = formatEventDate(data.eventDate);

    return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 28px;">🎉 You're Going!</h1>
            </div>
            
            <div style="padding: 30px; background: #fff;">
                <p style="font-size: 16px; line-height: 1.6;">Hi ${data.customerName},</p>
                
                ${additionalContent}
                
                <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
                    <h2 style="color: #000; font-size: 20px; margin-top: 0;">📅 Event Details</h2>
                    <p style="margin: 5px 0;"><strong>Event:</strong> ${data.eventName}</p>
                    <p style="margin: 5px 0;"><strong>Venue:</strong> ${data.venueName || 'TBA'}</p>
                    <p style="margin: 5px 0;"><strong>Date:</strong> ${dateStr}</p>
                    <p style="margin: 5px 0;"><strong>Tickets:</strong> ${data.ticketQuantity}</p>
                    ${data.recordsQuantity && data.recordsQuantity > 0 ? `
                    <p style="margin: 5px 0;"><strong>Records:</strong> 💿 ${data.recordsQuantity}</p>
                    ` : ''}
                </div>
                
                <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                    <p style="margin: 0 0 15px 0; font-weight: bold; color: #667eea;">Your Entry QR Code</p>
                    <img src="cid:${QR_CODE_CONTENT_ID}" alt="Your Entry QR Code" style="border: 4px solid #667eea; border-radius: 8px; width: 250px; height: 250px; display: block; margin: 0 auto;" />
                    <p style="margin: 15px 0 0 0; font-size: 12px; color: #666;">Show this QR code at the venue for entry</p>
                </div>
                
                <p style="text-align: center; color: #999; font-size: 14px;">Booking Reference: #${data.bookingId}</p>
                
                ${data.recordsQuantity && data.recordsQuantity > 0 ? `
                <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                        💿 <strong>Record Collection:</strong> Your vinyl record${data.recordsQuantity > 1 ? 's' : ''} will be available for collection at the venue.
                    </p>
                </div>
                ` : ''}
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
                <p style="margin: 0; font-size: 12px; color: #6c757d;">
                    Ticket sold by <strong>Gig-finder.co.uk</strong> as agent for the artists performing at the event.
                </p>
                <p style="margin: 10px 0 0 0; font-size: 11px; color: #adb5bd;">
                    Questions? Contact us at support@gig-finder.co.uk
                </p>
            </div>
        </div>
    `;
}

/**
 * Generate email for manual guest bookings (free/comp tickets)
 */
export function generateManualBookingEmail(data: TicketEmailData): string {
    const welcomeMessage = `
        <p style="font-size: 16px; line-height: 1.6;">
            Great news! Your spot for <strong>${data.eventName}</strong> is confirmed.
        </p>
    `;

    return generateBaseTicketEmail(data, welcomeMessage);
}

/**
 * Generate email for Stripe payment confirmations
 */
export function generatePaymentConfirmationEmail(data: PaymentEmailData): string {
    const ticketsSubtotal = data.ticketPrice * data.ticketQuantity;
    const recordsSubtotal = (data.recordsPrice || 0) * (data.recordsQuantity || 0);
    const totalPaid = (ticketsSubtotal + recordsSubtotal + data.platformFee).toFixed(2);

    const paymentMessage = `
        <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #155724; font-size: 16px;">
                ✅ <strong>Payment Successful!</strong> Your payment of <strong>£${totalPaid}</strong> has been confirmed.
            </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #000; font-size: 18px;">💳 Payment Breakdown</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">Tickets (${data.ticketQuantity} × £${data.ticketPrice.toFixed(2)})</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; text-align: right;">£${ticketsSubtotal.toFixed(2)}</td>
                </tr>
                ${data.recordsQuantity && data.recordsQuantity > 0 ? `
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">Records (${data.recordsQuantity} × £${(data.recordsPrice || 0).toFixed(2)})</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; text-align: right;">£${recordsSubtotal.toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">Platform Fee</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; text-align: right;">£${data.platformFee.toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; font-weight: bold; font-size: 16px;">Total Paid</td>
                    <td style="padding: 12px 0; font-weight: bold; font-size: 16px; text-align: right;">£${totalPaid}</td>
                </tr>
            </table>
        </div>
    `;

    return generateBaseTicketEmail(data, paymentMessage);
}
