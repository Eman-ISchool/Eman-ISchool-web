// ──────────────────────────────────────────────────────────────
// Dynamic document requirement engine
// Determines which documents are required based on application context
// ──────────────────────────────────────────────────────────────

import type {
  EnrollmentAcademicDetails,
  EnrollmentIdentityDetails,
  EnrollmentGuardianDetails,
  EnrollmentMedicalDetails,
  EnrollmentDocType,
  DocumentRequirement,
  DocumentConditionContext,
} from '@/types/enrollment';

// ── Helpers ──────────────────────────────────────────────────

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
  const bareNum = parseInt(lower, 10);
  return isNaN(bareNum) ? -1 : bareNum;
}

// ── Document rule definitions ────────────────────────────────

const DOCUMENT_RULES: DocumentRequirement[] = [
  // Always required
  {
    document_type: 'student_photo',
    label_en: 'Student Photo',
    label_ar: 'صورة الطالب',
    is_always_required: true,
  },
  {
    document_type: 'student_passport',
    label_en: 'Student Passport',
    label_ar: 'جواز سفر الطالب',
    is_always_required: true,
  },
  {
    document_type: 'birth_certificate',
    label_en: 'Birth Certificate',
    label_ar: 'شهادة الميلاد',
    is_always_required: true,
  },
  {
    document_type: 'vaccination_record',
    label_en: 'Vaccination Record',
    label_ar: 'سجل التطعيمات',
    is_always_required: true,
  },
  {
    document_type: 'parent_emirates_id',
    label_en: 'Parent Emirates ID',
    label_ar: 'الهوية الإماراتية لولي الأمر',
    is_always_required: true,
  },
  {
    document_type: 'parent_passport',
    label_en: 'Parent Passport',
    label_ar: 'جواز سفر ولي الأمر',
    is_always_required: true,
  },

  // Conditionally required
  {
    document_type: 'student_emirates_id',
    label_en: 'Student Emirates ID',
    label_ar: 'الهوية الإماراتية للطالب',
    is_always_required: false,
    condition: (ctx) => {
      // Required if emirates_id_available is true (determined from identity details)
      // The context flag is set when building the context
      return ctx.enrollment_type !== null; // Placeholder — actual check done via identity details
    },
  },
  {
    document_type: 'last_report_card',
    label_en: 'Last Report Card',
    label_ar: 'آخر شهادة مدرسية',
    is_always_required: false,
    condition: (ctx) => ctx.enrollment_type === 'transfer',
  },
  {
    document_type: 'academic_transcript',
    label_en: 'Academic Transcript',
    label_ar: 'كشف الدرجات الأكاديمي',
    is_always_required: false,
    condition: (ctx) => ctx.enrollment_type === 'transfer',
    // Note: grade 2+ check is applied in getRequiredDocuments directly
  },
  {
    document_type: 'transfer_certificate',
    label_en: 'Transfer Certificate',
    label_ar: 'شهادة الانتقال',
    is_always_required: false,
    condition: (ctx) => ctx.enrollment_type === 'transfer',
    // Note: grade 2+ check is applied in getRequiredDocuments directly
  },
  {
    document_type: 'student_visa',
    label_en: 'Student Visa / Residence Permit',
    label_ar: 'تأشيرة / إقامة الطالب',
    is_always_required: false,
    condition: (_ctx) => true, // Checked via residency details below
  },
  {
    document_type: 'parent_visa',
    label_en: 'Parent Visa / Residence Permit',
    label_ar: 'تأشيرة / إقامة ولي الأمر',
    is_always_required: false,
    condition: (_ctx) => true, // Checked via residency details below
  },
  {
    document_type: 'medical_report',
    label_en: 'Medical Report',
    label_ar: 'تقرير طبي',
    is_always_required: false,
    condition: (ctx) => ctx.has_medical_condition,
  },
  {
    document_type: 'sen_support_document',
    label_en: 'SEN / Special Needs Support Document',
    label_ar: 'وثيقة دعم ذوي الاحتياجات الخاصة',
    is_always_required: false,
    condition: (ctx) => ctx.has_sen,
  },
  {
    document_type: 'custody_guardianship_document',
    label_en: 'Custody / Guardianship Document',
    label_ar: 'وثيقة الحضانة / الوصاية',
    is_always_required: false,
    condition: (ctx) => ctx.custody_case,
  },
  {
    document_type: 'undertaking_letter',
    label_en: 'Undertaking Letter',
    label_ar: 'خطاب تعهد',
    is_always_required: false,
    condition: (_ctx) => false, // Conditional on admin policy — not auto-required
  },
];

