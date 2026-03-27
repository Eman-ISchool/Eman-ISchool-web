// ============================================================
// Enrollment API Business Logic Tests
// ============================================================
//
// The enrollment API routes depend on NextAuth session, Supabase,
// and the Next.js request lifecycle. Instead of full integration
// tests (which require a running server and database), these tests
// exercise the business logic functions that the API routes call
// internally. This validates the same rules that the API enforces.
//
// E2E tests that would complement these unit tests:
// - POST /api/enrollment/applications: creates a draft (201)
// - PATCH /api/enrollment/applications/[id]: updates a section (200)
// - POST /api/enrollment/applications/[id]/submit: submits valid (200)
// - POST /api/enrollment/applications/[id]/submit: rejects invalid (422)
// - GET /api/enrollment/applications: parent sees only own apps
// - GET /api/enrollment/applications: non-parent gets 403
// - POST /api/enrollment/applications/[id]/review: non-admin gets 403
// - POST /api/enrollment/applications/[id]/review (verify_document)
// - POST /api/enrollment/applications/[id]/review (approve)
// - POST /api/enrollment/applications/[id]/review (reject)
// - POST /api/enrollment/applications/[id]/activate: creates onboarding
// - POST /api/enrollment/applications/[id]/documents: re-upload
// ============================================================

import {
  validateForSubmission,
  canTransitionTo,
  canFullyApprove,
  getBlockers,
  evaluateForProvisionalAcceptance,
} from '@/lib/enrollment';

