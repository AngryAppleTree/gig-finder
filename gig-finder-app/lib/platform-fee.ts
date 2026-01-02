/**
 * Platform Fee Calculation Utilities
 * 
 * Future-proof fee calculation that can be extended to support:
 * - Fixed fees
 * - Percentage-based fees
 * - Tiered fees based on total amount
 * - Different fee structures per event type
 */

export interface FeeCalculationInput {
    ticketsSubtotal: number;
    recordsSubtotal: number;
    eventId?: number;
}

export interface FeeCalculationResult {
    platformFee: number;
    ticketsSubtotal: number;
    recordsSubtotal: number;
    subtotal: number;
    total: number;
    feeType: 'fixed' | 'percentage' | 'tiered';
}

/**
 * Calculate platform fee based on order details
 * 
 * Current implementation: (5% + £0.30) + 20% VAT
 * This covers Stripe fees (2.9% + 30p) plus a small platform margin, with VAT added
 * 
 * Examples:
 * - £10 ticket → £0.96 fee ((£0.50 + £0.30) × 1.2)
 * - £20 ticket → £1.56 fee ((£1.00 + £0.30) × 1.2)
 * - £50 ticket → £3.36 fee ((£2.50 + £0.30) × 1.2)
 * 
 * @param input - Order details
 * @returns Fee calculation breakdown
 */
export function calculatePlatformFee(input: FeeCalculationInput): FeeCalculationResult {
    const { ticketsSubtotal, recordsSubtotal } = input;
    const subtotal = ticketsSubtotal + recordsSubtotal;

    // Platform fee: (5% + £0.30) × 1.2 (to include 20% VAT)
    const feePercentage = 0.05; // 5%
    const fixedFee = 0.30; // £0.30
    const vatMultiplier = 1.2; // 20% VAT
    const platformFee = ((subtotal * feePercentage) + fixedFee) * vatMultiplier;

    // Round to 2 decimal places
    const roundedFee = Math.round(platformFee * 100) / 100;

    const total = subtotal + roundedFee;

    return {
        platformFee: roundedFee,
        ticketsSubtotal,
        recordsSubtotal,
        subtotal,
        total,
        feeType: 'percentage'
    };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number | string): string {
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    return `£${numAmount.toFixed(2)}`;
}

/**
 * Get platform fee description for display
 */
export function getPlatformFeeDescription(): string {
    return 'Service Fee (5% + £0.30) + 20% VAT';
}
