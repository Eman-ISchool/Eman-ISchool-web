/**
 * Grade Students API Endpoint
 * 
 * GET /api/grades/[id]/students - List all students for a grade (with export option)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/grades/[id]/students
 * 
 * List all students for a specific grade.
 * 
 * Query parameters:
 * - export: Set to 'csv' to export as CSV file
 * - status: Filter by enrollment status (active, completed, dropped, etc.)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const exportFormat = searchParams.get('export');
    const status = searchParams.get('status');

    // Query enrollments with student and course information
    let query = supabase
      .from('enrollments')
      .select(`
        *,
        student:student_id (
          id,
          name,
          email,
          phone,
          image
        ),
        course:course_id (
          id,
          title,
          grade_id
        )
      `)
      .eq('course.grade_id', params.id)
      .order('enrollment_date', { ascending: false });

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    const { data: enrollments, error } = await query;

    if (error) {
      console.error('Error fetching students for grade:', error);
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      );
    }

    // Check if export is requested
    if (exportFormat === 'csv') {
      return exportStudentsAsCSV(enrollments || []);
    }

    // Group students by unique student ID to avoid duplicates
    const uniqueStudents = new Map();
    enrollments?.forEach((enrollment: any) => {
      if (!uniqueStudents.has(enrollment.student.id)) {
        uniqueStudents.set(enrollment.student.id, {
          ...enrollment.student,
          enrollment_count: 1,
          courses: [enrollment.course],
        });
      } else {
        const student = uniqueStudents.get(enrollment.student.id);
        student.enrollment_count += 1;
        student.courses.push(enrollment.course);
      }
    });

    const students = Array.from(uniqueStudents.values());

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error in GET /api/grades/[id]/students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Export students as CSV file
 */
function exportStudentsAsCSV(enrollments: any[]): NextResponse {
  // Group students by unique student ID
  const uniqueStudents = new Map();
  enrollments.forEach((enrollment: any) => {
    if (!uniqueStudents.has(enrollment.student.id)) {
      uniqueStudents.set(enrollment.student.id, {
        ...enrollment.student,
        enrollment_count: 1,
        courses: [enrollment.course],
      });
    } else {
      const student = uniqueStudents.get(enrollment.student.id);
      student.enrollment_count += 1;
      student.courses.push(enrollment.course);
    }
  });

  const students = Array.from(uniqueStudents.values());

  // CSV headers
  const headers = [
    'Student ID',
    'Name',
    'Email',
    'Phone',
    'Enrollment Count',
    'Courses',
  ];

  // CSV rows
  const rows = students.map((student: any) => [
    student.id,
    student.name,
    student.email,
    student.phone || '',
    student.enrollment_count,
    student.courses.map((c: any) => c.title).join('; '),
  ]);

  // Build CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map((row: string[]) => 
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ),
  ].join('\n');

  // Create response with CSV content
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="students.csv"',
    },
  });
}
