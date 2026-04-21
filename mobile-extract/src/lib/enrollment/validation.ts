// ──────────────────────────────────────────────────────────────
// Server-side validation for each enrollment wizard step
// ──────────────────────────────────────────────────────────────

import type {
  EnrollmentStudentDetails,
  EnrollmentAcademicDetails,
  EnrollmentGuardianDetails,
  EnrollmentIdentityDetails,
  EnrollmentMedicalDetails,
  EnrollmentDeclarations,
  EnrollmentDocument,
} from '@/types/enrollment';

// ── Result type ──────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// ── Regex patterns ───────────────────────────────────────────

/** English letters, spaces, hyphens, apostrophes */
const ENGLISH_NAME_RE = /^[A-Za-z\s\-']+$/;

/** Arabic letters, spaces, common diacritics */
const ARABIC_NAME_RE = /^[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\s\-']+$/;

/** UAE Emirates ID format: 784-YYYY-NNNNNNN-C */
const EMIRATES_ID_RE = /^784-\d{4}-\d{7}-\d$/;

// ── Helpers ──────────────────────────────────────────────────

function isPastDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  return d < new Date();
}

/**
 * Extract a numeric grade level from the grade name string.
 * Returns 0 for KG / FS / pre-school names, or the numeric grade (1-12).
 * Returns -1 if the pattern is unrecognised.
 */
function parseGradeLevel(gradeName: string | null | undefined): number {
  if (!gradeName) return -1;
  const lower = gradeName.toLowerCase().trim();
  if (lower.startsWith('kg') || lower.startsWith('fs') || lower.includes('pre-school')) {
    return 0;
  }
  const match = lower.match(/grade\s*(\d+)/i);
  if (match) return parseInt(match[1], 10);
  // Attempt bare number
  const bareNum = parseInt(lower, 10);
  return isNaN(bareNum) ? -1 : bareNum;
}

// ── Step 1: Student Details ──────────────────────────────────

export function validateStudentDetails(
  data: Partial<EnrollmentStudentDetails> | null,
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data) {
    return { valid: false, errors: { _form: 'Student details are required' } };
  }

  // English name
  if (!data.full_name_en || !data.full_name_en.trim()) {
    errors.full_name_en = 'English name is required';
  } else if (!ENGLISH_NAME_RE.test(data.full_name_en.trim())) {
    errors.full_name_en = 'English name must contain only English letters and spaces';
  }

  // Arabic name
  if (!data.full_name_ar || !data.full_name_ar.trim()) {
    errors.full_name_ar = 'Arabic name is required';
  } else if (!ARABIC_NAME_RE.test(data.full_name_ar.trim())) {
    errors.full_name_ar = 'Arabic name must contain only Arabic letters and spaces';
  }

  // Date of birth
  if (!data.date_of_birth) {
    errors.date_of_birth = 'Date of birth is required';
  } else if (!isPastDate(data.date_of_birth)) {
    errors.date_of_birth = 'Date of birth must be a valid past date';
  }

  // Gender
  if (!data.gender) {
    errors.gender = 'Gender is required';
  }

  // Nationality
  if (!data.nationality) {
    errors.nationality = 'Nationality is required';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// ── Step 2: Academic Details ─────────────────────────────────

export function validateAcademicDetails(
  data: Partial<EnrollmentAcademicDetails> | null,
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data) {
    return { valid: false, errors: { _form: 'Academic details are required' } };
  }

  if (!data.enrollment_type) {
    errors.enrollment_type = 'Enrollment type is required';
  }

  if (!data.applying_grade_id && !data.applying_grade_name) {
    errors.applying_grade_id = 'Grade is required';
  }

  if (!data.academic_year) {
    errors.academic_year = 'Academic year is required';
  }

  // Transfer-specific validation
  if (data.enrollment_type === 'transfer') {
    if (!data.previous_school_name || !data.previous_school_name.trim()) {
      errors.previous_school_name = 'Previous school name is required for transfers';
    }
    if (!data.previous_school_country || !data.previous_school_country.trim()) {
      errors.previous_school_country = 'Previous school country is required for transfers';
    }

    // Grade 2+ transfers require transfer certificate
    const gradeLevel = parseGradeLevel(data.applying_grade_name);
    if (gradeLevel >= 2 && !data.transfer_certificate_available) {
      errors.transfer_certificate_available =
        'Transfer certificate is required for Grade 2 and above';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// ── Step 3: Guardian Details ─────────────────────────────────

export function validateGuardianDetails(
  guardians: EnrollmentGuardianDetails[] | null,
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!guardians || guardians.length === 0) {
    return { valid: false, errors: { _form: 'At least one guardian contact is required' } };
  }

  // Must have a primary contact
  const primary = guardians.find((g) => g.contact_type === 'primary');
  if (!primary) {
    errors._primary = 'A primary contact is required';
    // Validate the first guardian as if it were primary
    const first = guardians[0];
    validateSingleGuardian(first, errors, 'contacts[0]');
  } else {
    validateSingleGuardian(primary, errors, 'primary');
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function validateSingleGuardian(
  g: EnrollmentGuardianDetails,
  errors: Record<string, string>,
  prefix: string,
): void {
  if (!g.full_name_en || !g.full_name_en.trim()) {
    errors[`${prefix}.full_name_en`] = 'Guardian name is required';
  }

  if (!g.mobile || !g.mobile.trim()) {
    errors[`${prefix}.mobile`] = 'Mobile number is required';
  }

  if (!g.email || !g.email.trim()) {
    errors[`${prefix}.email`] = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g.email.trim())) {
    errors[`${prefix}.email`] = 'A valid email address is required';
  }

  if (!g.relationship) {
    errors[`${prefix}.relationship`] = 'Relationship is required';
  }
}

// ── Step 4: Identity Details ─────────────────────────────────

export function validateIdentityDetails(
  data: Partial<EnrollmentIdentityDetails> | null,
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data) {
    return { valid: false, errors: { _form: 'Identity details are required' } };
  }

  // Must have either passport or Emirates ID
  const hasPassport = !!data.student_passport_number?.trim();
  const hasEmiratesId = data.emirates_id_available && !!data.emirates_id_number?.trim();

  if (!hasPassport && !hasEmiratesId) {
    errors._identity = 'Either a passport number or Emirates ID is required';
  }

  // Validate Emirates ID format if provided
  if (data.emirates_id_available && data.emirates_id_number?.trim()) {
    if (!EMIRATES_ID_RE.test(data.emirates_id_number.trim())) {
      errors.emirates_id_number =
        'Emirates ID must follow the format 784-YYYY-NNNNNNN-C';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// ── Step 5: Medical Details ──────────────────────────────────

export function validateMedicalDetails(
  data: Partial<EnrollmentMedicalDetails> | null,
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data) {
    return { valid: false, errors: { _form: 'Medical details are required' } };
  }

  // If medical condition flag is set, details are required
  if (data.has_medical_condition && !data.medical_condition_details?.trim()) {
    errors.medical_condition_details =
      'Medical condition details are required when a condition is indicated';
  }

  // If SEN flag is set, details are required
  if (data.has_sen && !data.sen_details?.trim()) {
    errors.sen_details =
      'SEN details are required when special educational needs are indicated';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// ── Step 7: Declarations ─────────────────────────────────────

export function validateDeclarations(
  data: Partial<EnrollmentDeclarations> | null,
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data) {
    return { valid: false, errors: { _form: 'Declarations are required' } };
  }

  const requiredDeclarations: Array<{
    key: keyof EnrollmentDeclarations;
    message: string;
  }> = [
    { key: 'info_correct', message: 'You must confirm that the information provided is correct' },
    { key: 'docs_authentic', message: 'You must confirm that documents are authentic' },
    { key: 'accepts_verification', message: 'You must accept the verification terms' },
    { key: 'acknowledges_attestation', message: 'You must acknowledge the attestation requirement' },
    { key: 'acknowledges_missing_delays', message: 'You must acknowledge potential delays for missing documents' },
    { key: 'privacy_policy_accepted', message: 'You must accept the privacy policy' },
  ];

  for (const decl of requiredDeclarations) {
    if (!data[decl.key]) {
      errors[decl.key] = decl.message;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// ── Full submission validation ───────────────────────────────

/**
 * Validates that the entire application is ready for submission.
 * Checks all steps plus minimum required documents.
 */
export function validateForSubmission(params: {
  studentDetails: Partial<EnrollmentStudentDetails> | null;
  academicDetails: Partial<EnrollmentAcademicDetails> | null;
  guardians: EnrollmentGuardianDetails[] | null;
  identityDetails: Partial<EnrollmentIdentityDetails> | null;
  medicalDetails: Partial<EnrollmentMedicalDetails> | null;
  declarations: Partial<EnrollmentDeclarations> | null;
  documents: EnrollmentDocument[];
}): ValidationResult {
  const errors: Record<string, string> = {};

  // Validate each step
  const studentResult = validateStudentDetails(params.studentDetails);
  const academicResult = validateAcademicDetails(params.academicDetails);
  const guardianResult = validateGuardianDetails(params.guardians);
  const identityResult = validateIdentityDetails(params.identityDetails);
  const medicalResult = validateMedicalDetails(params.medicalDetails);
  const declarationResult = validateDeclarations(params.declarations);

  // Merge errors from all steps with prefixed keys
  const stepResults = [
    { prefix: 'student', result: studentResult },
    { prefix: 'academic', result: academicResult },
    { prefix: 'guardian', result: guardianResult },
    { prefix: 'identity', result: identityResult },
    { prefix: 'medical', result: medicalResult },
    { prefix: 'declarations', result: declarationResult },
  ];

  for (const { prefix, result } of stepResults) {
    if (!result.valid) {
      for (const [key, value] of Object.entries(result.errors)) {
        errors[`${prefix}.${key}`] = value;
      }
    }
  }

  // Minimum required documents check
  const MINIMUM_REQUIRED_DOC_TYPES = [
    'student_photo',
    'student_passport',
    'birth_certificate',
  ] as const;

  const uploadedDocTypes = new Set(
    params.documents
      .filter((d) => d.status !== 'missing' && d.status !== 'rejected')
      .map((d) => d.document_type),
  );

  for (const docType of MINIMUM_REQUIRED_DOC_TYPES) {
    if (!uploadedDocTypes.has(docType)) {
      errors[`documents.${docType}`] = `Required document missing: ${docType.replace(/_/g, ' ')}`;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
