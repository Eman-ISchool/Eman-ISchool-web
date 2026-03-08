import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Calculate password entropy (measure of password strength)
 * Higher values indicate stronger passwords
 */
function calculatePasswordEntropy(password: string): number {
    const charsetSize = 94; // Printable ASCII characters
    let entropy = 0;
    const frequency: Record<string, number> = {};

    for (const char of password) {
        frequency[char] = (frequency[char] || 0) + 1;
    }

    for (const char in frequency) {
        const probability = frequency[char] / password.length;
        entropy -= probability * Math.log2(probability);
    }

    return entropy * password.length;
}

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Password complexity validation (NIST recommends minimum 12 characters)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
        if (!passwordRegex.test(password)) {
            return NextResponse.json({
                error: 'Password must be at least 12 characters and contain uppercase, lowercase, number, and special character'
            }, { status: 400 });
        }

        // Additional entropy check (optional, for stronger passwords)
        const hasMinimumEntropy = calculatePasswordEntropy(password) >= 50;
        if (!hasMinimumEntropy) {
            return NextResponse.json({
                error: 'Password is too weak. Please use a more complex password.'
            }, { status: 400 });
        }

        // 1. Hash & provided token and find valid reset record
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Find by token_hash (secure method only)
        const { data: resetRecord, error } = await supabaseAdmin
            .from('password_resets')
            .select('*')
            .eq('token_hash', tokenHash)
            .eq('used', false)
            .single();

        if (error || !resetRecord) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        // 2. Check expiration
        if (new Date(resetRecord.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Token expired' }, { status: 400 });
        }

        // 3. Hash new password
        const passwordHash = await bcrypt.hash(password, 10);

        // 4. Update User
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ password_hash: passwordHash })
            .eq('id', resetRecord.user_id);

        if (updateError) {
            throw updateError;
        }

        // 5. Mark token as used and clean up old tokens
        await supabaseAdmin
            .from('password_resets')
            .update({ used: true })
            .eq('id', resetRecord.id);

        // 6. Clean up expired and used tokens for this user to prevent database bloat
        await supabaseAdmin
            .from('password_resets')
            .delete()
            .or(`user_id.eq.${resetRecord.user_id},expires_at.lt.${new Date().toISOString()},used.eq.true`);

        return NextResponse.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
