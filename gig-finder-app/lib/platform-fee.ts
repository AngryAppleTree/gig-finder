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
 * Current implementation: Fixed £1 fee
 * 
 * Future extensions could include:
 * - Percentage: fee = subtotal * feePercentage
 * - Tiered: different fees based on total amount
 * - Event-specific: different fees per event type
 * 
 * @param input - Order details
 * @returns Fee calculation breakdown
 */
export function calculatePlatformFee(input: FeeCalculationInput): FeeCalculationResult {
    const { ticketsSubtotal, recordsSubtotal } = input;
    const subtotal = ticketsSubtotal + recordsSubtotal;

    // Current implementation: Fixed £1 platform fee
    const platformFee = 1.00;

    // Future implementation examples (commented out):

    // Percentage-based fee (e.g., 5%):
    // const feePercentage = 0.05;
    // const platformFee = subtotal * feePercentage;

    // Tiered fee based on total:
    // let platformFee;
    // if (subtotal < 10) {
    //     platformFee = 0.50;
    // } else if (subtotal < 50) {
    //     platformFee = 1.00;
    // } else {
    //     platformFee = subtotal * 0.03; // 3% for orders over £50
    // }

    // Minimum fee with percentage:
    // const percentageFee = subtotal * 0.03;
    // const platformFee = Math.max(1.00, percentageFee);

    const total = subtotal + platformFee;

    return {
        platformFee,
        ticketsSubtotal,
        recordsSubtotal,
        subtotal,
        total,
        feeType: 'fixed'
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
    return 'Platform Fee';

    // Future: Could return different descriptions based on fee type
    // if (feeType === 'percentage') return 'Service Fee (5%)';
    // if (feeType === 'tiered') return 'Processing Fee';
}
