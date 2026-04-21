// ──────────────────────────────────────────────────────────────
// Enrollment business logic — barrel export
// ──────────────────────────────────────────────────────────────

// Validation
export {
  validateStudentDetails,
  validateAcademicDetails,
  validateGuardianDetails,
  validateIdentityDetails,
  validateMedicalDetails,
  validateDeclarations,
  validateForSubmission,
} from './validation';

export type { ValidationResult } from './validation';

// Document rules
export {
  getRequiredDocuments,
} from './document-rules';

export type { DocumentRequirementResult } from './document-rules';

// Attestation rules
export {
  getAttestationRequirements,
  evaluateDocumentBlockers,
  canFullyApprove,
} from './attestation-rules';

export type {
  AttestationRequirements,
  DocumentBlockerResult,
} from './attestation-rules';

// Status engine
export {
  VALID_TRANSITIONS,
  canTransitionTo,
  getBlockers,
  computeApplicationStatus,
  evaluateForProvisionalAcceptance,
} from './status-engine';

export type { StatusBlocker } from './status-engine';

// Audit
export {
  logEnrollmentAudit,
} from './audit';

export type { AuditLogParams } from './audit';
