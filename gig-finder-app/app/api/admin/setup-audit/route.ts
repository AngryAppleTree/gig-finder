import { NextResponse } from 'next/server';
import { createAuditLogsTable } from '@/lib/audit';

/**
 * Initialize audit logs table
 * GET /api/admin/setup-audit
 */
export async function GET() {
    try {
        await createAuditLogsTable();

        return NextResponse.json({
            success: true,
            message: 'Audit logs table created successfully'
        });
    } catch (error: any) {
        console.error('Failed to create audit logs table:', error);
        return NextResponse.json(
            { error: 'Failed to create audit logs table', details: error.message },
            { status: 500 }
        );
    }
}
