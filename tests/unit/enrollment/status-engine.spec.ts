// ============================================================
// Status Engine Tests
// Tests: canTransitionTo, getBlockers, computeApplicationStatus,
//        evaluateForProvisionalAcceptance, VALID_TRANSITIONS
// ============================================================

import {
  VALID_TRANSITIONS,
  canTransitionTo,
  getBlockers,
  computeApplicationStatus,
  evaluateForProvisionalAcceptance,
} from '@/lib/enrollment/status-engine';

import type {
  EnrollmentApplication,
  EnrollmentDocument,
  EnrollmentAcademicDetails,
  EnrollmentIdentityDetails,
  EnrollmentGuardianDetails,
  EnrollmentAppStatus,
} from '@/types/enrollment';

// ── Helpers ──────────────────────────────────────────────────

const ts = '2026-01-01T00:00:00Z';

function makeApp(
  overrides: Partial<EnrollmentApplication> = {},
): EnrollmentApplication {
  return {
    id: 'app-1',
    application_number: 'EDU-2026-0001',
    parent_user_id: 'parent-1',
    academic_year: '2026-2027',
    status: 'submitted',
    completeness_score: 100,
    current_step: 7,
    steps_completed: [1, 2, 3, 4, 5, 6, 7],
    submitted_at: ts,
    assigned_reviewer_id: null,
    reviewed_at: null,
    review_decision: null,
    activated_at: null,
    linked_student_user_id: null,
    created_at: ts,
    updated_at: ts,
    ...overrides,
  };
}

function makeDoc(
  overrides: Partial<EnrollmentDocument> = {},
): EnrollmentDocument {
  return {
    id: 'doc-1',
    application_id: 'app-1',
    document_type: 'student_passport',
    label: 'Student Passport',
    is_required: true,
    is_conditional: false,
    condition_rule: null,
    file_url: 'https://storage.example.com/passport.pdf',
    file_name: 'passport.pdf',
    file_size: 2048,
    file_mime_type: 'application/pdf',
    storage_path: '/uploads/passport.pdf',
    status: 'verified',
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    issuing_country: null,
    document_language: null,
    attestation_required: false,
    attestation_status: 'not_required',
    translation_required: false,
    translation_status: 'not_required',
    translation_document_id: null,
    upload_count: 1,
    last_uploaded_at: ts,
    expiry_date: null,
    created_at: ts,
    updated_at: ts,
    ...overrides,
  };
}

function makeAcademic(
  overrides: Partial<EnrollmentAcademicDetails> = {},
): Partial<EnrollmentAcademicDetails> {
  return {
    enrollment_type: 'new',
    applying_grade_id: 'grade-1-id',
    applying_grade_name: 'Grade 1',
    academic_year: '2026-2027',
    curriculum: 'Egyptian',
    previous_school_name: null,
    previous_school_country: null,
    previous_school_emirate: null,
    previous_grade_completed: null,
    is_mid_year_transfer: false,
    transfer_source: null,
    last_report_card_year: null,
    transcript_available: false,
    transfer_certificate_available: false,
    transfer_reason: null,
    ...overrides,
  };
}

function makeIdentity(
  overrides: Partial<EnrollmentIdentityDetails> = {},
): Partial<EnrollmentIdentityDetails> {
  return {
    emirates_id_available: true,
    emirates_id_number: '784-2015-1234567-1',
    student_passport_number: 'A12345678',
    student_passport_expiry: '2030-01-01',
    residence_visa_number: null,
    residence_visa_expiry: null,
    residency_status: 'visitor',
    country_of_residence: 'Egypt',
    ...overrides,
  };
}

