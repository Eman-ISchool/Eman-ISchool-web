// ──────────────────────────────────────────────────────────────
// Application status management engine
// Computes recommended status, enforces valid transitions,
// and identifies blockers preventing advancement.
// ──────────────────────────────────────────────────────────────

import type {
  EnrollmentAppStatus,
  EnrollmentApplication,
  EnrollmentDocument,
  EnrollmentAcademicDetails,
  EnrollmentIdentityDetails,
  EnrollmentGuardianDetails,
} from '@/types/enrollment';

import { evaluateDocumentBlockers, canFullyApprove } from './attestation-rules';
import { getRequiredDocuments } from './document-rules';

// ── Blocker type ─────────────────────────────────────────────

export interface StatusBlocker {
  type: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// ── Valid status transitions ─────────────────────────────────

/**
 * Map of each status to the set of statuses it may transition to.
 * Any transition not listed here is forbidden.
 */
export const VALID_TRANSITIONS: Record<EnrollmentAppStatus, EnrollmentAppStatus[]> = {
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
  rejected: ['submitted'], // Allow re-submission after rejection
  enrollment_activated: [], // Terminal state
};

// ── Transition guard ─────────────────────────────────────────

/**
 * Returns true if transitioning from `currentStatus` to `targetStatus`
 * is a valid move according to the transition map.
 */
export function canTransitionTo(
  currentStatus: EnrollmentAppStatus,
  targetStatus: EnrollmentAppStatus,
): boolean {
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(targetStatus);
}

// ── Blocker detection ────────────────────────────────────────

/**
 * Analyse the application and its related data to produce a list of
 * blockers that prevent it from advancing toward full approval / enrollment.
 */
export function getBlockers(params: {
  application: EnrollmentApplication;
  documents: EnrollmentDocument[];
  academicDetails: Partial<EnrollmentAcademicDetails> | null;
  identityDetails: Partial<EnrollmentIdentityDetails> | null;
  guardianDetails: EnrollmentGuardianDetails[] | null;
}): StatusBlocker[] {
  const {
    application,
    documents,
    academicDetails,
    identityDetails,
    guardianDetails,
  } = params;

  const blockers: StatusBlocker[] = [];

  // 1. Minimum identity + academic proof
  const hasPassport = documents.some(
    (d) => d.document_type === 'student_passport' && d.status !== 'missing' && d.status !== 'rejected',
  );
  const hasBirthCert = documents.some(
    (d) => d.document_type === 'birth_certificate' && d.status !== 'missing' && d.status !== 'rejected',
  );

  if (!hasPassport) {
    blockers.push({
      type: 'missing_identity',
      message: 'Student passport is required for enrollment',
      severity: 'error',
    });
  }
  if (!hasBirthCert) {
    blockers.push({
      type: 'missing_identity',
      message: 'Birth certificate is required for enrollment',
      severity: 'error',
    });
  }

  // 2. Grade 2+ transfer requires TC
  const isTransfer = academicDetails?.enrollment_type === 'transfer';
  const gradeName = academicDetails?.applying_grade_name ?? '';
  const gradeLevel = parseGradeLevel(gradeName);

  if (isTransfer && gradeLevel >= 2) {
    const hasTC = documents.some(
      (d) =>
        d.document_type === 'transfer_certificate' &&
        d.status !== 'missing' &&
        d.status !== 'rejected',
    );
    if (!hasTC) {
      blockers.push({
        type: 'missing_transfer_certificate',
        message: 'Transfer certificate is required for Grade 2+ transfers before full approval',
        severity: 'error',
      });
    }
  }

  // 3. Attestation blockers
  const docBlockers = evaluateDocumentBlockers(documents);
  if (docBlockers.has_attestation_blockers) {
    blockers.push({
      type: 'pending_attestation',
      message: `Attestation pending for: ${docBlockers.blocked_documents.filter((b) => b.includes('attestation')).join('; ')}`,
      severity: 'error',
    });
  }

  // 4. Translation blockers
  if (docBlockers.has_translation_blockers) {
    blockers.push({
      type: 'pending_translation',
      message: `Translation pending for: ${docBlockers.blocked_documents.filter((b) => b.includes('translation')).join('; ')}`,
      severity: 'error',
    });
  }

  // 5. Custody / legal guardian without documentation
  const hasCustodyCase = guardianDetails?.some((g) => g.custody_case || g.is_legal_guardian) ?? false;
  if (hasCustodyCase) {
    const hasCustodyDoc = documents.some(
      (d) =>
        d.document_type === 'custody_guardianship_document' &&
        d.status !== 'missing' &&
        d.status !== 'rejected',
    );
    if (!hasCustodyDoc) {
      blockers.push({
        type: 'missing_custody_document',
        message: 'Custody or guardianship document is required when a custody case or legal guardian arrangement is declared',
        severity: 'error',
      });
    }
  }

  // 6. No Emirates ID — provisional only
  const hasEmiratesId = identityDetails?.emirates_id_available ?? false;
  if (!hasEmiratesId) {
    blockers.push({
      type: 'no_emirates_id',
      message: 'No Emirates ID available — only provisional acceptance is possible',
      severity: 'warning',
    });
  }

  // 7. Missing required documents (cannot silently pass)
  const medicalDetails = null; // Medical details are checked via document presence
  const requiredDocs = getRequiredDocuments(
    academicDetails as any,
    identityDetails as any,
    guardianDetails,
    medicalDetails,
  );

  const uploadedDocTypes = new Set(
    documents
      .filter((d) => d.status !== 'missing' && d.status !== 'rejected')
      .map((d) => d.document_type),
  );

  for (const req of requiredDocs) {
    if (req.isRequired && !uploadedDocTypes.has(req.docType)) {
      blockers.push({
        type: 'missing_required_document',
        message: `Required document missing: ${req.label}`,
        severity: 'error',
      });
    }
  }

  return blockers;
}

// ── Recommended status computation ───────────────────────────

/**
 * Given the full application context, compute the recommended next status.
 *
 * This is an advisory function — it does not mutate any data. The admin
 * may choose to override the recommendation.
 */
export function computeApplicationStatus(
  application: EnrollmentApplication,
  documents: EnrollmentDocument[],
  academicDetails: Partial<EnrollmentAcademicDetails> | null,
  identityDetails: Partial<EnrollmentIdentityDetails> | null,
  guardianDetails: EnrollmentGuardianDetails[] | null,
): EnrollmentAppStatus {
  const blockers = getBlockers({
    application,
    documents,
    academicDetails,
    identityDetails,
    guardianDetails,
  });

  const errorBlockers = blockers.filter((b) => b.severity === 'error');
  const warningBlockers = blockers.filter((b) => b.severity === 'warning');

  // If already in a terminal state, stay there
  if (application.status === 'enrollment_activated') {
    return 'enrollment_activated';
  }

  // If not yet submitted, stay in draft
  if (application.status === 'draft') {
    return 'draft';
  }

  // Check for attestation or translation blockers specifically
  const docBlockers = evaluateDocumentBlockers(documents);

  if (docBlockers.has_attestation_blockers) {
    return 'pending_attestation';
  }

  if (docBlockers.has_translation_blockers) {
    return 'pending_translation';
  }

  // Check for missing transfer certificate (grade 2+)
  const isTransfer = academicDetails?.enrollment_type === 'transfer';
  const gradeLevel = parseGradeLevel(academicDetails?.applying_grade_name);
  if (isTransfer && gradeLevel >= 2) {
    const hasTC = documents.some(
      (d) =>
        d.document_type === 'transfer_certificate' &&
        d.status !== 'missing' &&
        d.status !== 'rejected',
    );
    if (!hasTC) {
      return 'awaiting_transfer_certificate';
    }
  }

  // If there are missing required documents
  const hasMissingDocs = errorBlockers.some((b) => b.type === 'missing_required_document');
  if (hasMissingDocs) {
    return 'pending_documents';
  }

  // If there are only warning-level blockers (e.g. no Emirates ID)
  // but no hard errors, allow provisional acceptance
  if (errorBlockers.length === 0 && warningBlockers.length > 0) {
    return 'provisionally_accepted';
  }

  // No blockers at all — can be fully approved
  if (errorBlockers.length === 0 && warningBlockers.length === 0) {
    if (canFullyApprove(documents)) {
      return 'approved';
    }
    return 'under_review';
  }

  // Fallback: still under review
  return 'under_review';
}

// ── Provisional acceptance evaluation ────────────────────────

/**
 * Determine whether provisional acceptance is appropriate.
 *
 * Provisional acceptance is suitable when:
 * - No hard (error-severity) blockers remain
 * - Warning-level blockers exist (e.g., no Emirates ID)
 * - OR attestation / translation is still pending but all docs are uploaded
 */
export function evaluateForProvisionalAcceptance(params: {
  application: EnrollmentApplication;
  documents: EnrollmentDocument[];
  academicDetails: Partial<EnrollmentAcademicDetails> | null;
  identityDetails: Partial<EnrollmentIdentityDetails> | null;
  guardianDetails: EnrollmentGuardianDetails[] | null;
}): {
  eligible: boolean;
  reasons: string[];
} {
  const blockers = getBlockers(params);

  const errorBlockers = blockers.filter((b) => b.severity === 'error');
  const warningBlockers = blockers.filter((b) => b.severity === 'warning');

  // Not eligible if there are hard blockers (missing docs, etc.)
  // UNLESS the only error blockers are attestation/translation related
  const hardBlockers = errorBlockers.filter(
    (b) => b.type !== 'pending_attestation' && b.type !== 'pending_translation',
  );

  if (hardBlockers.length > 0) {
    return {
      eligible: false,
      reasons: hardBlockers.map((b) => b.message),
    };
  }

  // Eligible for provisional — gather the reasons
  const reasons: string[] = [];

  for (const b of warningBlockers) {
    reasons.push(b.message);
  }

  const attestationBlockers = errorBlockers.filter(
    (b) => b.type === 'pending_attestation' || b.type === 'pending_translation',
  );
  for (const b of attestationBlockers) {
    reasons.push(b.message);
  }

  if (reasons.length === 0) {
    reasons.push('All requirements are met — full approval may be more appropriate');
  }

  return { eligible: true, reasons };
}

// ── Helper ───────────────────────────────────────────────────

function parseGradeLevel(gradeName: string | null | undefined): number {
  if (!gradeName) return -1;
  const lower = gradeName.toLowerCase().trim();
  if (lower.startsWith('kg') || lower.startsWith('fs') || lower.includes('pre-school')) {
    return 0;
  }
  const match = lower.match(/grade\s*(\d+)/i);
  if (match) return parseInt(match[1], 10);
  const bareNum = parseInt(lower, 10);
  return isNaN(bareNum) ? -1 : bareNum;
}
