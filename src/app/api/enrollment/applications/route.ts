import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin, hasRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { logEnrollmentAudit } from '@/lib/enrollment';
import type { EnrollmentAppStatus } from '@/types/enrollment';

export const dynamic = 'force-dynamic';
// ── GET: List applications ───────────────────────────────────
// Admin: all applications with filters (status, grade, transfer_source, academic_year)
// Parent: only their own applications

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = await getCurrentUser(session);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as EnrollmentAppStatus | null;
    const grade = searchParams.get('grade');
    const transferSource = searchParams.get('transfer_source');
    const academicYear = searchParams.get('academic_year');
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 100);
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('enrollment_applications_v2')
      .select(
        `
        *,
        enrollment_student_details(*),
        enrollment_academic_details(*)
      `,
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Role-based filtering: parents can only see their own
    if (!isAdmin(user.role)) {
      if (!hasRole(user.role, ['parent'])) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      query = query.eq('parent_user_id', user.id);
    }

    // Optional filters (primarily for admin)
    if (status) {
      query = query.eq('status', status);
    }
    if (academicYear) {
      query = query.eq('academic_year', academicYear);
    }

    const { data: applications, error, count } = await query;
    if (error) throw error;

    // Post-query filtering for joined table fields
    let filtered = applications || [];
    if (grade) {
      filtered = filtered.filter(
        (app: any) => app.enrollment_academic_details?.applying_grade_id === grade,
      );
    }
    if (transferSource) {
      filtered = filtered.filter(
        (app: any) => app.enrollment_academic_details?.transfer_source === transferSource,
      );
    }

    // Build summary response
    const summaries = filtered.map((app: any) => ({
      id: app.id,
      application_number: app.application_number,
      status: app.status,
      completeness_score: app.completeness_score,
      academic_year: app.academic_year,
      current_step: app.current_step,
      student_name_en: app.enrollment_student_details?.full_name_en ?? null,
      student_name_ar: app.enrollment_student_details?.full_name_ar ?? null,
      applying_grade_name: app.enrollment_academic_details?.applying_grade_name ?? null,
      enrollment_type: app.enrollment_academic_details?.enrollment_type ?? null,
      submitted_at: app.submitted_at,
      created_at: app.created_at,
      updated_at: app.updated_at,
    }));

    return NextResponse.json({
      applications: summaries,
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
      },
    });
  } catch (error: any) {
    console.error('GET /api/enrollment/applications error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ── POST: Create new draft application ───────────────────────
// Only parent role. Creates application + empty related detail records.

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = await getCurrentUser(session);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user.role, ['parent']) && !isAdmin(user.role)) {
      return NextResponse.json(
        { error: 'Only parents can create enrollment applications' },
        { status: 403 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const academicYear = body.academic_year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

    // Create the application record
    const { data: application, error: appError } = await supabaseAdmin
      .from('enrollment_applications_v2')
      .insert({
        parent_user_id: user.id,
        academic_year: academicYear,
        status: 'draft' as EnrollmentAppStatus,
        completeness_score: 0,
        current_step: 1,
        steps_completed: [],
      })
      .select()
      .single();

    if (appError) throw appError;

    const appId = application.id;

    // Create empty related detail records in parallel
    const [studentResult, academicResult, identityResult, medicalResult, declarationsResult] =
      await Promise.all([
        supabaseAdmin
          .from('enrollment_student_details')
          .insert({ application_id: appId })
          .select()
          .single(),
        supabaseAdmin
          .from('enrollment_academic_details')
          .insert({
            application_id: appId,
            is_mid_year_transfer: false,
            transcript_available: false,
            transfer_certificate_available: false,
          })
          .select()
          .single(),
        supabaseAdmin
          .from('enrollment_identity_details')
          .insert({
            application_id: appId,
            emirates_id_available: false,
          })
          .select()
          .single(),
        supabaseAdmin
          .from('enrollment_medical_details')
          .insert({
            application_id: appId,
            has_medical_condition: false,
            has_sen: false,
            vaccination_record_available: false,
          })
          .select()
          .single(),
        supabaseAdmin
          .from('enrollment_declarations')
          .insert({
            application_id: appId,
            info_correct: false,
            docs_authentic: false,
            accepts_verification: false,
            acknowledges_attestation: false,
            acknowledges_missing_delays: false,
            privacy_policy_accepted: false,
          })
          .select()
          .single(),
      ]);

    // Check for errors in related record creation
    const subErrors = [studentResult, academicResult, identityResult, medicalResult, declarationsResult]
      .filter((r) => r.error)
      .map((r) => r.error?.message);

    if (subErrors.length > 0) {
      console.error('Error creating related enrollment records:', subErrors);
      // Clean up the application if related records failed
      await supabaseAdmin.from('enrollment_applications_v2').delete().eq('id', appId);
      throw new Error(`Failed to create enrollment detail records: ${subErrors.join(', ')}`);
    }

    // Log audit
    await logEnrollmentAudit({
      applicationId: appId,
      actorId: user.id,
      action: 'application_created',
      targetEntity: 'enrollment_applications_v2',
      targetId: appId,
      newState: { status: 'draft', academic_year: academicYear },
    });

    // Log initial status history
    await supabaseAdmin.from('enrollment_status_history').insert({
      application_id: appId,
      previous_status: null,
      new_status: 'draft',
      changed_by: user.id,
      reason: 'Application created',
    });

    return NextResponse.json(
      {
        success: true,
        application: {
          ...application,
          student_details: studentResult.data,
          academic_details: academicResult.data,
          identity_details: identityResult.data,
          medical_details: medicalResult.data,
          declarations: declarationsResult.data,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('POST /api/enrollment/applications error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