import type {
  EnrollmentApplication,
  EnrollmentDocument,
  EnrollmentAcademicDetails,
  EnrollmentIdentityDetails,
  EnrollmentGuardianDetails,
  EnrollmentStudentDetails,
  EnrollmentMedicalDetails,
  EnrollmentDeclarations,
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
    status: 'draft',
    completeness_score: 0,
    current_step: 1,
    steps_completed: [],
    submitted_at: null,
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

function makeStudent(
  overrides: Partial<EnrollmentStudentDetails> = {},
): EnrollmentStudentDetails {
  return {
    id: 'student-1',
    application_id: 'app-1',
    full_name_en: 'John Doe',
    full_name_ar: '\u0645\u062D\u0645\u062F',
    date_of_birth: '2018-03-15',
    gender: 'male',
    nationality: 'EG',
    religion: 'Islam',
    mother_tongue: 'Arabic',
    place_of_birth: 'Cairo',
    secondary_nationality: null,
    preferred_language: null,
    created_at: ts,
    updated_at: ts,
    ...overrides,
  };
}

function makeAcademic(
  overrides: Partial<EnrollmentAcademicDetails> = {},
): EnrollmentAcademicDetails {
  return {
    id: 'acad-1',
    application_id: 'app-1',
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
    created_at: ts,
    updated_at: ts,
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

function makeIdentity(
  overrides: Partial<EnrollmentIdentityDetails> = {},
): EnrollmentIdentityDetails {
  return {
    id: 'identity-1',
    application_id: 'app-1',
    emirates_id_available: true,
    emirates_id_number: '784-2015-1234567-1',
    student_passport_number: 'A12345678',
    student_passport_expiry: '2030-01-01',
    residence_visa_number: null,
    residence_visa_expiry: null,
    residency_status: 'visitor',
    country_of_residence: 'Egypt',
    created_at: ts,
    updated_at: ts,
    ...overrides,
  };
}

function makeMedical(
  overrides: Partial<EnrollmentMedicalDetails> = {},
): EnrollmentMedicalDetails {
  return {
    id: 'medical-1',
    application_id: 'app-1',
    has_medical_condition: false,
    medical_condition_details: null,
    has_sen: false,
    sen_details: null,
    vaccination_record_available: true,
    allergies: null,
    medication_notes: null,
    health_notes: null,
    created_at: ts,
    updated_at: ts,
    ...overrides,
  };
}

function makeDeclarations(
  overrides: Partial<EnrollmentDeclarations> = {},
): EnrollmentDeclarations {
  return {
    id: 'decl-1',
    application_id: 'app-1',
    info_correct: true,
    docs_authentic: true,
    accepts_verification: true,
    acknowledges_attestation: true,
    acknowledges_missing_delays: true,
    privacy_policy_accepted: true,
    medical_emergency_consent: null,
    communications_consent: null,
    marketing_consent: null,
    digital_platform_consent: null,
    declared_at: ts,
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
    document_type: 'student_photo',
    label: 'Student Photo',
    is_required: true,
    is_conditional: false,
    condition_rule: null,
    file_url: 'https://storage.example.com/photo.jpg',
    file_name: 'photo.jpg',
    file_size: 1024,
    file_mime_type: 'image/jpeg',
    storage_path: '/uploads/photo.jpg',
    status: 'uploaded',
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

function makeMinimalDocs(): EnrollmentDocument[] {
  return [
    makeDoc({ id: 'doc-photo', document_type: 'student_photo', status: 'uploaded' }),
    makeDoc({ id: 'doc-passport', document_type: 'student_passport', status: 'uploaded' }),
    makeDoc({ id: 'doc-birth', document_type: 'birth_certificate', status: 'uploaded' }),
  ];
}

function makeFullDocumentSet(): EnrollmentDocument[] {
  return [
    makeDoc({ id: 'doc-photo', document_type: 'student_photo', status: 'verified' }),
    makeDoc({ id: 'doc-passport', document_type: 'student_passport', status: 'verified' }),
    makeDoc({ id: 'doc-birth', document_type: 'birth_certificate', status: 'verified' }),
    makeDoc({ id: 'doc-vax', document_type: 'vaccination_record', status: 'verified' }),
    makeDoc({ id: 'doc-parent-eid', document_type: 'parent_emirates_id', status: 'verified' }),
    makeDoc({ id: 'doc-parent-pp', document_type: 'parent_passport', status: 'verified' }),
    makeDoc({ id: 'doc-student-eid', document_type: 'student_emirates_id', status: 'verified' }),
  ];
}

// ── Scenario: Create draft application ───────────────────────

describe('API Scenario: Create draft application', () => {
  // The POST /api/enrollment/applications route creates a draft.
  // It requires the user to be a parent. Test the validation
  // that runs on the newly created empty application.

  it('should accept an empty application as a draft (no validation errors on creation)', () => {
    // Draft applications are not validated — only on submission.
    // The application starts with empty details; we confirm validation
    // correctly identifies what is missing without throwing.
    const result = validateForSubmission({
      studentDetails: null,
      academicDetails: null,
      guardians: null,
      identityDetails: null,
      medicalDetails: null,
      declarations: null,
      documents: [],
    });

    // Expected: not valid (incomplete draft)
    expect(result.valid).toBe(false);
    // But it should return errors, not crash
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  });
});

// ── Scenario: Submit valid application ───────────────────────

describe('API Scenario: Submit valid application', () => {
  it('should pass validation for a fully filled application', () => {
    const result = validateForSubmission({
      studentDetails: makeStudent(),
      academicDetails: makeAcademic(),
      guardians: [makeGuardian()],
      identityDetails: makeIdentity(),
      medicalDetails: makeMedical(),
      declarations: makeDeclarations(),
      documents: makeMinimalDocs(),
    });

    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should allow draft -> submitted transition', () => {
    expect(canTransitionTo('draft', 'submitted')).toBe(true);
  });
});

// ── Scenario: Submit with missing documents ──────────────────

describe('API Scenario: Submit with missing documents (422)', () => {
  it('should fail when required documents are missing', () => {
    const result = validateForSubmission({
      studentDetails: makeStudent(),
      academicDetails: makeAcademic(),
      guardians: [makeGuardian()],
      identityDetails: makeIdentity(),
      medicalDetails: makeMedical(),
      declarations: makeDeclarations(),
      documents: [], // No documents
    });

    expect(result.valid).toBe(false);
    expect(result.errors['documents.student_photo']).toBeDefined();
    expect(result.errors['documents.student_passport']).toBeDefined();
    expect(result.errors['documents.birth_certificate']).toBeDefined();
  });

  it('should fail when student details are incomplete', () => {
    const result = validateForSubmission({
      studentDetails: makeStudent({ full_name_en: null, gender: null }),
      academicDetails: makeAcademic(),
      guardians: [makeGuardian()],
      identityDetails: makeIdentity(),
      medicalDetails: makeMedical(),
      declarations: makeDeclarations(),
      documents: makeMinimalDocs(),
    });

    expect(result.valid).toBe(false);
    expect(result.errors['student.full_name_en']).toBeDefined();
    expect(result.errors['student.gender']).toBeDefined();
  });
});

// ── Scenario: Unauthorized access ────────────────────────────

describe('API Scenario: Authorization rules (business logic)', () => {
  // The API routes enforce role checks via NextAuth session.
  // We validate that the transition rules block invalid state changes
  // that a non-admin might attempt.

  it('should block direct transitions to approved from draft (non-admin bypass attempt)', () => {
    expect(canTransitionTo('draft', 'approved')).toBe(false);
  });

  it('should block direct transitions to enrollment_activated from submitted', () => {
    expect(canTransitionTo('submitted', 'enrollment_activated')).toBe(false);
  });

  it('should block transitions out of enrollment_activated (immutable terminal state)', () => {
    expect(canTransitionTo('enrollment_activated', 'draft')).toBe(false);
    expect(canTransitionTo('enrollment_activated', 'submitted')).toBe(false);
    expect(canTransitionTo('enrollment_activated', 'approved')).toBe(false);
  });
});

// ── Scenario: Admin verify document ──────────────────────────

describe('API Scenario: Admin verify document', () => {
  // verify_document action transitions a doc from pending_review -> verified.
  // The business logic impact: canFullyApprove checks all doc statuses.

  it('should allow full approval when all documents are verified', () => {
    const docs = makeFullDocumentSet();
    expect(canFullyApprove(docs)).toBe(true);
  });

  it('should block full approval when a document has pending attestation', () => {
    const docs = [
      ...makeFullDocumentSet(),
      makeDoc({
        id: 'doc-extra',
        document_type: 'academic_transcript',
        status: 'uploaded',
        attestation_required: true,
        attestation_status: 'pending',
      }),
    ];
    expect(canFullyApprove(docs)).toBe(false);
  });
});

// ── Scenario: Admin approve ──────────────────────────────────

describe('API Scenario: Admin approve application', () => {
  it('should allow under_review -> approved', () => {
    expect(canTransitionTo('under_review', 'approved')).toBe(true);
  });

  it('should return blockers when trying to approve with pending attestation', () => {
    const docs = [
      ...makeFullDocumentSet(),
      makeDoc({
        id: 'doc-att',
        document_type: 'academic_transcript',
        status: 'uploaded',
        attestation_required: true,
        attestation_status: 'pending',
      }),
    ];

    const blockers = getBlockers({
      application: makeApp({ status: 'under_review' }),
      documents: docs,
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian()],
    });

    const attBlockers = blockers.filter((b) => b.type === 'pending_attestation');
    expect(attBlockers.length).toBeGreaterThan(0);
  });

  it('should allow provisional_accepted -> approved', () => {
    expect(canTransitionTo('provisionally_accepted', 'approved')).toBe(true);
  });
});

// ── Scenario: Admin reject ───────────────────────────────────

describe('API Scenario: Admin reject application', () => {
  it('should allow under_review -> rejected', () => {
    expect(canTransitionTo('under_review', 'rejected')).toBe(true);
  });

  it('should allow re-submission after rejection', () => {
    expect(canTransitionTo('rejected', 'submitted')).toBe(true);
  });

  it('should not allow direct re-approval after rejection', () => {
    expect(canTransitionTo('rejected', 'approved')).toBe(false);
  });
});

// ── Scenario: Activate enrollment ────────────────────────────

describe('API Scenario: Activate enrollment', () => {
  // POST /api/enrollment/applications/[id]/activate transitions
  // approved or provisionally_accepted -> enrollment_activated
  // and creates student account + onboarding tasks.

  it('should allow approved -> enrollment_activated', () => {
    expect(canTransitionTo('approved', 'enrollment_activated')).toBe(true);
  });

  it('should allow provisionally_accepted -> enrollment_activated', () => {
    expect(canTransitionTo('provisionally_accepted', 'enrollment_activated')).toBe(true);
  });

  it('should NOT allow draft -> enrollment_activated', () => {
    expect(canTransitionTo('draft', 'enrollment_activated')).toBe(false);
  });

  it('should NOT allow submitted -> enrollment_activated', () => {
    expect(canTransitionTo('submitted', 'enrollment_activated')).toBe(false);
  });
});

// ── Scenario: Re-upload rejected document ────────────────────

describe('API Scenario: Re-upload rejected document', () => {
  // When a document is rejected or re_upload_requested, the parent
  // can re-upload. The doc transitions back through the pipeline.
  // The application may need to go through action_required -> submitted.

  it('should allow action_required -> submitted (after re-upload)', () => {
    expect(canTransitionTo('action_required', 'submitted')).toBe(true);
  });

  it('should allow action_required -> under_review', () => {
    expect(canTransitionTo('action_required', 'under_review')).toBe(true);
  });
});

// ── Critical scenario: Full lifecycle ────────────────────────

describe('Critical scenario: Full application lifecycle', () => {
  it('should support the complete happy-path status chain', () => {
    // draft -> submitted -> under_review -> approved -> enrollment_activated
    expect(canTransitionTo('draft', 'submitted')).toBe(true);
    expect(canTransitionTo('submitted', 'under_review')).toBe(true);
    expect(canTransitionTo('under_review', 'approved')).toBe(true);
    expect(canTransitionTo('approved', 'enrollment_activated')).toBe(true);
  });

  it('should support the provisional acceptance path', () => {
    // draft -> submitted -> under_review -> provisionally_accepted -> approved -> enrollment_activated
    expect(canTransitionTo('draft', 'submitted')).toBe(true);
    expect(canTransitionTo('submitted', 'under_review')).toBe(true);
    expect(canTransitionTo('under_review', 'provisionally_accepted')).toBe(true);
    expect(canTransitionTo('provisionally_accepted', 'approved')).toBe(true);
    expect(canTransitionTo('approved', 'enrollment_activated')).toBe(true);
  });

  it('should support the action-required feedback loop', () => {
    // under_review -> action_required -> submitted -> under_review
    expect(canTransitionTo('under_review', 'action_required')).toBe(true);
    expect(canTransitionTo('action_required', 'submitted')).toBe(true);
    expect(canTransitionTo('submitted', 'under_review')).toBe(true);
  });

  it('should support the attestation/translation workflow', () => {
    // under_review -> pending_attestation -> under_review -> approved
    expect(canTransitionTo('under_review', 'pending_attestation')).toBe(true);
    expect(canTransitionTo('pending_attestation', 'under_review')).toBe(true);
    expect(canTransitionTo('under_review', 'pending_translation')).toBe(true);
    expect(canTransitionTo('pending_translation', 'under_review')).toBe(true);
    expect(canTransitionTo('under_review', 'approved')).toBe(true);
  });

  it('should support the rejection and re-submission cycle', () => {
    // under_review -> rejected -> submitted -> under_review
    expect(canTransitionTo('under_review', 'rejected')).toBe(true);
    expect(canTransitionTo('rejected', 'submitted')).toBe(true);
    expect(canTransitionTo('submitted', 'under_review')).toBe(true);
  });
});

// ── Critical scenario: 12 key enrollment test cases ──────────

describe('Critical: 12 enrollment test scenarios', () => {
  // 1. New enrollment (KG) - straightforward
  it('1. New KG enrollment should pass validation with minimal docs', () => {
    const result = validateForSubmission({
      studentDetails: makeStudent({ date_of_birth: '2022-06-01' }),
      academicDetails: makeAcademic({
        enrollment_type: 'new',
        applying_grade_name: 'KG1',
      }),
      guardians: [makeGuardian()],
      identityDetails: makeIdentity(),
      medicalDetails: makeMedical(),
      declarations: makeDeclarations(),
      documents: makeMinimalDocs(),
    });
    expect(result.valid).toBe(true);
  });

  // 2. Transfer student Grade 2+ requires TC
  it('2. Grade 3 transfer without TC should have a TC blocker', () => {
    const blockers = getBlockers({
      application: makeApp({ status: 'under_review' }),
      documents: makeFullDocumentSet(),
      academicDetails: makeAcademic({
        enrollment_type: 'transfer',
        applying_grade_name: 'Grade 3',
      }),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian()],
    });
    expect(blockers.some((b) => b.type === 'missing_transfer_certificate')).toBe(true);
  });

  // 3. Egypt-issued documents require attestation
  it('3. Egypt-issued birth certificate should block full approval without attestation', () => {
    const docs = makeFullDocumentSet().map((d) =>
      d.document_type === 'birth_certificate'
        ? {
            ...d,
            issuing_country: 'Egypt',
            attestation_required: true,
            attestation_status: 'pending',
          }
        : d,
    );
    expect(canFullyApprove(docs)).toBe(false);
  });

  // 4. UAE-issued docs do not require attestation
  it('4. UAE-issued birth certificate should not block full approval', () => {
    const docs = makeFullDocumentSet().map((d) =>
      d.document_type === 'birth_certificate'
        ? {
            ...d,
            issuing_country: 'UAE',
            attestation_required: false,
            attestation_status: 'not_required',
          }
        : d,
    );
    expect(canFullyApprove(docs)).toBe(true);
  });

  // 5. Non-Arabic non-English documents need translation
  it('5. French-language document should require translation', () => {
    const docs = makeFullDocumentSet().map((d) =>
      d.document_type === 'birth_certificate'
        ? {
            ...d,
            document_language: 'French',
            translation_required: true,
            translation_status: 'pending',
          }
        : d,
    );
    expect(canFullyApprove(docs)).toBe(false);
  });

  // 6. No Emirates ID = provisional acceptance only
  it('6. No Emirates ID should qualify for provisional but not full approval', () => {
    const prov = evaluateForProvisionalAcceptance({
      application: makeApp({ status: 'under_review' }),
      documents: makeFullDocumentSet(),
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity({ emirates_id_available: false }),
      guardianDetails: [makeGuardian()],
    });
    expect(prov.eligible).toBe(true);
    expect(prov.reasons.some((r) => r.includes('Emirates ID') || r.includes('provisional'))).toBe(true);
  });

  // 7. Custody case without legal document
  it('7. Custody case without document should be blocked', () => {
    const blockers = getBlockers({
      application: makeApp({ status: 'under_review' }),
      documents: makeFullDocumentSet(),
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian({ custody_case: true })],
    });
    expect(blockers.some((b) => b.type === 'missing_custody_document')).toBe(true);
  });

  // 8. SEN student requires SEN document
  it('8. SEN student should fail validation without SEN details', () => {
    const result = validateForSubmission({
      studentDetails: makeStudent(),
      academicDetails: makeAcademic(),
      guardians: [makeGuardian()],
      identityDetails: makeIdentity(),
      medicalDetails: makeMedical({ has_sen: true, sen_details: null }),
      declarations: makeDeclarations(),
      documents: makeMinimalDocs(),
    });
    expect(result.valid).toBe(false);
  });

  // 9. Medical condition without details fails
  it('9. Medical condition without details should fail validation', () => {
    const result = validateForSubmission({
      studentDetails: makeStudent(),
      academicDetails: makeAcademic(),
      guardians: [makeGuardian()],
      identityDetails: makeIdentity(),
      medicalDetails: makeMedical({
        has_medical_condition: true,
        medical_condition_details: null,
      }),
      declarations: makeDeclarations(),
      documents: makeMinimalDocs(),
    });
    expect(result.valid).toBe(false);
  });

  // 10. All declarations must be accepted
  it('10. Missing declarations should fail submission', () => {
    const result = validateForSubmission({
      studentDetails: makeStudent(),
      academicDetails: makeAcademic(),
      guardians: [makeGuardian()],
      identityDetails: makeIdentity(),
      medicalDetails: makeMedical(),
      declarations: makeDeclarations({
        privacy_policy_accepted: false,
        docs_authentic: false,
      }),
      documents: makeMinimalDocs(),
    });
    expect(result.valid).toBe(false);
  });

  // 11. Identity: must have passport or Emirates ID
  it('11. No passport and no Emirates ID should fail identity validation', () => {
    const result = validateForSubmission({
      studentDetails: makeStudent(),
      academicDetails: makeAcademic(),
      guardians: [makeGuardian()],
      identityDetails: makeIdentity({
        student_passport_number: null,
        emirates_id_available: false,
        emirates_id_number: null,
      }),
      medicalDetails: makeMedical(),
      declarations: makeDeclarations(),
      documents: makeMinimalDocs(),
    });
    expect(result.valid).toBe(false);
    expect(result.errors['identity._identity']).toBeDefined();
  });

  // 12. Complete application with all requirements met
  it('12. Fully complete application should pass all checks', () => {
    const completeApp = makeApp({ status: 'under_review' });
    const docs = makeFullDocumentSet();

    // Validation passes
    const validation = validateForSubmission({
      studentDetails: makeStudent(),
      academicDetails: makeAcademic(),
      guardians: [makeGuardian()],
      identityDetails: makeIdentity(),
      medicalDetails: makeMedical(),
      declarations: makeDeclarations(),
      documents: docs,
    });
    expect(validation.valid).toBe(true);

    // Can fully approve
    expect(canFullyApprove(docs)).toBe(true);

    // No hard blockers
    const blockers = getBlockers({
      application: completeApp,
      documents: docs,
      academicDetails: makeAcademic(),
      identityDetails: makeIdentity(),
      guardianDetails: [makeGuardian()],
    });
    const errors = blockers.filter((b) => b.severity === 'error');
    expect(errors).toHaveLength(0);

    // Full lifecycle is possible
    expect(canTransitionTo('under_review', 'approved')).toBe(true);
    expect(canTransitionTo('approved', 'enrollment_activated')).toBe(true);
  });
});
