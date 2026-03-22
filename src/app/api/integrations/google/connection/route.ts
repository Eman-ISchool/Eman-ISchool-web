import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { clearGoogleTokens } from '@/lib/google-token';
import { supabaseAdmin } from '@/lib/supabase';

export const GET = withAuth(async (_req, { user, requestId }) => {
    const { data, error } = await supabaseAdmin
        .from('users')
        .select('google_email, google_connected_at, google_token_expires_at, google_refresh_token')
        .eq('id', user.id)
        .single();

    if (error) {
        return NextResponse.json(
            { error: 'Failed to load Google connection status.', code: 'FETCH_ERROR', requestId },
            { status: 500 },
        );
    }

    const userData = data as {
        google_email?: string | null;
        google_connected_at?: string | null;
        google_token_expires_at?: string | null;
        google_refresh_token?: string | null;
    } | null;

    return NextResponse.json({
        connected: !!userData?.google_email,
        googleEmail: userData?.google_email || null,
        connectedAt: userData?.google_connected_at || null,
        expiresAt: userData?.google_token_expires_at || null,
        hasRefreshToken: !!userData?.google_refresh_token,
        requestId,
    });
});

export const DELETE = withAuth(async (_req, { user, requestId }) => {
    const cleared = await clearGoogleTokens(user.id);

    if (!cleared) {
        return NextResponse.json(
            { error: 'Failed to disconnect Google.', code: 'DISCONNECT_ERROR', requestId },
            { status: 500 },
        );
    }

    return NextResponse.json({ success: true, requestId });
});
