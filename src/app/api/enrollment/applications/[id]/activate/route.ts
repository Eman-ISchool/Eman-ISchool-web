import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { logEnrollmentAudit, canTransitionTo } from '@/lib/enrollment';
import type { EnrollmentAppStatus } from '@/types/enrollment';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
type RouteContext = { params: Promise<{ id: string }> };

// ── Default onboarding tasks ─────────────────────────────────

const DEFAULT_ONBOARDING_TASKS = [
  {
    task_key: 'uniform_collection',
    title_en: 'Collect School Uniform',
    title_ar: 'استلام الزي المدرسي',
    description_en: 'Visit the school store to collect the student uniform',
    description_ar: 'زيارة متجر المدرسة لاستلام الزي المدرسي',
    is_required: true,
    sort_order: 1,
  },
  {
    task_key: 'orientation_day',
    title_en: 'Attend Orientation Day',
    title_ar: 'حضور يوم التوجيه',
    description_en: 'Attend the student and parent orientation session',
    description_ar: 'حضور جلسة التوجيه للطالب وولي الأمر',
    is_required: true,
    sort_order: 2,
  },
  {
    task_key: 'platform_setup',
    title_en: 'Set Up Learning Platform Account',
    title_ar: 'إعداد حساب منصة التعلم',
    description_en: 'Log in to the student portal and complete profile setup',
    description_ar: 'تسجيل الدخول إلى بوابة الطالب وإكمال إعداد الملف الشخصي',
    is_required: true,
    sort_order: 3,
  },
  {
    task_key: 'bus_registration',
    title_en: 'Register for School Bus (Optional)',
    title_ar: 'التسجيل في حافلة المدرسة (اختياري)',
    description_en: 'Register for school transportation if needed',
    description_ar: 'التسجيل في النقل المدرسي إذا لزم الأمر',
    is_required: false,
    sort_order: 4,
  },
  {
    task_key: 'medical_form',
    title_en: 'Submit Medical Form to Clinic',
    title_ar: 'تقديم النموذج الطبي للعيادة',
    description_en: 'Deliver the completed medical form to the school clinic',
    description_ar: 'تسليم النموذج الطبي المكتمل لعيادة المدرسة',
    is_required: true,
    sort_order: 5,
  },
];

// ── POST: Activate enrollment ────────────────────────────────
// Admin only.
// 1. Verify app is approved/provisionally_accepted
// 2. Create student user account (or link existing)
// 3. Create enrollment record
// 4. Generate onboarding tasks
// 5. Update application status
// 6. Set linked_student_user_id
// 7. Log audit