function makeGuardian(
  overrides: Partial<EnrollmentGuardianDetails> = {},
): EnrollmentGuardianDetails {
  return {
    id: 'guardian-1',
    application_id: 'app-1',
    contact_type: 'primary',
    relationship: 'father',
    full_name_en: 'Ahmed',
    full_name_ar: '\u0623\u062D\u0645\u062F',
    mobile: '+971501234567',
    email: 'ahmed@example.com',
    uae_address: '123 Main St',
    emirate: 'Dubai',
    area_city_district: null,
    emirates_id_number: null,
    passport_number: null,
    visa_number: null,
    is_legal_guardian: false,
    custody_case: false,
    guardian_authorization_notes: null,
    created_at: ts,
    updated_at: ts,
    ...overrides,
  };
}

/** Standard set of required docs in uploaded/verified state */
function makeBaseDocumentSet(): EnrollmentDocument[] {
  return [
    makeDoc({ id: 'doc-passport', document_type: 'student_passport', status: 'verified' }),
    makeDoc({ id: 'doc-birth', document_type: 'birth_certificate', status: 'verified' }),
    makeDoc({ id: 'doc-photo', document_type: 'student_photo', status: 'verified' }),
    makeDoc({ id: 'doc-vax', document_type: 'vaccination_record', status: 'verified' }),
    makeDoc({ id: 'doc-parent-eid', document_type: 'parent_emirates_id', status: 'verified' }),
    makeDoc({ id: 'doc-parent-pp', document_type: 'parent_passport', status: 'verified' }),
    makeDoc({ id: 'doc-student-eid', document_type: 'student_emirates_id', status: 'verified' }),
  ];
}

// ── canTransitionTo ──────────────────────────────────────────

describe('canTransitionTo', () => {
  it('should allow draft -> submitted', () => {
    expect(canTransitionTo('draft', 'submitted')).toBe(true);
  });

  it('should allow submitted -> under_review', () => {
    expect(canTransitionTo('submitted', 'under_review')).toBe(true);
  });

  it('should allow under_review -> approved', () => {
    expect(canTransitionTo('under_review', 'approved')).toBe(true);
  });

  it('should allow under_review -> rejected', () => {
    expect(canTransitionTo('under_review', 'rejected')).toBe(true);
  });

  it('should allow under_review -> provisionally_accepted', () => {
    expect(canTransitionTo('under_review', 'provisionally_accepted')).toBe(true);
  });

  it('should allow under_review -> pending_attestation', () => {
    expect(canTransitionTo('under_review', 'pending_attestation')).toBe(true);
  });

  it('should allow under_review -> pending_translation', () => {
    expect(canTransitionTo('under_review', 'pending_translation')).toBe(true);
  });

  it('should allow under_review -> awaiting_transfer_certificate', () => {
    expect(canTransitionTo('under_review', 'awaiting_transfer_certificate')).toBe(true);
  });

  it('should allow approved -> enrollment_activated', () => {
    expect(canTransitionTo('approved', 'enrollment_activated')).toBe(true);
  });

  it('should allow provisionally_accepted -> approved', () => {
    expect(canTransitionTo('provisionally_accepted', 'approved')).toBe(true);
  });

  it('should allow provisionally_accepted -> enrollment_activated', () => {
    expect(canTransitionTo('provisionally_accepted', 'enrollment_activated')).toBe(true);
  });

  it('should allow rejected -> submitted (re-submission)', () => {
    expect(canTransitionTo('rejected', 'submitted')).toBe(true);
  });

  it('should block draft -> approved (skipping submission)', () => {
    expect(canTransitionTo('draft', 'approved')).toBe(false);
  });

  it('should block draft -> under_review', () => {
    expect(canTransitionTo('draft', 'under_review')).toBe(false);
  });

  it('should block enrollment_activated -> any (terminal state)', () => {
    const allStatuses: EnrollmentAppStatus[] = [
      'draft', 'submitted', 'incomplete', 'pending_documents',
      'pending_verification', 'under_review', 'pending_attestation',
      'pending_translation', 'awaiting_transfer_certificate',
      'action_required', 'provisionally_accepted', 'approved',
      'rejected', 'enrollment_activated',
    ];

    for (const target of allStatuses) {
      expect(canTransitionTo('enrollment_activated', target)).toBe(false);
    }
  });

  it('should block submitted -> approved (must go through under_review)', () => {
    expect(canTransitionTo('submitted', 'approved')).toBe(false);
  });

  it('should block rejected -> approved (must re-submit first)', () => {
    expect(canTransitionTo('rejected', 'approved')).toBe(false);
  });
});

