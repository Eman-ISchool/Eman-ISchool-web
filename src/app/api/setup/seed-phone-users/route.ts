import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

const PHONE_USERS = [
  {
    email: 'student-phone@eduverse.local',
    name: 'Student User',
    phone: '+962790320148',
    password: '12345678',
    role: 'student',
  },
  {
    email: 'teacher-phone@eduverse.local',
    name: 'Teacher User',
    phone: '+962790320147',
    password: '12345678',
    role: 'teacher',
  },
  {
    email: 'admin-phone@eduverse.local',
    name: 'Admin User',
    phone: '+962790320146',
    password: '12345678',
    role: 'admin',
  },
  {
    email: 'supervisor-phone@eduverse.local',
    name: 'Supervisor User',
    phone: '+962790320145',
    password: '12345678',
    role: 'supervisor',
  },
];

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase admin client not configured' }, { status: 500 });
  }

  const results: Array<{ phone: string; status: string; role: string }> = [];

  for (const user of PHONE_USERS) {
    // Check if user already exists by phone
    const { data: existingByPhone } = await supabaseAdmin
      .from('users')
      .select('id, phone, role')
      .eq('phone', user.phone)
      .maybeSingle();

    if (existingByPhone) {
      results.push({ phone: user.phone, status: 'already_exists', role: existingByPhone.role });
      continue;
    }

    // Also check by email
    const { data: existingByEmail } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('email', user.email)
      .maybeSingle();

    if (existingByEmail) {
      // Update existing record with phone number
      await supabaseAdmin
        .from('users')
        .update({ phone: user.phone, updated_at: new Date().toISOString() })
        .eq('email', user.email);
      results.push({ phone: user.phone, status: 'updated_phone', role: existingByEmail.role });
      continue;
    }

    const password_hash = await bcrypt.hash(user.password, 10);

    const { error } = await supabaseAdmin
      .from('users')
      .insert({
        email: user.email,
        name: user.name,
        phone: user.phone,
        password_hash,
        role: user.role,
        is_active: true,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      results.push({ phone: user.phone, status: `error: ${error.message}`, role: user.role });
    } else {
      results.push({ phone: user.phone, status: 'created', role: user.role });
    }
  }

  return NextResponse.json({
    message: 'Phone-based user seed complete',
    results,
    credentials: [
      { role: 'student', country: 'Jordan (+962)', mobile: '790320148', password: '12345678' },
      { role: 'teacher', country: 'Jordan (+962)', mobile: '790320147', password: '12345678' },
      { role: 'admin', country: 'Jordan (+962)', mobile: '790320146', password: '12345678' },
      { role: 'supervisor', country: 'Jordan (+962)', mobile: '790320145', password: '12345678' },
    ],
  });
}
