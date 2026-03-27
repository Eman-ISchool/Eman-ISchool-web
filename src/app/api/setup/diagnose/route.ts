import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    const result: Record<string, any> = {};

    // 1. Check session
    const session = await getServerSession(authOptions);
    result.session = session ? {
        email: session.user?.email,
        name: session.user?.name,
        role: (session.user as any)?.role,
        id: (session.user as any)?.id,
    } : 'NO SESSION';

    // 2. Check getCurrentUser
    if (session) {
        const currentUser = await getCurrentUser(session);
        result.currentUser = currentUser || 'NULL (getCurrentUser returned null)';
    }

    // 3. Check table row counts
    if (supabaseAdmin) {
        const tables = ['users', 'grades', 'subjects', 'courses', 'lessons', 'enrollments',
            'attendance', 'materials', 'lesson_meetings', 'enrollment_applications',
            'assessments', 'assessment_questions', 'assessment_submissions',
            'invoices', 'orders', 'support_tickets', 'discounts'];

        const counts: Record<string, number | string> = {};
        for (const t of tables) {
            const { count, error } = await supabaseAdmin.from(t).select('*', { count: 'exact', head: true });
            counts[t] = error ? `ERR: ${error.message}` : (count ?? 0);
        }
        result.tableCounts = counts;
    }

    // 4. Check if Fadi/logged-in user email exists in users table
    if (session?.user?.email && supabaseAdmin) {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('id, email, name, role, is_active')
            .eq('email', session.user.email)
            .maybeSingle();
        result.dbUserLookup = data || `NOT FOUND (${error?.message || 'no error'})`;
    }

    return NextResponse.json(result);
}