// ── getBlockers ──────────────────────────────────────────────

describe('getBlockers', () => {
  it('should return no error blockers for a complete new enrollment application', () => {
    const blockers = getBlockers({
      application: makeApp(),
      documents: makeBaseDocumentSet(),
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian()],
    });

    const errors = blockers.filter((b) => b.severity === 'error');
    expect(errors).toHaveLength(0);
  });

  it('should return a blocker when student passport is missing', () => {
    const docs = makeBaseDocumentSet().filter(
      (d) => d.document_type !== 'student_passport',
    );

    const blockers = getBlockers({
      application: makeApp(),
      documents: docs,
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian()],
    });

    const passportBlockers = blockers.filter(
      (b) => b.type === 'missing_identity' && b.message.includes('passport'),
    );
    expect(passportBlockers.length).toBeGreaterThan(0);
  });

  it('should return a blocker when birth certificate is missing', () => {
    const docs = makeBaseDocumentSet().filter(
      (d) => d.document_type !== 'birth_certificate',
    );

    const blockers = getBlockers({
      application: makeApp(),
      documents: docs,
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian()],
    });

    const birthBlockers = blockers.filter(
      (b) => b.type === 'missing_identity' && b.message.includes('Birth certificate'),
    );
    expect(birthBlockers.length).toBeGreaterThan(0);
  });

  it('should return a blocker for Grade 2+ transfer without transfer certificate', () => {
    const blockers = getBlockers({
      application: makeApp(),
      documents: makeBaseDocumentSet(), // No TC in base set
      academicDetails: makeAcademic({
        enrollment_type: 'transfer',
        applying_grade_name: 'Grade 5',
      }),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian()],
    });

    const tcBlockers = blockers.filter(
      (b) => b.type === 'missing_transfer_certificate',
    );
    expect(tcBlockers.length).toBeGreaterThan(0);
    expect(tcBlockers[0].severity).toBe('error');
  });

  it('should NOT return a TC blocker for KG transfer', () => {
    const blockers = getBlockers({
      application: makeApp(),
      documents: makeBaseDocumentSet(),
      academicDetails: makeAcademic({
        enrollment_type: 'transfer',
        applying_grade_name: 'KG2',
      }),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian()],
    });

    const tcBlockers = blockers.filter(
      (b) => b.type === 'missing_transfer_certificate',
    );
    expect(tcBlockers).toHaveLength(0);
  });

  it('should return a blocker when attestation is pending', () => {
    const docs = [
      ...makeBaseDocumentSet(),
      makeDoc({
        id: 'doc-att',
        document_type: 'academic_transcript',
        status: 'uploaded',
        attestation_required: true,
        attestation_status: 'pending',
      }),
    ];

    const blockers = getBlockers({
      application: makeApp(),
      documents: docs,
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian()],
    });

    const attBlockers = blockers.filter((b) => b.type === 'pending_attestation');
    expect(attBlockers.length).toBeGreaterThan(0);
    expect(attBlockers[0].severity).toBe('error');
  });

  it('should return a blocker when translation is pending', () => {
    const docs = [
      ...makeBaseDocumentSet(),
      makeDoc({
        id: 'doc-trans',
        document_type: 'birth_certificate',
        status: 'uploaded',
        translation_required: true,
        translation_status: 'pending',
      }),
    ];

    const blockers = getBlockers({
      application: makeApp(),
      documents: docs,
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian()],
    });

    const transBlockers = blockers.filter((b) => b.type === 'pending_translation');
    expect(transBlockers.length).toBeGreaterThan(0);
    expect(transBlockers[0].severity).toBe('error');
  });

  it('should return a blocker when guardian has custody case but no custody document', () => {
    const blockers = getBlockers({
      application: makeApp(),
      documents: makeBaseDocumentSet(),
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian({ custody_case: true })],
    });

    const custodyBlockers = blockers.filter(
      (b) => b.type === 'missing_custody_document',
    );
    expect(custodyBlockers.length).toBeGreaterThan(0);
    expect(custodyBlockers[0].severity).toBe('error');
  });

  it('should return a blocker when guardian is legal guardian but no custody document', () => {
    const blockers = getBlockers({
      application: makeApp(),
      documents: makeBaseDocumentSet(),
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian({ is_legal_guardian: true })],
    });

    const custodyBlockers = blockers.filter(
      (b) => b.type === 'missing_custody_document',
    );
    expect(custodyBlockers.length).toBeGreaterThan(0);
  });

  it('should NOT return a custody blocker when custody document is uploaded', () => {
    const docs = [
      ...makeBaseDocumentSet(),
      makeDoc({
        id: 'doc-custody',
        document_type: 'custody_guardianship_document',
        status: 'uploaded',
      }),
    ];

    const blockers = getBlockers({
      application: makeApp(),
      documents: docs,
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian({ custody_case: true })],
    });

    const custodyBlockers = blockers.filter(
      (b) => b.type === 'missing_custody_document',
    );
    expect(custodyBlockers).toHaveLength(0);
  });

  it('should return a warning when no Emirates ID is available', () => {
    const blockers = getBlockers({
      application: makeApp(),
      documents: makeBaseDocumentSet(),
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity({ emirates_id_available: false }),
      guardianDetails: [makeGuardian()],
    });

    const eidWarnings = blockers.filter(
      (b) => b.type === 'no_emirates_id' && b.severity === 'warning',
    );
    expect(eidWarnings.length).toBeGreaterThan(0);
    expect(eidWarnings[0].message).toContain('provisional');
  });

  it('should NOT return a no_emirates_id warning when Emirates ID is available', () => {
    const blockers = getBlockers({
      application: makeApp(),
      documents: makeBaseDocumentSet(),
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity({ emirates_id_available: true }),
      guardianDetails: [makeGuardian()],
    });

    const eidWarnings = blockers.filter((b) => b.type === 'no_emirates_id');
    expect(eidWarnings).toHaveLength(0);
  });

  it('should return blockers for missing required documents', () => {
    // Empty document list = all required docs are missing
    const blockers = getBlockers({
      application: makeApp(),
      documents: [],
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian()],
    });

    const missingDocBlockers = blockers.filter(
      (b) => b.type === 'missing_required_document',
    );
    expect(missingDocBlockers.length).toBeGreaterThan(0);
  });
});

