import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { validateEncryptionConfig } from '@/lib/encryption';
import { exchangeGoogleAuthCode, fetchGoogleProfile, GoogleIntegrationError } from '@/lib/google-meet';
import { storeGoogleTokens } from '@/lib/google-token';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
const GOOGLE_CONNECT_STATE_COOKIE = 'eduverse_google_connect_state';

interface GoogleConnectState {
    state: string;
    userId: string;
    returnTo: string;
    issuedAt: number;
}

function buildReturnUrl(request: NextRequest, returnTo: string) {
    return new URL(returnTo.startsWith('/') ? returnTo : '/dashboard', request.nextUrl.origin);
}

function attachResult(url: URL, status: 'connected' | 'error', message?: string, code?: string) {
    url.searchParams.set('googleStatus', status);
    if (message) {
        url.searchParams.set('googleMessage', message);
    }
    if (code) {
        url.searchParams.set('googleCode', code);
    }
    return url;
}

export async function GET(request: NextRequest) {
    const fallbackUrl = new URL('/dashboard', request.nextUrl.origin);
    const rawStateCookie = request.cookies.get(GOOGLE_CONNECT_STATE_COOKIE)?.value;

    let connectState: GoogleConnectState | null = null;
    if (rawStateCookie) {
        try {
            connectState = JSON.parse(rawStateCookie) as GoogleConnectState;
        } catch {
            connectState = null;
        }
    }

    const finish = (url: URL) => {
        const response = NextResponse.redirect(url);
        response.cookies.delete(GOOGLE_CONNECT_STATE_COOKIE);
        return response;
    };

    if (!connectState || !connectState.state || !connectState.userId) {
        return finish(
            attachResult(fallbackUrl, 'error', 'Google connection session expired. Please try again.', 'GOOGLE_AUTH_REQUIRED'),
        );
    }

    const returnUrl = buildReturnUrl(request, connectState.returnTo);
    const state = request.nextUrl.searchParams.get('state');
    const code = request.nextUrl.searchParams.get('code');
    const providerError = request.nextUrl.searchParams.get('error');

    if (providerError) {
        return finish(
            attachResult(returnUrl, 'error', providerError, 'GOOGLE_AUTH_REQUIRED'),
        );
    }

    if (!state || state !== connectState.state || !code) {
        return finish(
            attachResult(returnUrl, 'error', 'Invalid Google OAuth state.', 'GOOGLE_AUTH_REQUIRED'),
        );
    }

    const session = await getServerSession(authOptions);
    const currentUser = session ? await getCurrentUser(session) : null;

    if (!currentUser || currentUser.id !== connectState.userId) {
        return finish(
            attachResult(returnUrl, 'error', 'Please sign in again before connecting Google.', 'GOOGLE_AUTH_REQUIRED'),
        );
    }

    try {
        if (!validateEncryptionConfig()) {
            throw new GoogleIntegrationError(
                'GOOGLE_CONFIG_INVALID',
                'Token encryption is not configured. Set TOKEN_ENCRYPTION_KEY and TOKEN_ENCRYPTION_SALT.',
                { status: 500 },
            );
        }

        const tokens = await exchangeGoogleAuthCode(code, request.nextUrl.origin);
        const profile = await fetchGoogleProfile(tokens.access_token);

        const stored = await storeGoogleTokens(
            currentUser.id,
            tokens.access_token,
            tokens.refresh_token,
            tokens.expires_in,
        );

        if (!stored) {
            throw new Error('Failed to persist Google OAuth tokens.');
        }

        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                google_id: profile.sub,
                google_email: profile.email,
                google_connected_at: new Date().toISOString(),
            })
            .eq('id', currentUser.id);

        if (updateError) {
            throw updateError;
        }

        return finish(
            attachResult(returnUrl, 'connected', `Connected ${profile.email}`),
        );
    } catch (error) {
        const code =
            error instanceof GoogleIntegrationError
                ? error.code
                : 'GOOGLE_API_ERROR';
        const message =
            error instanceof Error
                ? error.message
                : 'Failed to connect Google.';

        return finish(attachResult(returnUrl, 'error', message, code));
    }
}
