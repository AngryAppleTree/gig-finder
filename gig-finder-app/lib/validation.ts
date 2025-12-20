import { z } from 'zod';

/**
 * Validation schemas for API inputs
 */

// Email validation
export const emailSchema = z.string().email().max(255);

// Event validation
export const eventSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    venue_id: z.number().int().positive().optional(),
    venue_name: z.string().max(200).optional(),
    ticket_price: z.number().min(0).max(10000),
    max_capacity: z.number().int().min(1).max(100000).optional(),
});

// Booking validation
export const bookingSchema = z.object({
    eventId: z.number().int().positive(),
    quantity: z.number().int().min(1).max(10),
    recordsQuantity: z.number().int().min(0).max(10).optional().default(0),
    recordsPrice: z.number().min(0).max(1000).optional().default(0),
    customerName: z.string().min(1).max(100),
    customerEmail: emailSchema,
});

// Search params validation
export const searchParamsSchema = z.object({
    keyword: z.string().max(100).optional(),
    location: z.string().max(100).optional(),
    genre: z.string().max(50).optional(),
    minDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    maxDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    budget: z.string().max(20).optional(),
    venueSize: z.string().max(20).optional(),
    postcode: z.string().max(10).optional(),
    distance: z.string().max(20).optional(),
});

// Guest list add validation
export const addGuestSchema = z.object({
    eventId: z.number().int().positive(),
    name: z.string().min(1).max(100),
    email: emailSchema,
    quantity: z.number().int().min(1).max(10).optional().default(1),
});

// Email broadcast validation
export const emailBroadcastSchema = z.object({
    eventId: z.number().int().positive(),
    subject: z.string().min(1).max(200),
    message: z.string().min(1).max(5000),
});

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize input
 */
export function validateAndSanitize<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; error: string } {
    try {
        const validated = schema.parse(data);
        return { success: true, data: validated };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const firstError = error.issues[0];
            return {
                success: false,
                error: `${firstError.path.join('.')}: ${firstError.message}`
            };
        }
        return { success: false, error: 'Invalid input' };
    }
}
