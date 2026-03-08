import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        // Rate limiting: Check if there's a recent reset token for this email
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const { data: recentToken } = await supabaseAdmin
            .from('password_resets')
            .select('id')
            .eq('email', email)
            .gt('created_at', fifteenMinutesAgo.toISOString())
            .single();

        if (recentToken) {
            return NextResponse.json(
                { error: 'Too many requests. Please wait 15 minutes before trying again.' },
                { status: 429 }
            );
        }

        const { data: user } = await supabaseAdmin
            .from('users')
            .select('id, email, name')
            .eq('email', email)
            .single();

        if (!user) {
            // For security, do not reveal if user exists. Return success.
            return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
        }

        // Generate Token
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

        // Save to DB with hashed token for security (plaintext token is never persisted)
        const { error } = await supabaseAdmin
            .from('password_resets')
            .insert({
                user_id: user.id,
                email: email,
                token_hash: tokenHash, // Store hash for secure verification
                expires_at: expiresAt.toISOString(),
                used: false
            });

        if (error) {
            console.error('Error saving reset token:', error);
            // Fallback: Just return success to user, but log error
            return NextResponse.json({ success: true });
        }

        // Mock Send Email
        const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
        console.log('---------------------------------------------------');
        console.log(`[MOCK EMAIL] Password Reset for ${user.email}`);
        console.log(`Link: ${resetLink}`);
        console.log('---------------------------------------------------');

        return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
