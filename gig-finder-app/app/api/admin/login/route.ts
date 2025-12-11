import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    const body = await req.json();
    const { email, password } = body;

    // Hardcoded credentials as requested
    const VALID_EMAIL = 'alex.bunch@angryappletree.com';
    const VALID_PASSWORD = '123WeeWorkee123';

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
        // Set a cookie for the admin session
        // Valid for 24 hours
        const oneDay = 24 * 60 * 60 * 1000;

        const cookieStore = await cookies();
        cookieStore.set('gigfinder_admin', 'true', {
            expires: Date.now() + oneDay,
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
