import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';


export async function POST() {
    const client = await getPool().connect();

    try {
        console.log('🔧 Adding missing columns to bookings table...');

        // Add payment_intent_id column
        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS payment_intent_id TEXT
        `);
        console.log('✅ payment_intent_id column added');

        // Add qr_code column
        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS qr_code TEXT
        `);
        console.log('✅ qr_code column added');

        // Get updated schema
        const schemaRes = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'bookings'
            ORDER BY ordinal_position
        `);

        return NextResponse.json({
            success: true,
            message: 'Migration completed successfully',
            columns: schemaRes.rows
        });

    } catch (error: any) {
        console.error('Migration failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    } finally {
        client.release();
    }
}
