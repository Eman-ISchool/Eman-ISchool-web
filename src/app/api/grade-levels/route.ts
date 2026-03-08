import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateRequestId } from '@/lib/request-id';

export async function GET(request: Request) {
  const requestId = generateRequestId();

  try {
    if (process.env.TEST_BYPASS === 'true') {
      const { getMockDb } = require('@/lib/mockDb');
      const grades = getMockDb().grades || [];
      return NextResponse.json({ grades, total: grades.length, requestId }, { status: 200 });
    }

    // Fetch all active grades ordered by sort_order
    const { data: grades, error } = await supabaseAdmin
      .from('grades')
      .select('id, name, name_en, slug, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[grade-levels] Error fetching grades:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch grade levels',
          code: 'GRADE_FETCH_ERROR',
          requestId,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        grades: grades || [],
        total: grades?.length || 0,
        requestId,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[grade-levels] Unexpected error:', err);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        code: 'INTERNAL_SERVER_ERROR',
        requestId,
      },
      { status: 500 }
    );
  }
}
