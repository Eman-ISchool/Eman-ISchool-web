import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Database } from '@/types/database';

type ReelProgress = Database['public']['Tables']['reel_progress']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type Reel = Database['public']['Tables']['reels']['Row'];

/**
 * GET /api/admin/student-history
 * Fetches student reel watch history with filtering and summary stats
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');
    const gradeLevel = searchParams.get('gradeLevel');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sortBy = searchParams.get('sortBy') || 'last_watched_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    let query = supabaseAdmin
      .from('reel_progress')
      .select(`
        *,
        reels (
          id,
          title,
          description,
          video_url,
          duration_seconds,
          teacher_id,
          created_at
        ),
        users!reel_progress_user_id_fkey (
          id,
          name,
          email,
          class_id,
          grade_level
        )
      `, { count: 'exact' });

    // Apply filters
    if (studentId) {
      query = query.eq('user_id', studentId);
    }

    if (classId) {
      query = query.eq('users.class_id', classId);
    }

    if (gradeLevel) {
      query = query.eq('users.grade_level', gradeLevel);
    }

    if (startDate) {
      query = query.gte('last_watched_at', new Date(startDate).toISOString());
    }

    if (endDate) {
      query = query.lte('last_watched_at', new Date(endDate).toISOString());
    }

    // Apply sorting
    const column = sortBy === 'last_watched_at' ? 'last_watched_at' : 
                  sortBy === 'watch_count' ? 'watch_count' :
                  sortBy === 'progress_percent' ? 'progress_percent' : 'last_watched_at';
    
    query = query.order(column, { 
      ascending: sortOrder === 'asc' 
    });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Execute query
    const { data: progressData, error: progressError, count } = await query;

    if (progressError) {
      console.error('Error fetching student history:', progressError);
      return NextResponse.json(
        { error: 'Failed to fetch student history' },
        { status: 500 }
      );
    }

    // Calculate summary stats
    let statsQuery = supabaseAdmin
      .from('reel_progress')
      .select('user_id, watch_count, progress_percent, is_bookmarked, marked_understood');

    // Apply same filters to stats
    if (studentId) {
      statsQuery = statsQuery.eq('user_id', studentId);
    }

    if (classId) {
      statsQuery = statsQuery.eq('users.class_id', classId);
    }

    if (gradeLevel) {
      statsQuery = statsQuery.eq('users.grade_level', gradeLevel);
    }

    if (startDate) {
      statsQuery = statsQuery.gte('last_watched_at', new Date(startDate).toISOString());
    }

    if (endDate) {
      statsQuery = statsQuery.lte('last_watched_at', new Date(endDate).toISOString());
    }

    const { data: statsData, error: statsError } = await statsQuery;

    const summary = {
      totalViews: statsData?.reduce((sum, p) => sum + (p.watch_count || 0), 0) || 0,
      totalStudents: new Set(statsData?.map(p => p.user_id)).size || 0,
      totalReelsWatched: statsData?.length || 0,
      averageProgress: statsData && statsData.length > 0 
        ? statsData.reduce((sum, p) => sum + (p.progress_percent || 0), 0) / statsData.length 
        : 0,
      totalBookmarks: statsData?.filter(p => p.is_bookmarked).length || 0,
      totalUnderstood: statsData?.filter(p => p.marked_understood).length || 0,
    };

    // Get unique students list
    const { data: studentsData, error: studentsError } = await supabaseAdmin
      .from('reel_progress')
      .select(`
        user_id,
        users (
          id,
          name,
          email,
          class_id,
          grade_level
        )
      `);

    const uniqueStudents = studentsData?.reduce((acc: any[], p) => {
      if (!acc.find(s => s.id === p.user_id)) {
        acc.push(p.users);
      }
      return acc;
    }, []) || [];

    return NextResponse.json({
      success: true,
      data: progressData,
      summary,
      students: uniqueStudents,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in student-history route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
