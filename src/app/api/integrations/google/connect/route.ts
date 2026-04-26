import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { buildGoogleConnectUrl } from '@/lib/google-meet';

export const dynamic = 'force-dynamic';
const GOOGLE_CONNECT_STATE_COOKIE = 'eduverse_google_connect_state';

function sanitizeReturnTo(value: string | null | undefined) {
    if (!value || !value.startsWith('/')) {
        return '/dashboard';
    }

    if (value.startsWith('//')) {
        return '/dashboard';
    }

    return value;
}

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    const currentUser = session ? await getCurrentUser(session) : null;

    if (!currentUser) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    const returnTo = sanitizeReturnTo(request.nextUrl.searchParams.get('returnTo'));
    const state = randomUUID();
    const authUrl = buildGoogleConnectUrl({
        state,
        appBaseUrl: request.nextUrl.origin,
    });

    const response = NextResponse.redirect(authUrl);
    response.cookies.set(
        GOOGLE_CONNECT_STATE_COOKIE,
        JSON.stringify({
            state,
            userId: currentUser.id,
            returnTo,
            issuedAt: Date.now(),
        }),
        {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 10,
        },
    );

    return response;
}
