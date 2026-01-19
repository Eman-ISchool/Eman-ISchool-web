import { google } from 'googleapis';
import { supabaseAdmin } from './supabase';

/**
 * Google Token Management Utility
 * Handles storing, retrieving, and refreshing Google OAuth tokens
 */

interface GoogleTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
}

interface TokenRefreshResult {
    success: boolean;
    accessToken?: string;
    error?: string;
}

/**
 * Store Google tokens in the database for a user
 */
export async function storeGoogleTokens(
    userId: string,
    accessToken: string,
    refreshToken?: string,
    expiresIn?: number
): Promise<boolean> {
    if (!supabaseAdmin) {
        console.error('Supabase admin not configured');
        return false;
    }

    const expiresAt = expiresIn
        ? new Date(Date.now() + expiresIn * 1000)
        : new Date(Date.now() + 3600 * 1000); // Default 1 hour

    try {
        const updateData: any = {
            google_access_token: accessToken,
            google_token_expires_at: expiresAt.toISOString(),
        };

        // Only update refresh token if provided (it's not always returned)
        if (refreshToken) {
            updateData.google_refresh_token = refreshToken;
        }

        const { error } = await supabaseAdmin
            .from('users')
            .update(updateData)
            .eq('id', userId);

        if (error) {
            console.error('Error storing Google tokens:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error storing Google tokens:', error);
        return false;
    }
}

/**
 * Get stored Google tokens for a user
 */
export async function getGoogleTokens(userId: string): Promise<GoogleTokens | null> {
    if (!supabaseAdmin) {
        console.error('Supabase admin not configured');
        return null;
    }

    try {
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('google_access_token, google_refresh_token, google_token_expires_at')
            .eq('id', userId)
            .single();

        if (error || !user) {
            console.error('Error fetching Google tokens:', error);
            return null;
        }

        const userData = user as any;
        if (!userData.google_access_token) {
            return null;
        }

        return {
            accessToken: userData.google_access_token,
            refreshToken: userData.google_refresh_token,
            expiresAt: userData.google_token_expires_at
                ? new Date(userData.google_token_expires_at)
                : undefined,
        };
    } catch (error) {
        console.error('Error fetching Google tokens:', error);
        return null;
    }
}

/**
 * Check if a token is expired (or will expire in the next 5 minutes)
 */
export function isTokenExpired(expiresAt?: Date): boolean {
    if (!expiresAt) return true;

    const bufferMs = 5 * 60 * 1000; // 5 minutes buffer
    return new Date().getTime() > expiresAt.getTime() - bufferMs;
}

/**
 * Refresh an expired Google access token using the refresh token
 */
export async function refreshGoogleToken(
    userId: string,
    refreshToken: string
): Promise<TokenRefreshResult> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return {
            success: false,
            error: 'Google OAuth credentials not configured',
        };
    }

    try {
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
        oauth2Client.setCredentials({ refresh_token: refreshToken });

        const { credentials } = await oauth2Client.refreshAccessToken();

        if (!credentials.access_token) {
            return {
                success: false,
                error: 'Failed to refresh token - no access token returned',
            };
        }

        // Store the new tokens
        await storeGoogleTokens(
            userId,
            credentials.access_token,
            credentials.refresh_token || undefined,
            credentials.expiry_date
                ? Math.floor((credentials.expiry_date - Date.now()) / 1000)
                : undefined
        );

        return {
            success: true,
            accessToken: credentials.access_token,
        };
    } catch (error: any) {
        console.error('Error refreshing Google token:', error);
        return {
            success: false,
            error: error.message || 'Token refresh failed',
        };
    }
}

/**
 * Get a valid Google access token for a user
 * Automatically refreshes if expired
 */
export async function getValidGoogleToken(userId: string): Promise<TokenRefreshResult> {
    const tokens = await getGoogleTokens(userId);

    if (!tokens) {
        return {
            success: false,
            error: 'لم يتم ربط حساب Google. يرجى تسجيل الدخول باستخدام Google.',
        };
    }

    // Check if token is still valid
    if (!isTokenExpired(tokens.expiresAt)) {
        return {
            success: true,
            accessToken: tokens.accessToken,
        };
    }

    // Token expired - try to refresh
    if (!tokens.refreshToken) {
        return {
            success: false,
            error: 'انتهت صلاحية الجلسة. يرجى إعادة تسجيل الدخول باستخدام Google.',
        };
    }

    return refreshGoogleToken(userId, tokens.refreshToken);
}

/**
 * Check if a user has Google connected
 */
export async function hasGoogleConnection(userId: string): Promise<boolean> {
    const tokens = await getGoogleTokens(userId);
    return tokens !== null && tokens.accessToken !== null;
}

/**
 * Clear Google tokens for a user (on disconnect or sign out)
 */
export async function clearGoogleTokens(userId: string): Promise<boolean> {
    if (!supabaseAdmin) {
        return false;
    }

    try {
        const { error } = await supabaseAdmin
            .from('users')
            .update({
                google_access_token: null,
                google_refresh_token: null,
                google_token_expires_at: null,
            })
            .eq('id', userId);

        return !error;
    } catch (error) {
        console.error('Error clearing Google tokens:', error);
        return false;
    }
}
