// ============================================================
// Document Requirement Engine Tests
// Tests: getRequiredDocuments — dynamic document requirements
// based on enrollment type, grade level, residency, medical, etc.
// ============================================================

import { getRequiredDocuments } from '@/lib/enrollment/document-rules';

import type {
  EnrollmentAcademicDetails,
  EnrollmentIdentityDetails,
  EnrollmentGuardianDetails,
  EnrollmentMedicalDetails,
  EnrollmentDocType,
} from '@/types/enrollment';

// ── Helpers ──────────────────────────────────────────────────

const baseTimestamps = {
  id: 'test-id',
  application_id: 'app-1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

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

function makeGuardian(
  overrides: Partial<EnrollmentGuardianDetails> = {},
): EnrollmentGuardianDetails {
  return {
    ...baseTimestamps,
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
    ...overrides,
  };
}

function makeMedical(
  overrides: Partial<EnrollmentMedicalDetails> = {},
): Partial<EnrollmentMedicalDetails> {
  return {
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

function getDocTypes(
  results: ReturnType<typeof getRequiredDocuments>,
  filter: 'required' | 'all' = 'required',
): EnrollmentDocType[] {
  if (filter === 'required') {
    return results.filter((r) => r.isRequired).map((r) => r.docType);
  }
  return results.map((r) => r.docType);
}

// ── Tests ────────────────────────────────────────────────────

describe('getRequiredDocuments', () => {
  describe('base documents (always required)', () => {
    it('should always require student_photo, student_passport, birth_certificate, vaccination_record, parent_emirates_id, parent_passport', () => {
      const results = getRequiredDocuments(
        makeAcademic(),
        makeIdentity(),
        [makeGuardian()],
        makeMedical(),
      );

      const requiredTypes = getDocTypes(results);
      expect(requiredTypes).toContain('student_photo');
      expect(requiredTypes).toContain('student_passport');
      expect(requiredTypes).toContain('birth_certificate');
      expect(requiredTypes).toContain('vaccination_record');
      expect(requiredTypes).toContain('parent_emirates_id');
      expect(requiredTypes).toContain('parent_passport');
    });

    it('should mark base documents as not conditional', () => {
      const results = getRequiredDocuments(
        makeAcademic(),
        makeIdentity(),
        [makeGuardian()],
        makeMedical(),
      );

      const baseDocTypes: EnrollmentDocType[] = [
        'student_photo',
        'student_passport',
        'birth_certificate',
        'vaccination_record',
        'parent_emirates_id',
        'parent_passport',
      ];

      for (const docType of baseDocTypes) {
        const doc = results.find((r) => r.docType === docType);
        expect(doc).toBeDefined();
        expect(doc!.isConditional).toBe(false);
        expect(doc!.isRequired).toBe(true);
      }
    });
  });

  describe('transfer enrollment documents', () => {
    it('should require last_report_card for transfer enrollment', () => {
      const results = getRequiredDocuments(
        makeAcademic({ enrollment_type: 'transfer', applying_grade_name: 'Grade 3' }),
        makeIdentity(),
        [makeGuardian()],
        makeMedical(),
      );

      const requiredTypes = getDocTypes(results);
      expect(requiredTypes).toContain('last_report_card');
    });

    it('should require academic_transcript for Grade 2+ transfer', () => {
      const results = getRequiredDocuments(
        makeAcademic({ enrollment_type: 'transfer', applying_grade_name: 'Grade 5' }),
        makeIdentity(),
        [makeGuardian()],
        makeMedical(),
      );

      const requiredTypes = getDocTypes(results);
      expect(requiredTypes).toContain('academic_transcript');
    });

    it('should require transfer_certificate for Grade 2+ transfer', () => {
      const results = getRequiredDocuments(
        makeAcademic({ enrollment_type: 'transfer', applying_grade_name: 'Grade 2' }),
        makeIdentity(),
        [makeGuardian()],
        makeMedical(),
      );

      const requiredTypes = getDocTypes(results);
      expect(requiredTypes).toContain('transfer_certificate');
    });

    it('should NOT require transfer_certificate for KG transfer', () => {
      const results = getRequiredDocuments(
        makeAcademic({ enrollment_type: 'transfer', applying_grade_name: 'KG2' }),
        makeIdentity(),
        [makeGuardian()],
        makeMedical(),
      );

      const tc = results.find((r) => r.docType === 'transfer_certificate');
      expect(tc).toBeDefined();
      expect(tc!.isRequired).toBe(false);
    });

    it('should NOT require academic_transcript for Grade 1 transfer', () => {
      const results = getRequiredDocuments(
        makeAcademic({ enrollment_type: 'transfer', applying_grade_name: 'Grade 1' }),
        makeIdentity(),
        [makeGuardian()],
        makeMedical(),
      );

      const transcript = results.find((r) => r.docType === 'academic_transcript');
      expect(transcript).toBeDefined();
      expect(transcript!.isRequired).toBe(false);
    });

    it('should NOT require transfer documents for new enrollment', () => {
      const results = getRequiredDocuments(
        makeAcademic({ enrollment_type: 'new' }),
        makeIdentity(),
        [makeGuardian()],
        makeMedical(),
      );

      const requiredTypes = getDocTypes(results);
      expect(requiredTypes).not.toContain('last_report_card');
      expect(requiredTypes).not.toContain('academic_transcript');
      expect(requiredTypes).not.toContain('transfer_certificate');
    });
  });

  describe('Emirates ID document', () => {
    it('should require student_emirates_id when emirates_id_available is true', () => {
      const results = getRequiredDocuments(
        makeAcademic(),
        makeIdentity({ emirates_id_available: true }),
        [makeGuardian()],
        makeMedical(),
      );

      const eid = results.find((r) => r.docType === 'student_emirates_id');
      expect(eid).toBeDefined();
      expect(eid!.isRequired).toBe(true);
    });

    it('should NOT require student_emirates_id when emirates_id_available is false', () => {
      const results = getRequiredDocuments(
        makeAcademic(),
        makeIdentity({ emirates_id_available: false }),
        [makeGuardian()],
        makeMedical(),
      );

      const eid = results.find((r) => r.docType === 'student_emirates_id');
      expect(eid).toBeDefined();
      expect(eid!.isRequired).toBe(false);
    });
  });

  describe('UAE residency documents', () => {
    it('should require student_visa and parent_visa when residing in UAE', () => {
      const results = getRequiredDocuments(
        makeAcademic(),
        makeIdentity({ country_of_residence: 'UAE' }),
        [makeGuardian()],
        makeMedical(),
      );

      const requiredTypes = getDocTypes(results);
      expect(requiredTypes).toContain('student_visa');
      expect(requiredTypes).toContain('parent_visa');
    });

    it('should require visa documents when country is "United Arab Emirates"', () => {
      const results = getRequiredDocuments(
        makeAcademic(),
        makeIdentity({ country_of_residence: 'United Arab Emirates' }),
        [makeGuardian()],
        makeMedical(),
      );

      const requiredTypes = getDocTypes(results);
      expect(requiredTypes).toContain('student_visa');
      expect(requiredTypes).toContain('parent_visa');
    });

    it('should require visa documents when residence_visa_number is provided', () => {
      const results = getRequiredDocuments(
        makeAcademic(),
        makeIdentity({ residence_visa_number: 'VISA-12345', country_of_residence: 'Egypt' }),
        [makeGuardian()],
        makeMedical(),
      );

      const requiredTypes = getDocTypes(results);
      expect(requiredTypes).toContain('student_visa');
      expect(requiredTypes).toContain('parent_visa');
    });

    it('should NOT require visa documents when not residing in UAE', () => {
      const results = getRequiredDocuments(
        makeAcademic(),
        makeIdentity({ country_of_residence: 'Egypt', residence_visa_number: null }),
        [makeGuardian()],
        makeMedical(),
      );

      const studentVisa = results.find((r) => r.docType === 'student_visa');
      const parentVisa = results.find((r) => r.docType === 'parent_visa');
      expect(studentVisa!.isRequired).toBe(false);
      expect(parentVisa!.isRequired).toBe(false);
    });
  });

  describe('medical condition documents', () => {
    it('should require medical_report when has_medical_condition is true', () => {
      const results = getRequiredDocuments(
        makeAcademic(),
        makeIdentity(),
        [makeGuardian()],
        makeMedical({ has_medical_condition: true }),
      );

      const medDoc = results.find((r) => r.docType === 'medical_report');
      expect(medDoc).toBeDefined();
      expect(medDoc!.isRequired).toBe(true);
    });

    it('should NOT require medical_report when has_medical_condition is false', () => {
      const results = getRequiredDocuments(
        makeAcademic(),
        makeIdentity(),
        [makeGuardian()],
        makeMedical({ has_medical_condition: false }),
      );

      const medDoc = results.find((r) => r.docType === 'medical_report');
      expect(medDoc).toBeDefined();
      expect(medDoc!.isRequired).toBe(false);
    });
  });

  describe('SEN documents', () => {
    it('should require sen_support_document when has_sen is true', () => {
      const results = getRequiredDocuments(
        makeAcademic(),
        makeIdentity(),
        [makeGuardian()],
        makeMedical({ has_sen: true }),
      );

      const senDoc = results.find((r) => r.docType === 'sen_support_document');
      expect(senDoc).toBeDefined();
      expect(senDoc!.isRequired).toBe(true);
    });

    it('should NOT require sen_support_document when has_sen is false', () => {
      const results = getRequiredDocuments(
        makeAcademic(),
        makeIdentity(),
        [makeGuardian()],
        makeMedical({ has_sen: false }),
      );

      const senDoc = results.find((r) => r.docType === 'sen_support_document');
      expect(senDoc).toBeDefined();
      expect(senDoc!.isRequired).toBe(false);
    });
  });

  describe('custody / guardianship documents', () => {
    it('should require custody_guardianship_document when custody_case is true', () => {
      const results = getRequiredDocuments(
        makeAcademic(),
        makeIdentity(),
        [makeGuardian({ custody_case: true })],
        makeMedical(),
      );

      const custodyDoc = results.find((r) => r.docType === 'custody_guardianship_document');
      expect(custodyDoc).toBeDefined();
      expect(custodyDoc!.isRequired).toBe(true);
    });

    it('should require custody_guardianship_document when is_legal_guardian is true', () => {
      const results = getRequiredDocuments(
        makeAcademic(),
        makeIdentity(),
        [makeGuardian({ is_legal_guardian: true })],
        makeMedical(),
      );

      const custodyDoc = results.find((r) => r.docType === 'custody_guardianship_document');
      expect(custodyDoc).toBeDefined();
      expect(custodyDoc!.isRequired).toBe(true);
    });

    it('should NOT require custody_guardianship_document when no custody case', () => {
      const results = getRequiredDocuments(
        makeAcademic(),
        makeIdentity(),
        [makeGuardian({ custody_case: false, is_legal_guardian: false })],
        makeMedical(),
      );

      const custodyDoc = results.find((r) => r.docType === 'custody_guardianship_document');
      expect(custodyDoc).toBeDefined();
      expect(custodyDoc!.isRequired).toBe(false);
    });
  });

  describe('undertaking letter', () => {
    it('should never be auto-required (admin policy)', () => {
      const results = getRequiredDocuments(
        makeAcademic({ enrollment_type: 'transfer', applying_grade_name: 'Grade 10' }),
        makeIdentity({ emirates_id_available: true, country_of_residence: 'UAE' }),
        [makeGuardian({ custody_case: true })],
        makeMedical({ has_medical_condition: true, has_sen: true }),
      );

      const undertaking = results.find((r) => r.docType === 'undertaking_letter');
      expect(undertaking).toBeDefined();
      expect(undertaking!.isRequired).toBe(false);
    });
  });

  describe('combined scenarios', () => {
    it('should require all conditional documents for a complex transfer scenario', () => {
      const results = getRequiredDocuments(
        makeAcademic({ enrollment_type: 'transfer', applying_grade_name: 'Grade 8' }),
        makeIdentity({ emirates_id_available: true, country_of_residence: 'UAE' }),
        [makeGuardian({ custody_case: true })],
        makeMedical({ has_medical_condition: true, has_sen: true }),
      );

      const requiredTypes = getDocTypes(results);

      // Base docs
      expect(requiredTypes).toContain('student_photo');
      expect(requiredTypes).toContain('student_passport');
      expect(requiredTypes).toContain('birth_certificate');
      // Transfer docs
      expect(requiredTypes).toContain('last_report_card');
      expect(requiredTypes).toContain('academic_transcript');
      expect(requiredTypes).toContain('transfer_certificate');
      // Emirates ID
      expect(requiredTypes).toContain('student_emirates_id');
      // UAE residency
      expect(requiredTypes).toContain('student_visa');
      expect(requiredTypes).toContain('parent_visa');
      // Medical + SEN
      expect(requiredTypes).toContain('medical_report');
      expect(requiredTypes).toContain('sen_support_document');
      // Custody
      expect(requiredTypes).toContain('custody_guardianship_document');
    });

    it('should produce minimal required docs for a simple new enrollment', () => {
      const results = getRequiredDocuments(
        makeAcademic({ enrollment_type: 'new' }),
        makeIdentity({ emirates_id_available: false, country_of_residence: 'Egypt' }),
        [makeGuardian()],
        makeMedical(),
      );

      const requiredTypes = getDocTypes(results);

      // Only base docs should be required
      expect(requiredTypes).toContain('student_photo');
      expect(requiredTypes).toContain('student_passport');
      expect(requiredTypes).toContain('birth_certificate');
      expect(requiredTypes).toContain('vaccination_record');
      expect(requiredTypes).toContain('parent_emirates_id');
      expect(requiredTypes).toContain('parent_passport');

      // Nothing conditional should be required
      expect(requiredTypes).not.toContain('student_emirates_id');
      expect(requiredTypes).not.toContain('last_report_card');
      expect(requiredTypes).not.toContain('transfer_certificate');
      expect(requiredTypes).not.toContain('medical_report');
      expect(requiredTypes).not.toContain('sen_support_document');
      expect(requiredTypes).not.toContain('custody_guardianship_document');
    });
  });

  describe('null safety', () => {
    it('should handle null academic details without crashing', () => {
      const results = getRequiredDocuments(null, null, null, null);
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);

      // Base docs should still be required
      const requiredTypes = getDocTypes(results);
      expect(requiredTypes).toContain('student_photo');
      expect(requiredTypes).toContain('student_passport');
    });
  });
});
