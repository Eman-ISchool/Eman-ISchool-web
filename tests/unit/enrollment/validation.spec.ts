// ============================================================
// Enrollment Validation Engine Tests
// Tests: validateStudentDetails, validateAcademicDetails,
//        validateGuardianDetails, validateIdentityDetails,
//        validateMedicalDetails, validateDeclarations,
//        validateForSubmission
// ============================================================

import {
  validateStudentDetails,
  validateAcademicDetails,
  validateGuardianDetails,
  validateIdentityDetails,
  validateMedicalDetails,
  validateDeclarations,
  validateForSubmission,
} from '@/lib/enrollment/validation';

import type {
  EnrollmentStudentDetails,
  EnrollmentAcademicDetails,
  EnrollmentGuardianDetails,
  EnrollmentIdentityDetails,
  EnrollmentMedicalDetails,
  EnrollmentDeclarations,
  EnrollmentDocument,
} from '@/types/enrollment';

// ── Helpers ──────────────────────────────────────────────────

const baseTimestamps = {
  id: 'test-id',
  application_id: 'app-1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

function makeStudentDetails(
  overrides: Partial<EnrollmentStudentDetails> = {},
): EnrollmentStudentDetails {
  return {
    ...baseTimestamps,
    full_name_en: 'John Doe',
    full_name_ar: '\u0645\u062D\u0645\u062F \u0639\u0644\u064A',
    date_of_birth: '2015-06-15',
    gender: 'male',
    nationality: 'EG',
    religion: 'Islam',
    mother_tongue: 'Arabic',
    place_of_birth: 'Cairo',
    secondary_nationality: null,
    preferred_language: null,
    ...overrides,
  };
}

function makeAcademicDetails(
  overrides: Partial<EnrollmentAcademicDetails> = {},
): EnrollmentAcademicDetails {
  return {
    ...baseTimestamps,
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

function makeGuardian(
  overrides: Partial<EnrollmentGuardianDetails> = {},
): EnrollmentGuardianDetails {
  return {
    ...baseTimestamps,
    contact_type: 'primary',
    relationship: 'father',
    full_name_en: 'Ahmed Doe',
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
    ...overrides,
  };
}

function makeIdentityDetails(
  overrides: Partial<EnrollmentIdentityDetails> = {},
): EnrollmentIdentityDetails {
  return {
    ...baseTimestamps,
    emirates_id_available: false,
    emirates_id_number: null,
    student_passport_number: 'A12345678',
    student_passport_expiry: '2030-01-01',
    residence_visa_number: null,
    residence_visa_expiry: null,
    residency_status: 'visitor',
    country_of_residence: 'Egypt',
    ...overrides,
  };
}

function makeMedicalDetails(
  overrides: Partial<EnrollmentMedicalDetails> = {},
): EnrollmentMedicalDetails {
  return {
    ...baseTimestamps,
    has_medical_condition: false,
    medical_condition_details: null,
    has_sen: false,
    sen_details: null,
    vaccination_record_available: true,
    allergies: null,
    medication_notes: null,
    health_notes: null,
    ...overrides,
  };
}

function makeDeclarations(
  overrides: Partial<EnrollmentDeclarations> = {},
): EnrollmentDeclarations {
  return {
    ...baseTimestamps,
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
    declared_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeDocument(
  overrides: Partial<EnrollmentDocument> = {},
): EnrollmentDocument {
  return {
    ...baseTimestamps,
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
    last_uploaded_at: '2026-01-01T00:00:00Z',
    expiry_date: null,
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────

describe('validateStudentDetails', () => {
  it('should pass with valid data', () => {
    const result = validateStudentDetails(makeStudentDetails());
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should fail when data is null', () => {
    const result = validateStudentDetails(null);
    expect(result.valid).toBe(false);
    expect(result.errors._form).toBeDefined();
  });

  it('should fail when English name is missing', () => {
    const result = validateStudentDetails(
      makeStudentDetails({ full_name_en: '' }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.full_name_en).toContain('required');
  });

  it('should fail when English name is null', () => {
    const result = validateStudentDetails(
      makeStudentDetails({ full_name_en: null }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.full_name_en).toContain('required');
  });

  it('should fail when English name contains Arabic characters', () => {
    const result = validateStudentDetails(
      makeStudentDetails({ full_name_en: '\u0645\u062D\u0645\u062F' }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.full_name_en).toContain('English letters');
  });

  it('should fail when Arabic name contains English characters', () => {
    const result = validateStudentDetails(
      makeStudentDetails({ full_name_ar: 'John Doe' }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.full_name_ar).toContain('Arabic letters');
  });

  it('should fail when Arabic name is missing', () => {
    const result = validateStudentDetails(
      makeStudentDetails({ full_name_ar: '' }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.full_name_ar).toContain('required');
  });

  it('should fail when date of birth is in the future', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const result = validateStudentDetails(
      makeStudentDetails({ date_of_birth: futureDate.toISOString().split('T')[0] }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.date_of_birth).toContain('past date');
  });

  it('should fail when date of birth is missing', () => {
    const result = validateStudentDetails(
      makeStudentDetails({ date_of_birth: null }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.date_of_birth).toBeDefined();
  });

  it('should fail when gender is missing', () => {
    const result = validateStudentDetails(
      makeStudentDetails({ gender: null }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.gender).toContain('required');
  });

  it('should fail when nationality is missing', () => {
    const result = validateStudentDetails(
      makeStudentDetails({ nationality: null }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.nationality).toContain('required');
  });

  it('should accept English names with hyphens and apostrophes', () => {
    const result = validateStudentDetails(
      makeStudentDetails({ full_name_en: "O'Brien-Smith" }),
    );
    expect(result.valid).toBe(true);
  });

  it('should report multiple errors simultaneously', () => {
    const result = validateStudentDetails(
      makeStudentDetails({
        full_name_en: null,
        full_name_ar: null,
        date_of_birth: null,
        gender: null,
        nationality: null,
      }),
    );
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(5);
  });
});

describe('validateAcademicDetails', () => {
  it('should pass for a valid new enrollment', () => {
    const result = validateAcademicDetails(makeAcademicDetails());
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should fail when data is null', () => {
    const result = validateAcademicDetails(null);
    expect(result.valid).toBe(false);
    expect(result.errors._form).toBeDefined();
  });

  it('should pass for a valid transfer enrollment', () => {
    const result = validateAcademicDetails(
      makeAcademicDetails({
        enrollment_type: 'transfer',
        applying_grade_name: 'Grade 3',
        previous_school_name: 'Old School',
        previous_school_country: 'Egypt',
        transfer_certificate_available: true,
        transfer_source: 'egypt',
      }),
    );
    expect(result.valid).toBe(true);
  });

  it('should fail when transfer is missing school name', () => {
    const result = validateAcademicDetails(
      makeAcademicDetails({
        enrollment_type: 'transfer',
        previous_school_name: null,
        previous_school_country: 'Egypt',
        transfer_certificate_available: true,
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.previous_school_name).toContain('required');
  });

  it('should fail when transfer is missing school country', () => {
    const result = validateAcademicDetails(
      makeAcademicDetails({
        enrollment_type: 'transfer',
        previous_school_name: 'Old School',
        previous_school_country: null,
        transfer_certificate_available: true,
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.previous_school_country).toContain('required');
  });

  it('should fail when Grade 2+ transfer is missing transfer certificate', () => {
    const result = validateAcademicDetails(
      makeAcademicDetails({
        enrollment_type: 'transfer',
        applying_grade_name: 'Grade 3',
        previous_school_name: 'Old School',
        previous_school_country: 'Egypt',
        transfer_certificate_available: false,
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.transfer_certificate_available).toContain('Grade 2');
  });

  it('should pass when KG transfer lacks transfer certificate', () => {
    const result = validateAcademicDetails(
      makeAcademicDetails({
        enrollment_type: 'transfer',
        applying_grade_name: 'KG1',
        previous_school_name: 'Old School',
        previous_school_country: 'Egypt',
        transfer_certificate_available: false,
      }),
    );
    expect(result.valid).toBe(true);
  });

  it('should pass when Grade 1 transfer lacks transfer certificate', () => {
    const result = validateAcademicDetails(
      makeAcademicDetails({
        enrollment_type: 'transfer',
        applying_grade_name: 'Grade 1',
        previous_school_name: 'Old School',
        previous_school_country: 'Egypt',
        transfer_certificate_available: false,
      }),
    );
    expect(result.valid).toBe(true);
  });

  it('should fail when enrollment type is missing', () => {
    const result = validateAcademicDetails(
      makeAcademicDetails({ enrollment_type: null }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.enrollment_type).toContain('required');
  });

  it('should fail when grade is missing', () => {
    const result = validateAcademicDetails(
      makeAcademicDetails({
        applying_grade_id: null,
        applying_grade_name: null,
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.applying_grade_id).toContain('required');
  });

  it('should fail when academic year is missing', () => {
    const result = validateAcademicDetails(
      makeAcademicDetails({ academic_year: null }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.academic_year).toContain('required');
  });

  it('should not require transfer fields for new enrollment', () => {
    const result = validateAcademicDetails(
      makeAcademicDetails({
        enrollment_type: 'new',
        previous_school_name: null,
        previous_school_country: null,
        transfer_certificate_available: false,
      }),
    );
    expect(result.valid).toBe(true);
  });
});

describe('validateGuardianDetails', () => {
  it('should pass with a valid primary contact', () => {
    const result = validateGuardianDetails([makeGuardian()]);
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should fail when guardians array is null', () => {
    const result = validateGuardianDetails(null);
    expect(result.valid).toBe(false);
    expect(result.errors._form).toContain('required');
  });

  it('should fail when guardians array is empty', () => {
    const result = validateGuardianDetails([]);
    expect(result.valid).toBe(false);
    expect(result.errors._form).toContain('required');
  });

  it('should fail when mobile is missing', () => {
    const result = validateGuardianDetails([
      makeGuardian({ mobile: '' }),
    ]);
    expect(result.valid).toBe(false);
    expect(Object.values(result.errors).some((v) => v.includes('Mobile'))).toBe(true);
  });

  it('should fail when email is missing', () => {
    const result = validateGuardianDetails([
      makeGuardian({ email: '' }),
    ]);
    expect(result.valid).toBe(false);
    expect(Object.values(result.errors).some((v) => v.includes('Email') || v.includes('email'))).toBe(true);
  });

  it('should fail when email format is invalid', () => {
    const result = validateGuardianDetails([
      makeGuardian({ email: 'not-an-email' }),
    ]);
    expect(result.valid).toBe(false);
    expect(
      Object.values(result.errors).some((v) => v.includes('valid email')),
    ).toBe(true);
  });

  it('should flag missing primary contact when only non-primary contacts exist', () => {
    const result = validateGuardianDetails([
      makeGuardian({ contact_type: 'emergency' }),
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors._primary).toContain('primary');
  });

  it('should pass with multiple guardians when one is primary', () => {
    const result = validateGuardianDetails([
      makeGuardian({ contact_type: 'primary' }),
      makeGuardian({
        id: 'guardian-2',
        contact_type: 'emergency',
        full_name_en: 'Sara',
        email: 'sara@example.com',
        mobile: '+971502222222',
      }),
    ]);
    expect(result.valid).toBe(true);
  });

  it('should fail when guardian name is missing', () => {
    const result = validateGuardianDetails([
      makeGuardian({ full_name_en: '' }),
    ]);
    expect(result.valid).toBe(false);
    expect(Object.values(result.errors).some((v) => v.includes('name'))).toBe(true);
  });
});

describe('validateIdentityDetails', () => {
  it('should pass with a valid passport number', () => {
    const result = validateIdentityDetails(makeIdentityDetails());
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should fail when data is null', () => {
    const result = validateIdentityDetails(null);
    expect(result.valid).toBe(false);
    expect(result.errors._form).toBeDefined();
  });

  it('should fail when neither passport nor Emirates ID is provided', () => {
    const result = validateIdentityDetails(
      makeIdentityDetails({
        student_passport_number: null,
        emirates_id_available: false,
        emirates_id_number: null,
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors._identity).toContain('passport');
  });

  it('should pass when only Emirates ID is provided (no passport)', () => {
    const result = validateIdentityDetails(
      makeIdentityDetails({
        student_passport_number: null,
        emirates_id_available: true,
        emirates_id_number: '784-2015-1234567-1',
      }),
    );
    expect(result.valid).toBe(true);
  });

  it('should fail when Emirates ID format is invalid', () => {
    const result = validateIdentityDetails(
      makeIdentityDetails({
        emirates_id_available: true,
        emirates_id_number: '123-456-789',
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.emirates_id_number).toContain('784-YYYY-NNNNNNN-C');
  });

  it('should pass when Emirates ID format is valid', () => {
    const result = validateIdentityDetails(
      makeIdentityDetails({
        emirates_id_available: true,
        emirates_id_number: '784-2015-1234567-1',
      }),
    );
    expect(result.valid).toBe(true);
  });

  it('should not validate Emirates ID format if emirates_id_available is false', () => {
    const result = validateIdentityDetails(
      makeIdentityDetails({
        student_passport_number: 'A12345678',
        emirates_id_available: false,
        emirates_id_number: null,
      }),
    );
    expect(result.valid).toBe(true);
  });

  it('should not validate Emirates ID format if the number is empty', () => {
    const result = validateIdentityDetails(
      makeIdentityDetails({
        student_passport_number: 'A12345678',
        emirates_id_available: true,
        emirates_id_number: '',
      }),
    );
    // Passport is present so identity requirement is met, and empty EID is not validated
    expect(result.errors.emirates_id_number).toBeUndefined();
  });
});

describe('validateMedicalDetails', () => {
  it('should pass when no medical condition is indicated', () => {
    const result = validateMedicalDetails(makeMedicalDetails());
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should fail when data is null', () => {
    const result = validateMedicalDetails(null);
    expect(result.valid).toBe(false);
    expect(result.errors._form).toBeDefined();
  });

  it('should fail when medical condition flag is set without details', () => {
    const result = validateMedicalDetails(
      makeMedicalDetails({
        has_medical_condition: true,
        medical_condition_details: null,
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.medical_condition_details).toContain('required');
  });

  it('should pass when medical condition flag is set with details', () => {
    const result = validateMedicalDetails(
      makeMedicalDetails({
        has_medical_condition: true,
        medical_condition_details: 'Asthma - uses inhaler',
      }),
    );
    expect(result.valid).toBe(true);
  });

  it('should fail when SEN flag is set without details', () => {
    const result = validateMedicalDetails(
      makeMedicalDetails({
        has_sen: true,
        sen_details: null,
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.sen_details).toContain('required');
  });

  it('should pass when SEN flag is set with details', () => {
    const result = validateMedicalDetails(
      makeMedicalDetails({
        has_sen: true,
        sen_details: 'Dyslexia - requires additional support',
      }),
    );
    expect(result.valid).toBe(true);
  });

  it('should fail when both conditions are set without details', () => {
    const result = validateMedicalDetails(
      makeMedicalDetails({
        has_medical_condition: true,
        medical_condition_details: '',
        has_sen: true,
        sen_details: '',
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.medical_condition_details).toBeDefined();
    expect(result.errors.sen_details).toBeDefined();
  });
});

describe('validateDeclarations', () => {
  it('should pass when all required declarations are true', () => {
    const result = validateDeclarations(makeDeclarations());
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should fail when data is null', () => {
    const result = validateDeclarations(null);
    expect(result.valid).toBe(false);
    expect(result.errors._form).toBeDefined();
  });

  it('should fail when info_correct is false', () => {
    const result = validateDeclarations(
      makeDeclarations({ info_correct: false }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.info_correct).toBeDefined();
  });

  it('should fail when docs_authentic is false', () => {
    const result = validateDeclarations(
      makeDeclarations({ docs_authentic: false }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.docs_authentic).toBeDefined();
  });

  it('should fail when accepts_verification is false', () => {
    const result = validateDeclarations(
      makeDeclarations({ accepts_verification: false }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.accepts_verification).toBeDefined();
  });

  it('should fail when acknowledges_attestation is false', () => {
    const result = validateDeclarations(
      makeDeclarations({ acknowledges_attestation: false }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.acknowledges_attestation).toBeDefined();
  });

  it('should fail when acknowledges_missing_delays is false', () => {
    const result = validateDeclarations(
      makeDeclarations({ acknowledges_missing_delays: false }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.acknowledges_missing_delays).toBeDefined();
  });

  it('should fail when privacy_policy_accepted is false', () => {
    const result = validateDeclarations(
      makeDeclarations({ privacy_policy_accepted: false }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.privacy_policy_accepted).toBeDefined();
  });

  it('should fail when all required declarations are false', () => {
    const result = validateDeclarations(
      makeDeclarations({
        info_correct: false,
        docs_authentic: false,
        accepts_verification: false,
        acknowledges_attestation: false,
        acknowledges_missing_delays: false,
        privacy_policy_accepted: false,
      }),
    );
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors)).toHaveLength(6);
  });

  it('should pass regardless of optional consent values', () => {
    const result = validateDeclarations(
      makeDeclarations({
        medical_emergency_consent: false,
        communications_consent: false,
        marketing_consent: false,
        digital_platform_consent: false,
      }),
    );
    expect(result.valid).toBe(true);
  });
});

describe('validateForSubmission', () => {
  function makeFullValidSubmission() {
    return {
      studentDetails: makeStudentDetails(),
      academicDetails: makeAcademicDetails(),
      guardians: [makeGuardian()],
      identityDetails: makeIdentityDetails(),
      medicalDetails: makeMedicalDetails(),
      declarations: makeDeclarations(),
      documents: [
        makeDocument({ document_type: 'student_photo', status: 'uploaded' }),
        makeDocument({
          id: 'doc-2',
          document_type: 'student_passport',
          status: 'uploaded',
        }),
        makeDocument({
          id: 'doc-3',
          document_type: 'birth_certificate',
          status: 'uploaded',
        }),
      ],
    };
  }

  it('should pass with a full valid application', () => {
    const result = validateForSubmission(makeFullValidSubmission());
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should fail when required documents are missing', () => {
    const params = makeFullValidSubmission();
    params.documents = []; // No documents at all
    const result = validateForSubmission(params);
    expect(result.valid).toBe(false);
    expect(result.errors['documents.student_photo']).toBeDefined();
    expect(result.errors['documents.student_passport']).toBeDefined();
    expect(result.errors['documents.birth_certificate']).toBeDefined();
  });

  it('should fail when student details are invalid', () => {
    const params = makeFullValidSubmission();
    params.studentDetails = makeStudentDetails({ full_name_en: null });
    const result = validateForSubmission(params);
    expect(result.valid).toBe(false);
    expect(result.errors['student.full_name_en']).toBeDefined();
  });

  it('should fail when academic details are invalid', () => {
    const params = makeFullValidSubmission();
    params.academicDetails = makeAcademicDetails({ enrollment_type: null });
    const result = validateForSubmission(params);
    expect(result.valid).toBe(false);
    expect(result.errors['academic.enrollment_type']).toBeDefined();
  });

  it('should fail when declarations are incomplete', () => {
    const params = makeFullValidSubmission();
    params.declarations = makeDeclarations({ info_correct: false });
    const result = validateForSubmission(params);
    expect(result.valid).toBe(false);
    expect(result.errors['declarations.info_correct']).toBeDefined();
  });

  it('should not count rejected documents as uploaded', () => {
    const params = makeFullValidSubmission();
    params.documents = [
      makeDocument({ document_type: 'student_photo', status: 'uploaded' }),
      makeDocument({
        id: 'doc-2',
        document_type: 'student_passport',
        status: 'rejected',
      }),
      makeDocument({
        id: 'doc-3',
        document_type: 'birth_certificate',
        status: 'uploaded',
      }),
    ];
    const result = validateForSubmission(params);
    expect(result.valid).toBe(false);
    expect(result.errors['documents.student_passport']).toBeDefined();
  });

  it('should not count missing documents as uploaded', () => {
    const params = makeFullValidSubmission();
    params.documents = [
      makeDocument({ document_type: 'student_photo', status: 'uploaded' }),
      makeDocument({
        id: 'doc-2',
        document_type: 'student_passport',
        status: 'missing',
      }),
      makeDocument({
        id: 'doc-3',
        document_type: 'birth_certificate',
        status: 'uploaded',
      }),
    ];
    const result = validateForSubmission(params);
    expect(result.valid).toBe(false);
    expect(result.errors['documents.student_passport']).toBeDefined();
  });

  it('should aggregate errors from all step validations', () => {
    const result = validateForSubmission({
      studentDetails: null,
      academicDetails: null,
      guardians: null,
      identityDetails: null,
      medicalDetails: null,
      declarations: null,
      documents: [],
    });
    expect(result.valid).toBe(false);
    // Should have errors from student, academic, guardian, identity, medical, declarations, and documents
    const errorKeys = Object.keys(result.errors);
    expect(errorKeys.some((k) => k.startsWith('student.'))).toBe(true);
    expect(errorKeys.some((k) => k.startsWith('academic.'))).toBe(true);
    expect(errorKeys.some((k) => k.startsWith('guardian.'))).toBe(true);
    expect(errorKeys.some((k) => k.startsWith('identity.'))).toBe(true);
    expect(errorKeys.some((k) => k.startsWith('medical.'))).toBe(true);
    expect(errorKeys.some((k) => k.startsWith('declarations.'))).toBe(true);
    expect(errorKeys.some((k) => k.startsWith('documents.'))).toBe(true);
  });

  it('should accept verified and pending_review documents', () => {
    const params = makeFullValidSubmission();
    params.documents = [
      makeDocument({ document_type: 'student_photo', status: 'verified' }),
      makeDocument({
        id: 'doc-2',
        document_type: 'student_passport',
        status: 'pending_review',
      }),
      makeDocument({
        id: 'doc-3',
        document_type: 'birth_certificate',
        status: 'uploaded',
      }),
    ];
    const result = validateForSubmission(params);
    expect(result.valid).toBe(true);
  });
});