// ── Public API ───────────────────────────────────────────────

/**
 * Build a DocumentConditionContext from the individual detail records.
 */
function buildContext(
  academicDetails: Partial<EnrollmentAcademicDetails> | null,
  identityDetails: Partial<EnrollmentIdentityDetails> | null,
  guardianDetails: EnrollmentGuardianDetails[] | null,
  medicalDetails: Partial<EnrollmentMedicalDetails> | null,
): DocumentConditionContext {
  const hasCustodyCase =
    guardianDetails?.some((g) => g.custody_case || g.is_legal_guardian) ?? false;

  return {
    enrollment_type: academicDetails?.enrollment_type ?? null,
    transfer_source: academicDetails?.transfer_source ?? null,
    nationality: null, // Populated from student details if needed
    has_medical_condition: medicalDetails?.has_medical_condition ?? false,
    has_sen: medicalDetails?.has_sen ?? false,
    custody_case: hasCustodyCase,
  };
}

export interface DocumentRequirementResult {
  docType: EnrollmentDocType;
  label: string;
  isRequired: boolean;
  isConditional: boolean;
  conditionDescription?: string;
}

/**
 * Returns the list of document requirements for the given application context.
 *
 * Each requirement indicates whether it is required (always or conditionally)
 * and provides a human-readable condition description when conditional.
 */
export function getRequiredDocuments(
  academicDetails: Partial<EnrollmentAcademicDetails> | null,
  identityDetails: Partial<EnrollmentIdentityDetails> | null,
  guardianDetails: EnrollmentGuardianDetails[] | null,
  medicalDetails: Partial<EnrollmentMedicalDetails> | null,
): DocumentRequirementResult[] {
  const ctx = buildContext(academicDetails, identityDetails, guardianDetails, medicalDetails);
  const gradeLevel = parseGradeLevel(academicDetails?.applying_grade_name);
  const isTransfer = academicDetails?.enrollment_type === 'transfer';
  const emiratesIdAvailable = identityDetails?.emirates_id_available ?? false;
  const residingInUAE =
    identityDetails?.country_of_residence?.toLowerCase() === 'uae' ||
    identityDetails?.country_of_residence?.toLowerCase() === 'united arab emirates' ||
    !!identityDetails?.residence_visa_number;

  const results: DocumentRequirementResult[] = [];

  for (const rule of DOCUMENT_RULES) {
    let isRequired: boolean;
    let conditionDescription: string | undefined;

    if (rule.is_always_required) {
      isRequired = true;
    } else {
      // Apply special per-type logic
      switch (rule.document_type) {
        case 'student_emirates_id':
          isRequired = emiratesIdAvailable;
          conditionDescription = 'Required when Emirates ID is available';
          break;

        case 'academic_transcript':
          isRequired = isTransfer && gradeLevel >= 2;
          conditionDescription = 'Required for transfer students in Grade 2 and above';
          break;

        case 'transfer_certificate':
          isRequired = isTransfer && gradeLevel >= 2;
          conditionDescription = 'Required for transfer students in Grade 2 and above';
          break;

        case 'last_report_card':
          isRequired = isTransfer;
          conditionDescription = 'Required for transfer students';
          break;

        case 'student_visa':
          isRequired = residingInUAE;
          conditionDescription = 'Required if student is residing in the UAE';
          break;

        case 'parent_visa':
          isRequired = residingInUAE;
          conditionDescription = 'Required if parent is residing in the UAE';
          break;

        case 'medical_report':
          isRequired = ctx.has_medical_condition;
          conditionDescription = 'Required if student has a medical condition';
          break;

        case 'sen_support_document':
          isRequired = ctx.has_sen;
          conditionDescription = 'Required if student has special educational needs';
          break;

        case 'custody_guardianship_document':
          isRequired = ctx.custody_case;
          conditionDescription = 'Required if there is a custody case or legal guardian arrangement';
          break;

        case 'undertaking_letter':
          isRequired = false; // Conditional on admin policy
          conditionDescription = 'Required at the discretion of administration';
          break;

        default:
          isRequired = rule.condition ? rule.condition(ctx) : false;
          break;
      }
    }

    results.push({
      docType: rule.document_type,
      label: rule.label_en,
      isRequired,
      isConditional: !rule.is_always_required,
      conditionDescription,
    });
  }

  return results;
}
