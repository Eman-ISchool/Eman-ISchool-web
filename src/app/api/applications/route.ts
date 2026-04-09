import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      bundleId,
      fullName,
      dateOfBirth,
      gender,
      password,
      phone,
      phoneCode,
      address,
      previousEducation,
      guardianName,
      guardianPhone,
      guardianPhoneCode,
    } = body;

    if (!fullName || !phone || !password) {
      return NextResponse.json(
        { error: 'الاسم ورقم الهاتف وكلمة المرور مطلوبة' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Check if phone already exists
    const normalizedPhone = `${phoneCode || '249'}${phone.replace(/\s/g, '')}`;
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'رقم الهاتف مسجل مسبقاً' },
        { status: 409 }
      );
    }

    // Create user account
    const passwordHash = await bcrypt.hash(password, 10);
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        name: fullName,
        phone: normalizedPhone,
        country_code: phoneCode || '249',
        role: 'student',
        password_hash: passwordHash,
        is_active: false, // Pending approval
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        address: address || null,
        previous_education: previousEducation || null,
        guardian_name: guardianName || null,
        guardian_phone: guardianPhone
          ? `${guardianPhoneCode || '249'}${guardianPhone.replace(/\s/g, '')}`
          : null,
      } as any)
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return NextResponse.json(
        { error: 'فشل في إنشاء الحساب' },
        { status: 500 }
      );
    }

    // Create enrollment application if bundle selected
    if (bundleId && newUser) {
      await supabaseAdmin.from('enrollment_applications').insert({
        user_id: (newUser as any).id,
        bundle_id: bundleId,
        status: 'pending',
        student_details: {
          fullName,
          dateOfBirth,
          gender,
          address,
          previousEducation,
        },
        parent_details: {
          guardianName,
          guardianPhone: guardianPhone
            ? `${guardianPhoneCode || '249'}${guardianPhone.replace(/\s/g, '')}`
            : null,
        },
      } as any);
    }

    return NextResponse.json({ success: true, message: 'تم إرسال الطلب بنجاح' });
  } catch (error) {
    console.error('Application submission error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال الطلب' },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin
    .from('enrollment_applications')
    .select('*, users!inner(name, email, phone)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ applications: data || [] });
}