export async function POST(req: Request, context: RouteContext) {
  try {
    const { id: applicationId } = await context.params;
    const session = await getServerSession(authOptions);
    const user = await getCurrentUser(session);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!isAdmin(user.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch application with related data
    const { data: application, error: appError } = await supabaseAdmin
      .from('enrollment_applications_v2')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // 1. Verify status allows activation
    const activatableStatuses: EnrollmentAppStatus[] = ['approved', 'provisionally_accepted'];
    if (!activatableStatuses.includes(application.status)) {
      return NextResponse.json(
        { error: `Cannot activate enrollment for application in '${application.status}' status. Must be 'approved' or 'provisionally_accepted'.` },
        { status: 400 },
      );
    }

    if (!canTransitionTo(application.status, 'enrollment_activated')) {
      return NextResponse.json(
        { error: `Invalid status transition from '${application.status}' to 'enrollment_activated'` },
        { status: 400 },
      );
    }

    // Check if already activated
    if (application.linked_student_user_id) {
      return NextResponse.json(
        { error: 'Enrollment has already been activated for this application' },
        { status: 409 },
      );
    }

    // Fetch student and academic details
    const [studentResult, academicResult] = await Promise.all([
      supabaseAdmin.from('enrollment_student_details').select('*').eq('application_id', applicationId).maybeSingle(),
      supabaseAdmin.from('enrollment_academic_details').select('*').eq('application_id', applicationId).maybeSingle(),
    ]);

    const studentDetails = studentResult.data;
    const academicDetails = academicResult.data;

    if (!studentDetails || !academicDetails) {
      return NextResponse.json(
        { error: 'Student or academic details missing' },
        { status: 400 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const existingStudentUserId = body.existing_student_user_id as string | undefined;

    let studentUserId: string;

    // 2. Create student user account or link existing
    if (existingStudentUserId) {
      // Verify the existing user exists
      const { data: existingUser, error: userErr } = await supabaseAdmin
        .from('users')
        .select('id, role')
        .eq('id', existingStudentUserId)
        .single();

      if (userErr || !existingUser) {
        return NextResponse.json({ error: 'Specified student user not found' }, { status: 404 });
      }

      studentUserId = existingStudentUserId;
    } else {
      // Create a new student user account
      const studentEmail = `student_${crypto.randomUUID().slice(0, 8)}@eduverse.local`;
      const { data: newUser, error: createErr } = await supabaseAdmin
        .from('users')
        .insert({
          email: studentEmail,
          name: studentDetails.full_name_en || 'New Student',
          role: 'student',
          last_login: null,
        })
        .select()
        .single();

      if (createErr) {
        throw new Error(`Failed to create student user: ${createErr.message}`);
      }

      studentUserId = newUser.id;
    }

    // 3. Create enrollment record in enrollments table
    const gradeId = academicDetails.applying_grade_id;

    // Find a course for this grade (if any) for enrollment
    let courseId: string | null = null;
    if (gradeId) {
      const { data: course } = await supabaseAdmin
        .from('courses')
        .select('id')
        .eq('grade_id', gradeId)
        .limit(1)
        .maybeSingle();
      courseId = course?.id || null;
    }

    if (courseId) {
      const { error: enrollErr } = await supabaseAdmin.from('enrollments').insert({
        user_id: studentUserId,
        course_id: courseId,
        status: 'active',
      });

      if (enrollErr) {
        console.error('Error creating enrollment record:', enrollErr);
        // Non-fatal: proceed even if enrollment record creation fails
      }
    }

    // 4. Generate onboarding tasks
    const onboardingTasks = DEFAULT_ONBOARDING_TASKS.map((task) => ({
      ...task,
      application_id: applicationId,
      student_user_id: studentUserId,
      is_completed: false,
    }));

    const { error: tasksErr } = await supabaseAdmin
      .from('student_onboarding_tasks')
      .insert(onboardingTasks);

    if (tasksErr) {
      console.error('Error creating onboarding tasks:', tasksErr);
      // Non-fatal: proceed
    }

    // 5. Update application status to enrollment_activated
    const previousStatus = application.status;
    const now = new Date().toISOString();

    const { data: updatedApp, error: updateErr } = await supabaseAdmin
      .from('enrollment_applications_v2')
      .update({
        status: 'enrollment_activated' as EnrollmentAppStatus,
        linked_student_user_id: studentUserId,
        activated_at: now,
        updated_at: now,
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // 6. Log status history
    await supabaseAdmin.from('enrollment_status_history').insert({
      application_id: applicationId,
      previous_status: previousStatus,
      new_status: 'enrollment_activated',
      changed_by: user.id,
      reason: 'Enrollment activated by admin',
    });

    // 7. Log audit
    await logEnrollmentAudit({
      applicationId,
      actorId: user.id,
      action: 'enrollment_activated',
      targetEntity: 'enrollment_applications_v2',
      targetId: applicationId,
      previousState: { status: previousStatus },
      newState: {
        status: 'enrollment_activated',
        linked_student_user_id: studentUserId,
        activated_at: now,
      },
    });

    // Link parent-student if parent_student table exists
    try {
      await supabaseAdmin.from('parent_student').insert({
        parent_id: application.parent_user_id,
        student_id: studentUserId,
      });
    } catch {
      // parent_student link is best-effort
    }

    return NextResponse.json({
      success: true,
      application: updatedApp,
      student_user_id: studentUserId,
      onboarding_tasks_created: onboardingTasks.length,
      message: 'Enrollment activated successfully',
    });
  } catch (error: any) {
    console.error('POST /api/enrollment/applications/[id]/activate error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
