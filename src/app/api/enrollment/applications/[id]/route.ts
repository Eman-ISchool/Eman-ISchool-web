import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin, hasRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import {
  logEnrollmentAudit,
  validateStudentDetails,
  validateAcademicDetails,
  validateGuardianDetails,
  validateIdentityDetails,
  validateMedicalDetails,
  validateDeclarations,
} from '@/lib/enrollment';
import type { EnrollmentAppStatus } from '@/types/enrollment';

type RouteContext = { params: Promise<{ id: string }> };

// ── Helper: Fetch application and verify access ──────────────

async function getApplicationWithAccess(
  applicationId: string,
  userId: string,
  userRole: string,
) {
  const { data: application, error } = await supabaseAdmin
    .from('enrollment_applications_v2')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (error || !application) {
    return { application: null, error: 'Application not found' };
  }

  // Parents can only access their own applications
  if (!isAdmin(userRole) && application.parent_user_id !== userId) {
    return { application: null, error: 'Access denied' };
  }

  return { application, error: null };
}

// ── Section-to-table mapping ─────────────────────────────────

const SECTION_CONFIG: Record<
  string,
  {
    table: string;
    validate: (data: any) => { valid: boolean; errors: Record<string, string> };
    isArray?: boolean;
  }
> = {
  student_details: {
    table: 'enrollment_student_details',
    validate: validateStudentDetails,
  },
  academic_details: {
    table: 'enrollment_academic_details',
    validate: validateAcademicDetails,
  },
  guardian_details: {
    table: 'enrollment_guardian_details',
    validate: (data: any) => validateGuardianDetails(Array.isArray(data) ? data : [data]),
    isArray: true,
  },
  identity_details: {
    table: 'enrollment_identity_details',
    validate: validateIdentityDetails,
  },
  medical_details: {
    table: 'enrollment_medical_details',
    validate: validateMedicalDetails,
  },
  declarations: {
    table: 'enrollment_declarations',
    validate: validateDeclarations,
  },
};

