import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    if (!supabaseAdmin) return NextResponse.json({ error: 'No admin client' }, { status: 500 });
    const tables = ['users','grades','subjects','courses','lessons','enrollments','attendance','materials',
        'lesson_meetings','enrollment_applications','assessments','assessment_questions',
        'assessment_submissions','invoices','orders','support_tickets','discounts'];
    const counts: Record<string, number | string> = {};
    for (const t of tables) {
        const { count, error } = await supabaseAdmin.from(t).select('*', { count: 'exact', head: true });
        counts[t] = error ? `ERR: ${error.message}` : (count ?? 0);
    }
    return NextResponse.json(counts);
}
