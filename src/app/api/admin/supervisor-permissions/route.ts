import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

const DEFAULT_SECTIONS = [
  { section_key: 'academic', section_label: 'الأكاديمي', is_allowed: true },
  { section_key: 'admin', section_label: 'الإدارة', is_allowed: false },
  { section_key: 'finance', section_label: 'المالية', is_allowed: false },
  { section_key: 'communication', section_label: 'التواصل', is_allowed: false },
  { section_key: 'content', section_label: 'المحتوى', is_allowed: false },
  { section_key: 'analytics', section_label: 'التحليلات', is_allowed: false },
  { section_key: 'data', section_label: 'إدارة البيانات', is_allowed: false },
];

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role?.toLowerCase();

  if (!role || (role !== 'admin' && role !== 'supervisor')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (!supabaseAdmin) {
    // Return defaults if Supabase not configured
    return NextResponse.json({ sections: DEFAULT_SECTIONS });
  }

  const { data, error } = await supabaseAdmin
    .from('supervisor_section_access')
    .select('section_key, section_label, is_allowed')
    .order('created_at');

  if (error) {
    // Table might not exist yet — return defaults
    return NextResponse.json({ sections: DEFAULT_SECTIONS });
  }

  return NextResponse.json({ sections: data.length > 0 ? data : DEFAULT_SECTIONS });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role?.toLowerCase();
  const userId = (session?.user as any)?.id;

  if (role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can modify permissions' }, { status: 403 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const body = await request.json();
  const { sections } = body as { sections: Array<{ section_key: string; is_allowed: boolean }> };

  if (!Array.isArray(sections)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const results: Array<{ section_key: string; status: string }> = [];

  for (const s of sections) {
    const { error } = await supabaseAdmin
      .from('supervisor_section_access')
      .upsert(
        {
          section_key: s.section_key,
          section_label: DEFAULT_SECTIONS.find(d => d.section_key === s.section_key)?.section_label || s.section_key,
          is_allowed: s.is_allowed,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'section_key' }
      );

    results.push({
      section_key: s.section_key,
      status: error ? `error: ${error.message}` : 'updated',
    });
  }

  return NextResponse.json({ message: 'Permissions updated', results });
}
