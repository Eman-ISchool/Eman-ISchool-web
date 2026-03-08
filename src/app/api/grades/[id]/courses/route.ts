/**
 * Grade Courses API Endpoint
 *
 * GET /api/grades/[id]/courses - List all courses for a grade
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/grades/[id]/courses
 * 
 * List all courses for a specific grade.
 * 
 * Query parameters:
 * - is_published: Filter by published status (true/false)
 * - subject: Filter by subject
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const searchParams = request.nextUrl.searchParams;
    const isPublished = searchParams.get('is_published');
    const subject = searchParams.get('subject');

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    let query = supabase
      .from('courses')
      .select('*')
      .eq('grade_id', params.id)
      .order('title', { ascending: true });

    // Apply filters
    if (isPublished !== null) {
      query = query.eq('is_published', isPublished === 'true');
    }

    if (subject) {
      query = query.ilike('subject', `%${subject}%`);
    }

    // Parent access: Fetch courses where their children are enrolled
    if (user.role === 'parent') {
      const { data: children, error: childrenError } = await supabase
        .from('users')
        .select('id')
        .eq('parent_id', user.id);

      if (childrenError || !children || children.length === 0) {
        return NextResponse.json({ courses: [] });
      }

      const childIds = children.map(c => c.id);

      // Fetch enrollments for all children
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses(id, title, description, grade_id, teacher_id, thumbnail_url),
          grades(id, title, level),
          teachers(id, name, email)
        `)
        .in('student_id', childIds)
        .eq('status', 'active');

      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
        return NextResponse.json(
          { error: 'Failed to fetch enrollments' },
          { status: 500 }
        );
      }

      // Filter by grade_id
      const gradeEnrollments = enrollments?.filter(e => e.courses?.grade_id === params.id) || [];

      return NextResponse.json({ courses: gradeEnrollments });
    }

    // Admin, teacher, supervisor access: Fetch all courses for the grade
    const { data: courses, error } = await query;

    if (error) {
      console.error('Error fetching courses for grade:', error);
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      );
    }

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error in GET /api/grades/[id]/courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
