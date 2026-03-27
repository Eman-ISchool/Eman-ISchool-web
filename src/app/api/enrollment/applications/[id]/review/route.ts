import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import {
  logEnrollmentAudit,
  canFullyApprove,
  canTransitionTo,
  evaluateForProvisionalAcceptance,
  getBlockers,
} from '@/lib/enrollment';
import type { EnrollmentAppStatus } from '@/types/enrollment';

type RouteContext = { params: Promise<{ id: string }> };

// ── POST: Admin review actions ───────────────────────────────
// Actions: verify_document, reject_document, request_reupload,
//          flag_attestation, flag_translation, add_note,
//          approve, provisional_accept, reject, request_action

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

    // Fetch application
    const { data: application, error: appError } = await supabaseAdmin
      .from('enrollment_applications_v2')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const body = await req.json();
    const { action, document_id, reason, notes } = body;

    if (!action) {
      return NextResponse.json({ error: '"action" is required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    switch (action) {
      // ── Document-level actions ────────────────────────────────

      case 'verify_document': {
        if (!document_id) {
          return NextResponse.json({ error: 'document_id is required for verify_document' }, { status: 400 });
        }

        const { data: doc, error: docErr } = await supabaseAdmin
          .from('enrollment_documents')
          .select('*')
          .eq('id', document_id)
          .eq('application_id', applicationId)
          .single();

        if (docErr || !doc) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        const previousStatus = doc.status;

        const { error: updateErr } = await supabaseAdmin
          .from('enrollment_documents')
          .update({
            status: 'verified',
            reviewed_by: user.id,
            reviewed_at: now,
            updated_at: now,
          })
          .eq('id', document_id);

        if (updateErr) throw updateErr;

        await logEnrollmentAudit({
          applicationId,
          documentId: document_id,
          actorId: user.id,
          action: 'document_verified',
          targetEntity: 'enrollment_documents',
          targetId: document_id,
          previousState: { status: previousStatus },
          newState: { status: 'verified' },
        });

        return NextResponse.json({ success: true, message: 'Document verified' });
      }

      case 'reject_document': {
        if (!document_id) {
          return NextResponse.json({ error: 'document_id is required for reject_document' }, { status: 400 });
        }

        const { data: doc, error: docErr } = await supabaseAdmin
          .from('enrollment_documents')
          .select('*')
          .eq('id', document_id)
          .eq('application_id', applicationId)
          .single();

        if (docErr || !doc) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        const previousStatus = doc.status;

        const { error: updateErr } = await supabaseAdmin
          .from('enrollment_documents')
          .update({
            status: 'rejected',
            rejection_reason: reason || null,
            reviewed_by: user.id,
            reviewed_at: now,
            updated_at: now,
          })
          .eq('id', document_id);

        if (updateErr) throw updateErr;

        await logEnrollmentAudit({
          applicationId,
          documentId: document_id,
          actorId: user.id,
          action: 'document_rejected',
          targetEntity: 'enrollment_documents',
          targetId: document_id,
          previousState: { status: previousStatus },
          newState: { status: 'rejected', rejection_reason: reason },
          reason,
        });

        return NextResponse.json({ success: true, message: 'Document rejected' });
      }

      case 'request_reupload': {
        if (!document_id) {
          return NextResponse.json({ error: 'document_id is required for request_reupload' }, { status: 400 });
        }

        const { data: doc, error: docErr } = await supabaseAdmin
          .from('enrollment_documents')
          .select('*')
          .eq('id', document_id)
          .eq('application_id', applicationId)
          .single();

        if (docErr || !doc) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        const previousStatus = doc.status;

        const { error: updateErr } = await supabaseAdmin
          .from('enrollment_documents')
          .update({
            status: 're_upload_requested',
            rejection_reason: reason || null,
            reviewed_by: user.id,
            reviewed_at: now,
            updated_at: now,
          })
          .eq('id', document_id);

        if (updateErr) throw updateErr;

        await logEnrollmentAudit({
          applicationId,
          documentId: document_id,
          actorId: user.id,
          action: 'document_reupload_requested',
          targetEntity: 'enrollment_documents',
          targetId: document_id,
          previousState: { status: previousStatus },
          newState: { status: 're_upload_requested', rejection_reason: reason },
          reason,
        });

        return NextResponse.json({ success: true, message: 'Re-upload requested' });
      }

      case 'flag_attestation': {
        if (!document_id) {
          return NextResponse.json({ error: 'document_id is required for flag_attestation' }, { status: 400 });
        }

        const { data: doc, error: docErr } = await supabaseAdmin
          .from('enrollment_documents')
          .select('*')
          .eq('id', document_id)
          .eq('application_id', applicationId)
          .single();

        if (docErr || !doc) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        const previousAttestationStatus = doc.attestation_status;

        const { error: updateErr } = await supabaseAdmin
          .from('enrollment_documents')
          .update({
            attestation_required: true,
            attestation_status: 'pending',
            updated_at: now,
          })
          .eq('id', document_id);

        if (updateErr) throw updateErr;

        await logEnrollmentAudit({
          applicationId,
          documentId: document_id,
          actorId: user.id,
          action: 'attestation_flagged',
          targetEntity: 'enrollment_documents',
          targetId: document_id,
          previousState: { attestation_status: previousAttestationStatus },
          newState: { attestation_status: 'pending', attestation_required: true },
        });

        return NextResponse.json({ success: true, message: 'Attestation flagged as pending' });
      }

      case 'flag_translation': {
        if (!document_id) {
          return NextResponse.json({ error: 'document_id is required for flag_translation' }, { status: 400 });
        }

        const { data: doc, error: docErr } = await supabaseAdmin
          .from('enrollment_documents')
          .select('*')
          .eq('id', document_id)
          .eq('application_id', applicationId)
          .single();

        if (docErr || !doc) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        const previousTranslationStatus = doc.translation_status;

        const { error: updateErr } = await supabaseAdmin
          .from('enrollment_documents')
          .update({
            translation_required: true,
            translation_status: 'pending',
            updated_at: now,
          })
          .eq('id', document_id);

        if (updateErr) throw updateErr;

        await logEnrollmentAudit({
          applicationId,
          documentId: document_id,
          actorId: user.id,
          action: 'translation_flagged',
          targetEntity: 'enrollment_documents',
          targetId: document_id,
          previousState: { translation_status: previousTranslationStatus },
          newState: { translation_status: 'pending', translation_required: true },
        });

        return NextResponse.json({ success: true, message: 'Translation flagged as pending' });
      }

      // ── Review note action ────────────────────────────────────

      case 'add_note': {
        if (!notes) {
          return NextResponse.json({ error: '"notes" content is required for add_note' }, { status: 400 });
        }

        const noteType = body.note_type || 'general';
        const isVisibleToParent = body.is_visible_to_parent ?? false;

        const { data: reviewNote, error: noteErr } = await supabaseAdmin
          .from('enrollment_review_notes')
          .insert({
            application_id: applicationId,
            author_id: user.id,
            note_type: noteType,
            content: notes,
            is_visible_to_parent: isVisibleToParent,
          })
          .select()
          .single();

        if (noteErr) throw noteErr;

        await logEnrollmentAudit({
          applicationId,
          actorId: user.id,
          action: 'review_note_added',
          targetEntity: 'enrollment_review_notes',
          targetId: reviewNote.id,
          newState: { note_type: noteType, is_visible_to_parent: isVisibleToParent },
        });

        return NextResponse.json({ success: true, note: reviewNote });
      }

      // ── Application-level status actions ──────────────────────

      case 'approve': {
        // Check all documents to determine if full approval is possible
        const { data: documents } = await supabaseAdmin
          .from('enrollment_documents')
          .select('*')
          .eq('application_id', applicationId);

        if (!canFullyApprove(documents || [])) {
          // Return blockers
          const [academicResult, identityResult, guardiansResult] = await Promise.all([
            supabaseAdmin.from('enrollment_academic_details').select('*').eq('application_id', applicationId).maybeSingle(),
            supabaseAdmin.from('enrollment_identity_details').select('*').eq('application_id', applicationId).maybeSingle(),
            supabaseAdmin.from('enrollment_guardian_details').select('*').eq('application_id', applicationId),
          ]);

          const blockers = getBlockers({
            application,
            documents: documents || [],
            academicDetails: academicResult.data,
            identityDetails: identityResult.data,
            guardianDetails: guardiansResult.data || [],
          });

          return NextResponse.json(
            {
              success: false,
              message: 'Cannot fully approve: unresolved blockers exist',
              blockers: blockers.filter((b) => b.severity === 'error'),
            },
            { status: 422 },
          );
        }

        return await updateApplicationStatus(
          applicationId,
          application.status,
          'approved',
          user.id,
          reason || 'Application approved by admin',
          notes,
        );
      }

      case 'provisional_accept': {
        // Evaluate eligibility for provisional acceptance
        const { data: documents } = await supabaseAdmin
          .from('enrollment_documents')
          .select('*')
          .eq('application_id', applicationId);

        const [academicResult, identityResult, guardiansResult] = await Promise.all([
          supabaseAdmin.from('enrollment_academic_details').select('*').eq('application_id', applicationId).maybeSingle(),
          supabaseAdmin.from('enrollment_identity_details').select('*').eq('application_id', applicationId).maybeSingle(),
          supabaseAdmin.from('enrollment_guardian_details').select('*').eq('application_id', applicationId),
        ]);

        const evaluation = evaluateForProvisionalAcceptance({
          application,
          documents: documents || [],
          academicDetails: academicResult.data,
          identityDetails: identityResult.data,
          guardianDetails: guardiansResult.data || [],
        });

        if (!evaluation.eligible) {
          return NextResponse.json(
            {
              success: false,
              message: 'Not eligible for provisional acceptance',
              reasons: evaluation.reasons,
            },
            { status: 422 },
          );
        }

        return await updateApplicationStatus(
          applicationId,
          application.status,
          'provisionally_accepted',
          user.id,
          reason || `Provisionally accepted: ${evaluation.reasons.join('; ')}`,
          notes,
        );
      }

      case 'reject': {
        if (!reason) {
          return NextResponse.json(
            { error: '"reason" is required for rejection' },
            { status: 400 },
          );
        }

        return await updateApplicationStatus(
          applicationId,
          application.status,
          'rejected',
          user.id,
          reason,
          notes,
        );
      }

      case 'request_action': {
        return await updateApplicationStatus(
          applicationId,
          application.status,
          'action_required',
          user.id,
          reason || 'Action required from parent',
          notes,
        );
      }

      default:
        return NextResponse.json(
          {
            error: `Unknown action: ${action}. Valid actions: verify_document, reject_document, request_reupload, flag_attestation, flag_translation, add_note, approve, provisional_accept, reject, request_action`,
          },
          { status: 400 },
        );
    }
  } catch (error: any) {
    console.error('POST /api/enrollment/applications/[id]/review error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ── Helper: Update application status with transition check ──

async function updateApplicationStatus(
  applicationId: string,
  currentStatus: EnrollmentAppStatus,
  newStatus: EnrollmentAppStatus,
  actorId: string,
  reason: string,
  notes?: string,
): Promise<NextResponse> {
  // Validate transition
  if (!canTransitionTo(currentStatus, newStatus)) {
    return NextResponse.json(
      {
        error: `Invalid status transition from '${currentStatus}' to '${newStatus}'`,
      },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();

  // Update application status
  const updateData: any = {
    status: newStatus,
    updated_at: now,
  };

  if (newStatus === 'approved' || newStatus === 'rejected') {
    updateData.reviewed_at = now;
    updateData.review_decision = newStatus;
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
    new_status: newStatus,
    changed_by: actorId,
    reason,
    notes: notes || null,
  });

  // Log audit
  await logEnrollmentAudit({
    applicationId,
    actorId,
    action: `status_changed:${newStatus}`,
    targetEntity: 'enrollment_applications_v2',
    targetId: applicationId,
    previousState: { status: currentStatus },
    newState: { status: newStatus },
    reason,
  });

  // If action_required and there's a visible note for parent, create it
  if (newStatus === 'action_required' && notes) {
    await supabaseAdmin.from('enrollment_review_notes').insert({
      application_id: applicationId,
      author_id: actorId,
      note_type: 'action_required',
      content: notes,
      is_visible_to_parent: true,
    });
  }

  return NextResponse.json({
    success: true,
    application: updatedApp,
    message: `Application status changed to '${newStatus}'`,
  });
}