// ── computeApplicationStatus ─────────────────────────────────

describe('computeApplicationStatus', () => {
  it('should return draft for draft applications', () => {
    const status = computeApplicationStatus(
      makeApp({ status: 'draft' }),
      makeBaseDocumentSet(),
      makeAcademic(),
      makeIdentity(),
      [makeGuardian()],
    );
    expect(status).toBe('draft');
  });

  it('should return enrollment_activated for already activated applications', () => {
    const status = computeApplicationStatus(
      makeApp({ status: 'enrollment_activated' }),
      makeBaseDocumentSet(),
      makeAcademic(),
      makeIdentity(),
      [makeGuardian()],
    );
    expect(status).toBe('enrollment_activated');
  });

  it('should return pending_attestation when attestation is pending', () => {
    const docs = [
      ...makeBaseDocumentSet(),
      makeDoc({
        id: 'doc-att',
        document_type: 'academic_transcript',
        status: 'uploaded',
        attestation_required: true,
        attestation_status: 'pending',
      }),
    ];

    const status = computeApplicationStatus(
      makeApp({ status: 'submitted' }),
      docs,
      makeAcademic(),
      makeIdentity(),
      [makeGuardian()],
    );
    expect(status).toBe('pending_attestation');
  });

  it('should return pending_translation when translation is pending', () => {
    const docs = [
      ...makeBaseDocumentSet(),
      makeDoc({
        id: 'doc-trans',
        document_type: 'birth_certificate',
        status: 'uploaded',
        translation_required: true,
        translation_status: 'pending',
      }),
    ];

    const status = computeApplicationStatus(
      makeApp({ status: 'submitted' }),
      docs,
      makeAcademic(),
      makeIdentity(),
      [makeGuardian()],
    );
    expect(status).toBe('pending_translation');
  });

  it('should return awaiting_transfer_certificate for Grade 2+ transfer without TC', () => {
    const status = computeApplicationStatus(
      makeApp({ status: 'submitted' }),
      makeBaseDocumentSet(),
      makeAcademic({
        enrollment_type: 'transfer',
        applying_grade_name: 'Grade 4',
      }),
      makeIdentity(),
      [makeGuardian()],
    );
    expect(status).toBe('awaiting_transfer_certificate');
  });

  it('should return pending_documents when required docs are missing', () => {
    const status = computeApplicationStatus(
      makeApp({ status: 'submitted' }),
      [], // No documents at all
      makeAcademic(),
      makeIdentity(),
      [makeGuardian()],
    );
    expect(status).toBe('pending_documents');
  });

  it('should return provisionally_accepted when only warnings exist (no Emirates ID)', () => {
    const status = computeApplicationStatus(
      makeApp({ status: 'submitted' }),
      makeBaseDocumentSet(),
      makeAcademic(),
      makeIdentity({ emirates_id_available: false }),
      [makeGuardian()],
    );
    expect(status).toBe('provisionally_accepted');
  });

  it('should recommend approved when all docs are verified and no blockers', () => {
    const allVerifiedDocs = makeBaseDocumentSet().map((d) => ({
      ...d,
      status: 'verified' as const,
      attestation_required: false,
      attestation_status: 'not_required',
      translation_required: false,
      translation_status: 'not_required',
    }));

    const status = computeApplicationStatus(
      makeApp({ status: 'submitted' }),
      allVerifiedDocs,
      makeAcademic(),
      makeIdentity({ emirates_id_available: true }),
      [makeGuardian()],
    );

    // Should be approved or under_review (depending on canFullyApprove)
    expect(['approved', 'under_review']).toContain(status);
  });

  it('should return under_review when there are error blockers', () => {
    // Missing passport + birth cert but other docs present
    const docs = makeBaseDocumentSet().filter(
      (d) =>
        d.document_type !== 'student_passport' &&
        d.document_type !== 'birth_certificate',
    );

    const status = computeApplicationStatus(
      makeApp({ status: 'submitted' }),
      docs,
      makeAcademic(),
      makeIdentity(),
      [makeGuardian()],
    );

    // Should be pending_documents or under_review (has missing required docs)
    expect(['pending_documents', 'under_review']).toContain(status);
  });
});

