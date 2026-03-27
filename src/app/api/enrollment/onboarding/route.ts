import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin, hasRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { logEnrollmentAudit } from '@/lib/enrollment';

// ── GET: Get onboarding tasks for current student ────────────
// Looks up tasks by linked_student_user_id.

export async function GET(_req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = await getCurrentUser(session);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let studentUserId: string;

    if (hasRole(user.role, ['student'])) {
      studentUserId = user.id;
    } else if (isAdmin(user.role)) {
      // Admin can query any student's tasks via query param
      const { searchParams } = new URL(_req.url);
      const queryStudentId = searchParams.get('student_user_id');
      if (!queryStudentId) {
        return NextResponse.json(
          { error: 'Admin must provide student_user_id query parameter' },
          { status: 400 },
        );
      }
      studentUserId = queryStudentId;
    } else if (hasRole(user.role, ['parent'])) {
      // Parent: find student linked to their applications
      const { data: apps } = await supabaseAdmin
        .from('enrollment_applications_v2')
        .select('linked_student_user_id')
        .eq('parent_user_id', user.id)
        .not('linked_student_user_id', 'is', null);

      const studentIds = (apps || [])
        .map((a: any) => a.linked_student_user_id)
        .filter(Boolean);

      if (studentIds.length === 0) {
        return NextResponse.json({ tasks: [], message: 'No activated enrollments found' });
      }

      // Return tasks for all linked students
      const { data: tasks, error } = await supabaseAdmin
        .from('student_onboarding_tasks')
        .select('*')
        .in('student_user_id', studentIds)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return NextResponse.json({ tasks: tasks || [] });
    } else {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch tasks for the student
    const { data: tasks, error } = await supabaseAdmin
      .from('student_onboarding_tasks')
      .select('*')
      .eq('student_user_id', studentUserId)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ tasks: tasks || [] });
  } catch (error: any) {
    console.error('GET /api/enrollment/onboarding error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ── PUT: Complete an onboarding task ─────────────────────────
// Body: { task_id }

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = await getCurrentUser(session);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { task_id } = body;

    if (!task_id) {
      return NextResponse.json({ error: '"task_id" is required' }, { status: 400 });
    }

    // Fetch the task
    const { data: task, error: taskError } = await supabaseAdmin
      .from('student_onboarding_tasks')
      .select('*')
      .eq('id', task_id)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: 'Onboarding task not found' }, { status: 404 });
    }

    // Verify access: student can complete their own tasks, admin can complete any
    if (!isAdmin(user.role)) {
      if (hasRole(user.role, ['student']) && task.student_user_id !== user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      if (hasRole(user.role, ['parent'])) {
        // Verify this task belongs to one of the parent's children
        const { data: app } = await supabaseAdmin
          .from('enrollment_applications_v2')
          .select('id')
          .eq('id', task.application_id)
          .eq('parent_user_id', user.id)
          .maybeSingle();

        if (!app) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
      }
    }

    // Check if already completed
    if (task.is_completed) {
      return NextResponse.json(
        { error: 'Task is already completed', task },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();

    // Mark task as completed
    const { data: updatedTask, error: updateError } = await supabaseAdmin
      .from('student_onboarding_tasks')
      .update({
        is_completed: true,
        completed_at: now,
        completed_by: user.id,
        updated_at: now,
      })
      .eq('id', task_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log audit
    await logEnrollmentAudit({
      applicationId: task.application_id,
      actorId: user.id,
      action: 'onboarding_task_completed',
      targetEntity: 'student_onboarding_tasks',
      targetId: task_id,
      previousState: { is_completed: false },
      newState: { is_completed: true, completed_at: now },
    });

    // Check if all required tasks are completed
    const { data: allTasks } = await supabaseAdmin
      .from('student_onboarding_tasks')
      .select('is_required, is_completed')
      .eq('application_id', task.application_id);

    const requiredTasks = (allTasks || []).filter((t: any) => t.is_required);
    const allRequiredComplete = requiredTasks.every((t: any) => t.is_completed);

    return NextResponse.json({
      success: true,
      task: updatedTask,
      all_required_complete: allRequiredComplete,
      message: allRequiredComplete
        ? 'All required onboarding tasks completed!'
        : 'Task marked as completed',
    });
  } catch (error: any) {
    console.error('PUT /api/enrollment/onboarding error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
