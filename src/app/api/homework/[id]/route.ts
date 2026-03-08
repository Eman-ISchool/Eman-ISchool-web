import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateRequestId } from '@/lib/request-id';

// GET - Fetch homework assignment by id
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const requestId = generateRequestId();
  const assignmentId = params.id;

  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured', code: 'DATABASE_NOT_CONFIGURED', requestId },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    const currentUser = session?.user ? await getCurrentUser(session) : null;

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED', requestId },
        { status: 401 }
      );
    }

    // Fetch assignment with lesson and course joins
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('assignments')
      .select(`
        *,
        lesson:lessons!assignments_lesson_id_fkey(id, title, course_id),
        course:courses!assignments_course_id_fkey(id, title, teacher_id)
      `)
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Assignment not found', code: 'NOT_FOUND', requestId },
        { status: 404 }
      );
    }

    // For students, include their submission
    let assignmentWithSubmission = assignment;
    if (currentUser.role === 'student') {
      const { data: submission } = await supabaseAdmin
        .from('assignment_submissions')
        .select('id, status, submitted_at')
        .eq('assignment_id', assignmentId)
        .eq('student_id', currentUser.id)
        .single();
      
      assignmentWithSubmission = {
        ...assignment,
        submission: submission || null,
      };
    }

    return NextResponse.json({ assignment: assignmentWithSubmission, requestId });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
      { status: 500 }
    );
  }
}

// PATCH - Update homework assignment
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const requestId = generateRequestId();
  const assignmentId = params.id;

  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured', code: 'DATABASE_NOT_CONFIGURED', requestId },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    const currentUser = session?.user ? await getCurrentUser(session) : null;

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED', requestId },
        { status: 401 }
      );
    }

    // Only teachers and admins can update homework
    if (!isTeacherOrAdmin(currentUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN', requestId },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, deadline, forms_link } = body;

    // Fetch assignment to validate lesson_id
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('assignments')
      .select('id, lesson_id')
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Assignment not found', code: 'NOT_FOUND', requestId },
        { status: 404 }
      );
    }

    // Validate lesson_id matches (optional, can be changed)
    if (body.lesson_id && body.lesson_id !== assignment.lesson_id) {
      return NextResponse.json(
        { error: 'Cannot change lesson_id', code: 'VALIDATION_ERROR', requestId },
        { status: 400 }
      );
    }

    // Update assignment
    const { data: updatedAssignment, error: updateError } = await supabaseAdmin
      .from('assignments')
      .update({
        title: title || assignment.title,
        description: description !== undefined ? description : assignment.description,
        deadline: deadline !== undefined ? deadline : assignment.deadline,
        forms_link: forms_link !== undefined ? forms_link : assignment.forms_link,
      })
      .eq('id', assignmentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating assignment:', updateError);
      return NextResponse.json(
        { error: 'Failed to update assignment', code: 'ASSIGNMENT_UPDATE_ERROR', requestId },
        { status: 500 }
      );
    }

    return NextResponse.json({ assignment: updatedAssignment, requestId });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
      { status: 500 }
    );
  }
}

// DELETE - Delete homework assignment
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const requestId = generateRequestId();
  const assignmentId = params.id;

  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured', code: 'DATABASE_NOT_CONFIGURED', requestId },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    const currentUser = session?.user ? await getCurrentUser(session) : null;

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED', requestId },
        { status: 401 }
      );
    }

    // Only teachers and admins can delete homework
    if (!isTeacherOrAdmin(currentUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN', requestId },
        { status: 403 }
      );
    }

    // Fetch assignment to verify ownership
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('assignments')
      .select(`
        *,
        lesson:lessons!assignments_lesson_id_fkey(id, title, course_id, teacher_id)
      `)
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Assignment not found', code: 'NOT_FOUND', requestId },
        { status: 404 }
      );
    }

    // Verify teacher owns the course or is admin
    const isOwner = assignment.lesson?.teacher_id === currentUser.id || isAdmin(currentUser.role);

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN', detail: 'You can only delete homework assignments for your own courses', requestId },
        { status: 403 }
      );
    }

    // Delete assignment
    const { error: deleteError } = await supabaseAdmin
      .from('assignments')
      .delete()
      .eq('id', assignmentId);

    if (deleteError) {
      console.error('Error deleting assignment:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete assignment', code: 'ASSIGNMENT_DELETE_ERROR', requestId },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, requestId });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
      { status: 500 }
    );
  }
}