// ── evaluateForProvisionalAcceptance ─────────────────────────

describe('evaluateForProvisionalAcceptance', () => {
  it('should be eligible when no Emirates ID but otherwise complete', () => {
    const result = evaluateForProvisionalAcceptance({
      application: makeApp(),
      documents: makeBaseDocumentSet(),
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity({ emirates_id_available: false }),
      guardianDetails: [makeGuardian()],
    });

    expect(result.eligible).toBe(true);
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.reasons.some((r) => r.includes('Emirates ID') || r.includes('provisional'))).toBe(true);
  });

  it('should be eligible when attestation is the only error blocker', () => {
    const docs = [
      ...makeBaseDocumentSet(),
      makeDoc({
        id: 'doc-att',
        document_type: 'academic_transcript',
        status: 'uploaded',
        attestation_required: true,
        attestation_status: 'pending',
      }),
    ];

    const result = evaluateForProvisionalAcceptance({
      application: makeApp(),
      documents: docs,
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian()],
    });

    expect(result.eligible).toBe(true);
  });

  it('should NOT be eligible when hard blockers exist (missing passport)', () => {
    const docs = makeBaseDocumentSet().filter(
      (d) => d.document_type !== 'student_passport',
    );

    const result = evaluateForProvisionalAcceptance({
      application: makeApp(),
      documents: docs,
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian()],
    });

    expect(result.eligible).toBe(false);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('should NOT be eligible when custody document is missing', () => {
    const result = evaluateForProvisionalAcceptance({
      application: makeApp(),
      documents: makeBaseDocumentSet(),
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian({ custody_case: true })],
    });

    expect(result.eligible).toBe(false);
    expect(result.reasons.some((r) => r.toLowerCase().includes('custody'))).toBe(true);
  });

  it('should be eligible when translation is pending (soft blocker)', () => {
    const docs = [
      ...makeBaseDocumentSet(),
      makeDoc({
        id: 'doc-trans',
        document_type: 'birth_certificate',
        status: 'uploaded',
        translation_required: true,
        translation_status: 'pending',
      }),
    ];

    const result = evaluateForProvisionalAcceptance({
      application: makeApp(),
      documents: docs,
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian()],
    });

    expect(result.eligible).toBe(true);
  });

  it('should suggest full approval when all requirements met', () => {
    const allVerifiedDocs = makeBaseDocumentSet().map((d) => ({
      ...d,
      status: 'verified' as const,
    }));

    const result = evaluateForProvisionalAcceptance({
      application: makeApp(),
      documents: allVerifiedDocs,
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity({ emirates_id_available: true }),
      guardianDetails: [makeGuardian()],
    });

    expect(result.eligible).toBe(true);
    expect(
      result.reasons.some((r) => r.includes('full approval')),
    ).toBe(true);
  });

  it('should NOT be eligible when Grade 2+ transfer is missing TC', () => {
    const result = evaluateForProvisionalAcceptance({
      application: makeApp(),
      documents: makeBaseDocumentSet(),
      academicDetails: makeAcademic({
        enrollment_type: 'transfer',
        applying_grade_name: 'Grade 5',
      }),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian()],
    });

    expect(result.eligible).toBe(false);
    expect(
      result.reasons.some((r) => r.toLowerCase().includes('transfer certificate')),
    ).toBe(true);
  });
});

