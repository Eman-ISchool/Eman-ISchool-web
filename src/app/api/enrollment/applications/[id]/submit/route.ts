import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, hasRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { validateForSubmission, logEnrollmentAudit } from '@/lib/enrollment';
import type { EnrollmentAppStatus } from '@/types/enrollment';

type RouteContext = { params: Promise<{ id: string }> };

// ── POST: Submit application ─────────────────────────────────
// Validates all sections. Checks required documents.
// Changes status to 'submitted'. Returns blockers if validation fails.

export async function POST(_req: Request, context: RouteContext) {
  try {
    const { id: applicationId } = await context.params;
    const session = await getServerSession(authOptions);
    const user = await getCurrentUser(session);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user.role, ['parent'])) {
      return NextResponse.json(
        { error: 'Only parents can submit applications' },
        { status: 403 },
      );
    }

    // Fetch the application
    const { data: application, error: appError } = await supabaseAdmin
      .from('enrollment_applications_v2')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Only the owner can submit
    if (application.parent_user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Only draft or action_required applications can be submitted
    const submittableStatuses: EnrollmentAppStatus[] = ['draft', 'action_required', 'incomplete'];
    if (!submittableStatuses.includes(application.status)) {
      return NextResponse.json(
        { error: `Cannot submit application in '${application.status}' status` },
        { status: 400 },
      );
    }

    // Fetch all related data for validation
    const [studentResult, academicResult, guardiansResult, identityResult, medicalResult, declarationsResult, documentsResult] =
      await Promise.all([
        supabaseAdmin.from('enrollment_student_details').select('*').eq('application_id', applicationId).maybeSingle(),
        supabaseAdmin.from('enrollment_academic_details').select('*').eq('application_id', applicationId).maybeSingle(),
        supabaseAdmin.from('enrollment_guardian_details').select('*').eq('application_id', applicationId),
        supabaseAdmin.from('enrollment_identity_details').select('*').eq('application_id', applicationId).maybeSingle(),
        supabaseAdmin.from('enrollment_medical_details').select('*').eq('application_id', applicationId).maybeSingle(),
        supabaseAdmin.from('enrollment_declarations').select('*').eq('application_id', applicationId).maybeSingle(),
        supabaseAdmin.from('enrollment_documents').select('*').eq('application_id', applicationId),
      ]);

    // Run full submission validation
    const validationResult = validateForSubmission({
      studentDetails: studentResult.data,
      academicDetails: academicResult.data,
      guardians: guardiansResult.data || [],
      identityDetails: identityResult.data,
      medicalDetails: medicalResult.data,
      declarations: declarationsResult.data,
      documents: documentsResult.data || [],
    });

    if (!validationResult.valid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Application has validation errors that must be resolved before submission',
          blockers: validationResult.errors,
        },
        { status: 422 },
      );
    }

    const previousStatus = application.status;
    const now = new Date().toISOString();

    // Update application status to submitted
    const { data: updatedApp, error: updateError } = await supabaseAdmin
      .from('enrollment_applications_v2')
      .update({
        status: 'submitted' as EnrollmentAppStatus,
        submitted_at: now,
        completeness_score: 100,
        updated_at: now,
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log status history
    await supabaseAdmin.from('enrollment_status_history').insert({
      application_id: applicationId,
      previous_status: previousStatus,
      new_status: 'submitted',
      changed_by: user.id,
      reason: 'Application submitted by parent',
    });

    // Update document statuses: uploaded -> pending_review
    await supabaseAdmin
      .from('enrollment_documents')
      .update({ status: 'pending_review' })
      .eq('application_id', applicationId)
      .eq('status', 'uploaded');

    // Log audit
    await logEnrollmentAudit({
      applicationId,
      actorId: user.id,
      action: 'application_submitted',
      targetEntity: 'enrollment_applications_v2',
      targetId: applicationId,
      previousState: { status: previousStatus },
      newState: { status: 'submitted', submitted_at: now },
    });

    return NextResponse.json({
      success: true,
      application: updatedApp,
      message: 'Application submitted successfully',
    });
  } catch (error: any) {
    console.error('POST /api/enrollment/applications/[id]/submit error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
