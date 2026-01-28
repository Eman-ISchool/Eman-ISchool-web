import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from '@/lib/session-api';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/reels/feed
 * Returns visibility-filtered reels for students with pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build query
    let query = supabase
      .from('reels')
      .select(`
        *,
        reel_visibility (
          id,
          visibility_type,
          class_id,
          grade_level,
          group_id
        )
      `)
      .eq('status', 'published');

    // Apply visibility filter
    if (filter !== 'all') {
      if (filter === 'bookmarked') {
        query = query.eq('is_bookmarked', true);
      } else if (filter === 'not_understood') {
        query = query.eq('is_understood', false);
      }
    }

    // Get user's class and grade level from session
    const userClassId = session.user?.class_id;
    const userGradeLevel = session.user?.grade_level;

    // Apply visibility filter for student's class
    if (userClassId) {
      query = query.or(`reel_visibility.class_id.eq.${userClassId}`);
    }

    // Apply visibility filter for student's grade level
    if (userGradeLevel) {
      query = query.or(`reel_visibility.grade_level.eq.${userGradeLevel}`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: reels, error } = await query;

    if (error) {
      console.error('[API] Error fetching student feed:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reels' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reels,
      pagination: {
        limit,
        offset,
        total: reels?.length || 0,
      },
    });
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