// ── GET: Full application detail ─────────────────────────────

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id: applicationId } = await context.params;
    const session = await getServerSession(authOptions);
    const user = await getCurrentUser(session);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { application, error: accessError } = await getApplicationWithAccess(
      applicationId,
      user.id,
      user.role,
    );

    if (accessError) {
      const status = accessError === 'Access denied' ? 403 : 404;
      return NextResponse.json({ error: accessError }, { status });
    }

    // Fetch all related data in parallel
    const [
      studentResult,
      academicResult,
      guardiansResult,
      identityResult,
      medicalResult,
      declarationsResult,
      documentsResult,
      statusHistoryResult,
      reviewNotesResult,
      onboardingResult,
    ] = await Promise.all([
      supabaseAdmin
        .from('enrollment_student_details')
        .select('*')
        .eq('application_id', applicationId)
        .maybeSingle(),
      supabaseAdmin
        .from('enrollment_academic_details')
        .select('*')
        .eq('application_id', applicationId)
        .maybeSingle(),
      supabaseAdmin
        .from('enrollment_guardian_details')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: true }),
      supabaseAdmin
        .from('enrollment_identity_details')
        .select('*')
        .eq('application_id', applicationId)
        .maybeSingle(),
      supabaseAdmin
        .from('enrollment_medical_details')
        .select('*')
        .eq('application_id', applicationId)
        .maybeSingle(),
      supabaseAdmin
        .from('enrollment_declarations')
        .select('*')
        .eq('application_id', applicationId)
        .maybeSingle(),
      supabaseAdmin
        .from('enrollment_documents')
        .select('*')
        .eq('application_id', applicationId)
        .order('document_type', { ascending: true }),
      supabaseAdmin
        .from('enrollment_status_history')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('enrollment_review_notes')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('student_onboarding_tasks')
        .select('*')
        .eq('application_id', applicationId)
        .order('sort_order', { ascending: true }),
    ]);

    // For parents, filter review notes to only visible ones
    let reviewNotes = reviewNotesResult.data || [];
    if (!isAdmin(user.role)) {
      reviewNotes = reviewNotes.filter((note: any) => note.is_visible_to_parent);
    }

    return NextResponse.json({
      application,
      student_details: studentResult.data || null,
      academic_details: academicResult.data || null,
      guardians: guardiansResult.data || [],
      identity_details: identityResult.data || null,
      medical_details: medicalResult.data || null,
      declarations: declarationsResult.data || null,
      documents: documentsResult.data || [],
      status_history: statusHistoryResult.data || [],
      review_notes: reviewNotes,
      onboarding_tasks: onboardingResult.data || [],
    });
  } catch (error: any) {
    console.error('GET /api/enrollment/applications/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ── PUT: Update application section ──────────────────────────
// Body: { section: string, data: object }
// Parent can update draft/action_required applications.
// Validates section data server-side.

export async function PUT(req: Request, context: RouteContext) {
  try {
    const { id: applicationId } = await context.params;
    const session = await getServerSession(authOptions);
    const user = await getCurrentUser(session);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { application, error: accessError } = await getApplicationWithAccess(
      applicationId,
      user.id,
      user.role,
    );

    if (accessError) {
      const status = accessError === 'Access denied' ? 403 : 404;
      return NextResponse.json({ error: accessError }, { status });
    }

    // Parents can only update draft or action_required applications
    const editableStatuses: EnrollmentAppStatus[] = ['draft', 'action_required'];
    if (!isAdmin(user.role) && !editableStatuses.includes(application!.status)) {
      return NextResponse.json(
        { error: `Cannot update application in '${application!.status}' status` },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json(
        { error: 'Request body must include "section" and "data"' },
        { status: 400 },
      );
    }

    const config = SECTION_CONFIG[section];
    if (!config) {
      return NextResponse.json(
        { error: `Unknown section: ${section}. Valid sections: ${Object.keys(SECTION_CONFIG).join(', ')}` },
        { status: 400 },
      );
    }

    // Validate section data
    const validationResult = config.validate(data);
    // We do not block saves for validation errors on draft; we just return warnings.
    // Validation errors block only on submission.

    // Fetch previous state for audit
    const { data: previousData } = config.isArray
      ? await supabaseAdmin
          .from(config.table)
          .select('*')
          .eq('application_id', applicationId)
      : await supabaseAdmin
          .from(config.table)
          .select('*')
          .eq('application_id', applicationId)
          .maybeSingle();

    let updatedData: any;

    if (config.isArray && section === 'guardian_details') {
      // Guardian details: upsert array of contacts
      // Delete existing and re-insert
      await supabaseAdmin
        .from(config.table)
        .delete()
        .eq('application_id', applicationId);

      const guardiansToInsert = (Array.isArray(data) ? data : [data]).map((g: any) => ({
        ...g,
        application_id: applicationId,
      }));

      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from(config.table)
        .insert(guardiansToInsert)
        .select();

      if (insertErr) throw insertErr;
      updatedData = inserted;
    } else {
      // Single record: upsert
      const { data: updated, error: updateErr } = await supabaseAdmin
        .from(config.table)
        .update(data)
        .eq('application_id', applicationId)
        .select()
        .single();

      if (updateErr) throw updateErr;
      updatedData = updated;
    }

    // Update wizard progress on the application
    const stepMap: Record<string, number> = {
      student_details: 1,
      academic_details: 2,
      guardian_details: 3,
      identity_details: 4,
      medical_details: 5,
      declarations: 7,
    };

    const stepNumber = stepMap[section];
    if (stepNumber) {
      const stepsCompleted: number[] = application!.steps_completed || [];
      if (!stepsCompleted.includes(stepNumber)) {
        stepsCompleted.push(stepNumber);
        stepsCompleted.sort((a: number, b: number) => a - b);
      }

      // Calculate completeness score (7 steps total)
      const completenessScore = Math.round((stepsCompleted.length / 7) * 100);

      await supabaseAdmin
        .from('enrollment_applications_v2')
        .update({
          steps_completed: stepsCompleted,
          current_step: Math.max(stepNumber, application!.current_step || 1),
          completeness_score: completenessScore,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);
    }

    // Log audit
    await logEnrollmentAudit({
      applicationId,
      actorId: user.id,
      action: `section_updated:${section}`,
      targetEntity: config.table,
      targetId: applicationId,
      previousState: previousData ? { [section]: previousData } : undefined,
      newState: { [section]: updatedData },
    });

    return NextResponse.json({
      success: true,
      section,
      data: updatedData,
      validation: validationResult,
    });
  } catch (error: any) {
    console.error('PUT /api/enrollment/applications/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ── DELETE: Delete draft application ─────────────────────────
// Only draft applications can be deleted by the owner.

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id: applicationId } = await context.params;
    const session = await getServerSession(authOptions);
    const user = await getCurrentUser(session);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { application, error: accessError } = await getApplicationWithAccess(
      applicationId,
      user.id,
      user.role,
    );

    if (accessError) {
      const status = accessError === 'Access denied' ? 403 : 404;
      return NextResponse.json({ error: accessError }, { status });
    }

    // Only draft applications can be deleted
    if (application!.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft applications can be deleted' },
        { status: 400 },
      );
    }

    // Only the owner can delete (not admin)
    if (application!.parent_user_id !== user.id) {
      return NextResponse.json({ error: 'Only the application owner can delete it' }, { status: 403 });
    }

    // Delete related records first (cascade in reverse order)
    await Promise.all([
      supabaseAdmin.from('enrollment_review_notes').delete().eq('application_id', applicationId),
      supabaseAdmin.from('enrollment_status_history').delete().eq('application_id', applicationId),
      supabaseAdmin.from('enrollment_audit_log').delete().eq('application_id', applicationId),
      supabaseAdmin.from('student_onboarding_tasks').delete().eq('application_id', applicationId),
      supabaseAdmin.from('enrollment_documents').delete().eq('application_id', applicationId),
      supabaseAdmin.from('enrollment_declarations').delete().eq('application_id', applicationId),
      supabaseAdmin.from('enrollment_medical_details').delete().eq('application_id', applicationId),
      supabaseAdmin.from('enrollment_identity_details').delete().eq('application_id', applicationId),
      supabaseAdmin.from('enrollment_guardian_details').delete().eq('application_id', applicationId),
      supabaseAdmin.from('enrollment_academic_details').delete().eq('application_id', applicationId),
      supabaseAdmin.from('enrollment_student_details').delete().eq('application_id', applicationId),
    ]);

    // Delete the application itself
    const { error: deleteError } = await supabaseAdmin
      .from('enrollment_applications_v2')
      .delete()
      .eq('id', applicationId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true, message: 'Application deleted' });
  } catch (error: any) {
    console.error('DELETE /api/enrollment/applications/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
