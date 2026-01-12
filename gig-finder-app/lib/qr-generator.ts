import QRCode from 'qrcode';

/**
 * QR Code Configuration
 */
const QR_CODE_PREFIX = 'GF-TICKET';
const QR_CODE_OPTIONS = {
    width: 300,
    margin: 2,
} as const;

/**
 * QR Code generation result
 */
export interface TicketQRResult {
    qrCodeData: string;
    qrBuffer: Buffer;
}

/**
 * Generate QR code data string in GigFinder format
 * 
 * @param bookingId - The booking ID from the database
 * @param eventId - The event ID from the database
 * @returns QR code data string in format: GF-TICKET:{bookingId}-{eventId}
 * 
 * @example
 * const qrData = generateQRCodeData(123, 456);
 * // Returns: "GF-TICKET:123-456"
 */
export function generateQRCodeData(bookingId: number, eventId: number): string {
    return `${QR_CODE_PREFIX}:${bookingId}-${eventId}`;
}

/**
 * Generate QR code PNG buffer for email attachment
 * 
 * @param qrData - The QR code data string (e.g., "GF-TICKET:123-456")
 * @param options - Optional QR code generation options
 * @returns Promise resolving to PNG buffer
 * 
 * @example
 * const buffer = await generateQRCodeBuffer("GF-TICKET:123-456");
 * // Use buffer in email attachment
 */
export async function generateQRCodeBuffer(
    qrData: string,
    options: QRCode.QRCodeToBufferOptions = QR_CODE_OPTIONS
): Promise<Buffer> {
    return QRCode.toBuffer(qrData, options);
}

/**
 * Generate complete ticket QR code (data + buffer)
 * 
 * This is the main function used by booking routes to generate
 * QR codes for ticket emails.
 * 
 * @param bookingId - The booking ID from the database
 * @param eventId - The event ID from the database
 * @returns Promise resolving to QR code data and PNG buffer
 * 
 * @example
 * const { qrCodeData, qrBuffer } = await generateTicketQR(123, 456);
 * // qrCodeData: "GF-TICKET:123-456"
 * // qrBuffer: PNG buffer for email attachment
 */
export async function generateTicketQR(
    bookingId: number,
    eventId: number
): Promise<TicketQRResult> {
    const qrCodeData = generateQRCodeData(bookingId, eventId);
    const qrBuffer = await generateQRCodeBuffer(qrCodeData);

    return {
        qrCodeData,
        qrBuffer,
    };
}
