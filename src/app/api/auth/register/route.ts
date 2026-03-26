import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { buildStoredPhone } from '@/lib/auth-credentials';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name, phone, countryCode, consentGiven } = body;
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const storedPhone = buildStoredPhone(phone, countryCode);

        // Validation
        if (!normalizedEmail || !password || !name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (consentGiven !== true) {
            return NextResponse.json(
                { error: 'consentGiven must be true' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const { data: existingUser, error: existingUserError } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (existingUserError) {
            console.error('Registration email check failed:', existingUserError);
            return NextResponse.json(
                { error: 'Registration failed' },
                { status: 500 }
            );
        }

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        if (storedPhone) {
            const { data: existingPhoneUser, error: existingPhoneError } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('phone', storedPhone)
                .maybeSingle();

            if (existingPhoneError) {
                console.error('Registration phone check failed:', existingPhoneError);
                return NextResponse.json(
                    { error: 'Registration failed' },
                    { status: 500 }
                );
            }

            if (existingPhoneUser) {
                return NextResponse.json(
                    { error: 'User with this phone already exists' },
                    { status: 409 }
                );
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const { data: newUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert({
                email: normalizedEmail,
                name,
                password_hash: hashedPassword,
                role: 'parent',
                phone: storedPhone,
                is_active: true,
                email_verified: false, // Pending verification
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (createError) {
            console.error('Registration insert failed:', createError);
            return NextResponse.json(
                { error: 'Registration failed' },
                { status: 500 }
            );
        }

        // Return success (excluding password hash)
        const { password_hash: _password_hash, ...userResult } = newUser;

        return NextResponse.json(
            {
                message: 'Registration successful',
                user: userResult
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