// ── VALID_TRANSITIONS (structural checks) ────────────────────

describe('VALID_TRANSITIONS', () => {
  it('should define transitions for every EnrollmentAppStatus', () => {
    const expectedStatuses: EnrollmentAppStatus[] = [
      'draft',
      'submitted',
      'incomplete',
      'pending_documents',
      'pending_verification',
      'under_review',
      'pending_attestation',
      'pending_translation',
      'awaiting_transfer_certificate',
      'action_required',
      'provisionally_accepted',
      'approved',
      'rejected',
      'enrollment_activated',
    ];

    for (const status of expectedStatuses) {
      expect(VALID_TRANSITIONS[status]).toBeDefined();
      expect(Array.isArray(VALID_TRANSITIONS[status])).toBe(true);
    }
  });

  it('should have enrollment_activated as a terminal state (no outgoing transitions)', () => {
    expect(VALID_TRANSITIONS.enrollment_activated).toHaveLength(0);
  });

  it('should allow rejected applications to be re-submitted', () => {
    expect(VALID_TRANSITIONS.rejected).toContain('submitted');
  });

  it('should allow under_review to transition to many states', () => {
    const underReviewTargets = VALID_TRANSITIONS.under_review;
    expect(underReviewTargets.length).toBeGreaterThanOrEqual(5);
    expect(underReviewTargets).toContain('approved');
    expect(underReviewTargets).toContain('rejected');
    expect(underReviewTargets).toContain('provisionally_accepted');
    expect(underReviewTargets).toContain('pending_attestation');
    expect(underReviewTargets).toContain('pending_translation');
  });
});
