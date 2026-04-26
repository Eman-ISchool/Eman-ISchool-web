import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { logEnrollmentAudit, canTransitionTo } from '@/lib/enrollment';
import type { EnrollmentAppStatus } from '@/types/enrollment';

export const dynamic = 'force-dynamic';
type RouteContext = { params: Promise<{ id: string }> };

// ── GET: Get status history for application ──────────────────

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id: applicationId } = await context.params;
    const session = await getServerSession(authOptions);
    const user = await getCurrentUser(session);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify application access
    const { data: application, error: appError } = await supabaseAdmin
      .from('enrollment_applications_v2')
      .select('id, parent_user_id, status')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (!isAdmin(user.role) && application.parent_user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { data: history, error } = await supabaseAdmin
      .from('enrollment_status_history')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      current_status: application.status,
      history: history || [],
    });
  } catch (error: any) {
    console.error('GET /api/enrollment/applications/[id]/status error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ── POST: Admin manual status change ─────────────────────────
// Body: { new_status, reason?, notes? }
// Uses canTransitionTo for validation.

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

    const body = await req.json();
    const { new_status, reason, notes } = body;

    if (!new_status) {
      return NextResponse.json({ error: '"new_status" is required' }, { status: 400 });
    }

    // Fetch application
    const { data: application, error: appError } = await supabaseAdmin
      .from('enrollment_applications_v2')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const currentStatus = application.status as EnrollmentAppStatus;
    const targetStatus = new_status as EnrollmentAppStatus;

    // Validate transition
    if (!canTransitionTo(currentStatus, targetStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status transition from '${currentStatus}' to '${targetStatus}'`,
          current_status: currentStatus,
          allowed_transitions: getValidTransitionsForStatus(currentStatus),
        },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();

    // Update application status
    const updateData: any = {
      status: targetStatus,
      updated_at: now,
    };

    // Set additional fields based on target status
    if (targetStatus === 'approved' || targetStatus === 'rejected') {
      updateData.reviewed_at = now;
      updateData.review_decision = targetStatus;
    }
    if (targetStatus === 'submitted' && !application.submitted_at) {
      updateData.submitted_at = now;
    }

    const { data: updatedApp, error: updateError } = await supabaseAdmin
      .from('enrollment_applications_v2')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log status history
    await supabaseAdmin.from('enrollment_status_history').insert({
      application_id: applicationId,
      previous_status: currentStatus,
      new_status: targetStatus,
      changed_by: user.id,
      reason: reason || `Manual status change by admin`,
      notes: notes || null,
    });

    // Log audit
    await logEnrollmentAudit({
      applicationId,
      actorId: user.id,
      action: `manual_status_change:${targetStatus}`,
      targetEntity: 'enrollment_applications_v2',
      targetId: applicationId,
      previousState: { status: currentStatus },
      newState: { status: targetStatus },
      reason: reason || `Manual status change by admin`,
    });

    return NextResponse.json({
      success: true,
      application: updatedApp,
      previous_status: currentStatus,
      new_status: targetStatus,
      message: `Status changed from '${currentStatus}' to '${targetStatus}'`,
    });
  } catch (error: any) {
    console.error('POST /api/enrollment/applications/[id]/status error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ── Helper: Get valid transitions for a status ───────────────

function getValidTransitionsForStatus(status: EnrollmentAppStatus): EnrollmentAppStatus[] {
  const VALID_TRANSITIONS: Record<EnrollmentAppStatus, EnrollmentAppStatus[]> = {
    draft: ['submitted'],
    submitted: ['under_review', 'incomplete', 'rejected'],
    incomplete: ['submitted'],
    pending_documents: ['under_review', 'action_required', 'rejected'],
    pending_verification: ['under_review', 'pending_documents', 'action_required', 'rejected'],
    under_review: [
      'pending_documents',
      'pending_verification',
      'pending_attestation',
      'pending_translation',
      'awaiting_transfer_certificate',
      'action_required',
      'provisionally_accepted',
      'approved',
      'rejected',
    ],
    pending_attestation: ['under_review', 'action_required', 'provisionally_accepted', 'rejected'],
    pending_translation: ['under_review', 'action_required', 'provisionally_accepted', 'rejected'],
    awaiting_transfer_certificate: ['under_review', 'provisionally_accepted', 'action_required', 'rejected'],
    action_required: ['submitted', 'under_review'],
    provisionally_accepted: ['approved', 'enrollment_activated', 'rejected'],
    approved: ['enrollment_activated', 'rejected'],
    rejected: ['submitted'],
    enrollment_activated: [],
  };

  return VALID_TRANSITIONS[status] || [];
}
