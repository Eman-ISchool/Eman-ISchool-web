import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = session.user as any;

    if (user.role !== 'parent') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        
        // Query parameters
        const status = searchParams.get('status') || null;
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build query with count
        let query = supabaseAdmin
            .from('invoices')
            .select(`
                *,
                enrollments:enrollments(
                    id,
                    student_id,
                    student:students(id, name),
                    course:courses(id, name, grade_level),
                    discount_percent
                ),
                payments(
                    id,
                    amount,
                    currency,
                    status,
                    paid_at
                )
            `, { count: 'exact' })
            .eq('parent_id', user.id)
            .order('created_at', { ascending: false });

        // Apply filters
        if (status) {
            query = query.eq('status', status);
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: invoices, count, error } = await query;

        if (error) throw error;

        return NextResponse.json({
            invoices: invoices || [],
            total: count || 0,
            limit,
            offset
        });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
