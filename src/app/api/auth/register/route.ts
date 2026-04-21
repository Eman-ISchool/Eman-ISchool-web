import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { buildStoredPhone } from '@/lib/auth-credentials';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            email, password, name, phone, countryCode, consentGiven, role,
            base_salary, price_per_lesson, bank_name, bank_account,
            address, birth_date, image, salary_currency,
            previous_education, guardian_name, guardian_email, guardian_phone,
        } = body;
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

        // Check if user already exists by email
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

        // Check if user already exists by phone
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

        // Only allow non-admin roles for self-registration
        const allowedRoles = ['student', 'teacher', 'parent'];
        const userRole = allowedRoles.includes(role) ? role : 'student';

        // Core fields (always exist in the DB)
        const coreData: Record<string, unknown> = {
            email: normalizedEmail,
            name: name.trim(),
            password_hash: hashedPassword,
            role: userRole,
            phone: storedPhone,
            is_active: true,
            email_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        if (image) coreData.image = image;

        // Extended fields (may not exist yet — same pattern as admin/users)
        const extendedFields: Record<string, unknown> = {};
        if (base_salary) extendedFields.base_salary = base_salary;
        if (price_per_lesson) extendedFields.price_per_lesson = price_per_lesson;
        if (bank_name) extendedFields.bank_name = bank_name;
        if (bank_account) extendedFields.bank_account = bank_account;
        if (address) extendedFields.address = address;
        if (birth_date) extendedFields.birth_date = birth_date;
        if (salary_currency) extendedFields.salary_currency = salary_currency;
        if (previous_education) extendedFields.previous_education = previous_education;
        if (guardian_name) extendedFields.guardian_name = guardian_name;
        if (guardian_email) extendedFields.guardian_email = guardian_email;
        if (guardian_phone) extendedFields.guardian_phone = guardian_phone;

        // Try full insert (core + extended), fallback to core-only if columns missing
        let insertData = { ...coreData, ...extendedFields };
        let { data: newUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert(insertData)
            .select()
            .single();

        // If insert failed due to unknown column, retry with core fields only
        if (createError && (createError.message?.includes('column') || createError.code === '42703' || createError.code === 'PGRST204')) {
            console.warn('Extended columns missing, retrying with core fields only:', createError.message);
            const retryResult = await supabaseAdmin
                .from('users')
                .insert(coreData)
                .select()
                .single();
            newUser = retryResult.data;
            createError = retryResult.error;
        }

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
