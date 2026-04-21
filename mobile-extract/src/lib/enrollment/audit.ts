// ──────────────────────────────────────────────────────────────
// Enrollment audit trail
// Inserts audit log records via supabaseAdmin (server-side only)
// ──────────────────────────────────────────────────────────────

import { supabaseAdmin } from '@/lib/supabase';

// ── Types ────────────────────────────────────────────────────

export interface AuditLogParams {
  applicationId: string;
  documentId?: string;
  actorId: string;
  action: string;
  targetEntity: string;
  targetId?: string;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  reason?: string;
}

// ── Public API ───────────────────────────────────────────────

/**
 * Write an audit log entry to the enrollment_audit_log table.
 *
 * This function uses supabaseAdmin (service-role key) so it bypasses RLS.
 * It must only be called from server-side code (API routes, server actions).
 *
 * Throws on insert failure so the caller can decide whether to propagate
 * or swallow the error.
 */
export async function logEnrollmentAudit(params: AuditLogParams): Promise<void> {
  const { error } = await supabaseAdmin.from('enrollment_audit_log').insert({
    application_id: params.applicationId,
    document_id: params.documentId ?? null,
    actor_id: params.actorId,
    action: params.action,
    target_entity: params.targetEntity,
    target_id: params.targetId ?? null,
    previous_state: params.previousState ?? null,
    new_state: params.newState ?? null,
    reason: params.reason ?? null,
  });

  if (error) {
    console.error('[enrollment-audit] Failed to insert audit log:', error.message);
    throw new Error(`Audit log insert failed: ${error.message}`);
  }
}
