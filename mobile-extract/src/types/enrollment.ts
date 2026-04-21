// ============================================================
// ENROLLMENT SYSTEM TYPES
// Mirrors: supabase/migrations/20260327_enrollment_system.sql
// ============================================================

// ------------------------------------------------------------
// 1. STATUS & TYPE ENUMS
// ------------------------------------------------------------

/** Application-level status (enrollment_app_status) */
export type EnrollmentAppStatus =
  | 'draft'
  | 'submitted'
  | 'incomplete'
  | 'pending_documents'
  | 'pending_verification'
  | 'under_review'
  | 'pending_attestation'
  | 'pending_translation'
  | 'awaiting_transfer_certificate'
  | 'action_required'
  | 'provisionally_accepted'
  | 'approved'
  | 'rejected'
  | 'enrollment_activated';

/** Document-level status (enrollment_doc_status) */
export type EnrollmentDocStatus =
  | 'missing'
  | 'uploaded'
  | 'pending_review'
  | 'verified'
  | 'rejected'
  | 'pending_attestation'
  | 'pending_translation'
  | 're_upload_requested'
  | 'expired';

/** Enrollment type (enrollment_type) */
export type EnrollmentType = 'new' | 'transfer';

/** Transfer source (transfer_source) */
export type TransferSource =
  | 'egypt'
  | 'another_uae_emirate'
  | 'gcc_country'
  | 'outside_uae_gcc'
  | 'same_emirate';

/** Guardian relationship (guardian_relationship) */
export type GuardianRelationship =
  | 'father'
  | 'mother'
  | 'grandfather'
  | 'grandmother'
  | 'uncle'
  | 'aunt'
  | 'sibling'
  | 'legal_guardian'
  | 'other';

/** Document type (enrollment_doc_type) */
export type EnrollmentDocType =
  | 'student_photo'
  | 'student_passport'
  | 'student_emirates_id'
  | 'birth_certificate'
  | 'vaccination_record'
  | 'student_visa'
  | 'parent_emirates_id'
  | 'parent_passport'
  | 'parent_visa'
  | 'last_report_card'
  | 'academic_transcript'
  | 'transfer_certificate'
  | 'medical_report'
  | 'sen_support_document'
  | 'custody_guardianship_document'
  | 'translation_upload'
  | 'additional_supporting_document'
  | 'undertaking_letter';

// ------------------------------------------------------------
// 2. DATABASE ROW TYPES
// ------------------------------------------------------------

/** enrollment_applications_v2 */
export interface EnrollmentApplication {
  id: string;
  application_number: string;

  // ownership
  parent_user_id: string;
  academic_year: string;

  // status
  status: EnrollmentAppStatus;
  completeness_score: number;

  // wizard progress
  current_step: number;
  steps_completed: number[];

  // submission
  submitted_at: string | null;

  // review
  assigned_reviewer_id: string | null;
  reviewed_at: string | null;
  review_decision: string | null;

  // activation
  activated_at: string | null;
  linked_student_user_id: string | null;

  // metadata
  created_at: string;
  updated_at: string;
}

/** enrollment_student_details */
export interface EnrollmentStudentDetails {
  id: string;
  application_id: string;

  // names
  full_name_en: string | null;
  full_name_ar: string | null;

  // personal
  date_of_birth: string | null;
  gender: string | null;
  nationality: string | null;
  religion: string | null;
  mother_tongue: string | null;
  place_of_birth: string | null;
  secondary_nationality: string | null;
  preferred_language: string | null;

  created_at: string;
  updated_at: string;
}

/** enrollment_academic_details */
export interface EnrollmentAcademicDetails {
  id: string;
  application_id: string;

  enrollment_type: EnrollmentType | null;
  applying_grade_id: string | null;
  applying_grade_name: string | null;
  academic_year: string | null;
  curriculum: string | null;

  // transfer-specific
  previous_school_name: string | null;
  previous_school_country: string | null;
  previous_school_emirate: string | null;
  previous_grade_completed: string | null;
  is_mid_year_transfer: boolean;
  transfer_source: TransferSource | null;
  last_report_card_year: string | null;
  transcript_available: boolean;
  transfer_certificate_available: boolean;
  transfer_reason: string | null;

  created_at: string;
  updated_at: string;
}

/** enrollment_guardian_details */
export interface EnrollmentGuardianDetails {
  id: string;
  application_id: string;

  // contact type: primary, father, mother, guardian, emergency
  contact_type: string;

  relationship: GuardianRelationship | null;
  full_name_en: string | null;
  full_name_ar: string | null;
  mobile: string | null;
  email: string | null;

  // address
  uae_address: string | null;
  emirate: string | null;
  area_city_district: string | null;

  // identity
  emirates_id_number: string | null;
  passport_number: string | null;
  visa_number: string | null;

  // guardian-specific
  is_legal_guardian: boolean;
  custody_case: boolean;
  guardian_authorization_notes: string | null;

  created_at: string;
  updated_at: string;
}

/** enrollment_identity_details */
export interface EnrollmentIdentityDetails {
  id: string;
  application_id: string;

  // student identity
  emirates_id_available: boolean;
  emirates_id_number: string | null;
  student_passport_number: string | null;
  student_passport_expiry: string | null;
  residence_visa_number: string | null;
  residence_visa_expiry: string | null;
  residency_status: string | null;
  country_of_residence: string | null;

  created_at: string;
  updated_at: string;
}

/** enrollment_medical_details */
export interface EnrollmentMedicalDetails {
  id: string;
  application_id: string;

  has_medical_condition: boolean;
  medical_condition_details: string | null;
  has_sen: boolean;
  sen_details: string | null;
  vaccination_record_available: boolean;
  allergies: string | null;
  medication_notes: string | null;
  health_notes: string | null;

  created_at: string;
  updated_at: string;
}

/** enrollment_declarations */
export interface EnrollmentDeclarations {
  id: string;
  application_id: string;

  info_correct: boolean;
  docs_authentic: boolean;
  accepts_verification: boolean;
  acknowledges_attestation: boolean;
  acknowledges_missing_delays: boolean;
  privacy_policy_accepted: boolean;

  // optional
  medical_emergency_consent: boolean | null;
  communications_consent: boolean | null;
  marketing_consent: boolean | null;
  digital_platform_consent: boolean | null;

  declared_at: string | null;
  created_at: string;
  updated_at: string;
}

/** enrollment_documents */
export interface EnrollmentDocument {
  id: string;
  application_id: string;

  document_type: EnrollmentDocType;
  label: string | null;

  // requirement
  is_required: boolean;
  is_conditional: boolean;
  condition_rule: string | null;

  // file
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  file_mime_type: string | null;
  storage_path: string | null;

  // status
  status: EnrollmentDocStatus;

  // review
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;

  // attestation / translation
  issuing_country: string | null;
  document_language: string | null;
  attestation_required: boolean;
  attestation_status: string;
  translation_required: boolean;
  translation_status: string;

  // linked translation doc
  translation_document_id: string | null;

  // tracking
  upload_count: number;
  last_uploaded_at: string | null;
  expiry_date: string | null;

  created_at: string;
  updated_at: string;
}

/** enrollment_status_history */
export interface EnrollmentStatusHistory {
  id: string;
  application_id: string;

  previous_status: EnrollmentAppStatus | null;
  new_status: EnrollmentAppStatus;
  changed_by: string | null;
  reason: string | null;
  notes: string | null;

  created_at: string;
}

/** enrollment_review_notes */
export interface EnrollmentReviewNote {
  id: string;
  application_id: string;

  author_id: string;
  note_type: string;
  content: string;
  is_visible_to_parent: boolean;

  created_at: string;
}

/** student_onboarding_tasks */
export interface StudentOnboardingTask {
  id: string;
  application_id: string;
  student_user_id: string | null;

  task_key: string;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;

  is_required: boolean;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string | null;

  sort_order: number;
  due_date: string | null;

  created_at: string;
  updated_at: string;
}

/** enrollment_audit_log */
export interface EnrollmentAuditLog {
  id: string;
  application_id: string | null;
  document_id: string | null;

  actor_id: string | null;
  action: string;
  target_entity: string;
  target_id: string | null;

  previous_state: Record<string, unknown> | null;
  new_state: Record<string, unknown> | null;
  reason: string | null;

  created_at: string;
}

// ------------------------------------------------------------
// 3. INSERT / UPDATE TYPES
// ------------------------------------------------------------

/** Insert type for enrollment_applications_v2 */
export type EnrollmentApplicationInsert = Omit<
  EnrollmentApplication,
  'id' | 'application_number' | 'created_at' | 'updated_at'
> & {
  id?: string;
  application_number?: string;
};

/** Update type for enrollment_applications_v2 */
export type EnrollmentApplicationUpdate = Partial<
  Omit<EnrollmentApplication, 'id' | 'created_at' | 'updated_at'>
>;

/** Insert type for enrollment_student_details */
export type EnrollmentStudentDetailsInsert = Omit<
  EnrollmentStudentDetails,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string;
};

/** Update type for enrollment_student_details */
export type EnrollmentStudentDetailsUpdate = Partial<
  Omit<EnrollmentStudentDetails, 'id' | 'application_id' | 'created_at' | 'updated_at'>
>;

/** Insert type for enrollment_academic_details */
export type EnrollmentAcademicDetailsInsert = Omit<
  EnrollmentAcademicDetails,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string;
};

/** Update type for enrollment_academic_details */
export type EnrollmentAcademicDetailsUpdate = Partial<
  Omit<EnrollmentAcademicDetails, 'id' | 'application_id' | 'created_at' | 'updated_at'>
>;

/** Insert type for enrollment_guardian_details */
export type EnrollmentGuardianDetailsInsert = Omit<
  EnrollmentGuardianDetails,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string;
};

/** Update type for enrollment_guardian_details */
export type EnrollmentGuardianDetailsUpdate = Partial<
  Omit<EnrollmentGuardianDetails, 'id' | 'application_id' | 'created_at' | 'updated_at'>
>;

/** Insert type for enrollment_identity_details */
export type EnrollmentIdentityDetailsInsert = Omit<
  EnrollmentIdentityDetails,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string;
};

/** Update type for enrollment_identity_details */
export type EnrollmentIdentityDetailsUpdate = Partial<
  Omit<EnrollmentIdentityDetails, 'id' | 'application_id' | 'created_at' | 'updated_at'>
>;

/** Insert type for enrollment_medical_details */
export type EnrollmentMedicalDetailsInsert = Omit<
  EnrollmentMedicalDetails,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string;
};

/** Update type for enrollment_medical_details */
export type EnrollmentMedicalDetailsUpdate = Partial<
  Omit<EnrollmentMedicalDetails, 'id' | 'application_id' | 'created_at' | 'updated_at'>
>;

/** Insert type for enrollment_declarations */
export type EnrollmentDeclarationsInsert = Omit<
  EnrollmentDeclarations,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string;
};

/** Update type for enrollment_declarations */
export type EnrollmentDeclarationsUpdate = Partial<
  Omit<EnrollmentDeclarations, 'id' | 'application_id' | 'created_at' | 'updated_at'>
>;

/** Insert type for enrollment_documents */
export type EnrollmentDocumentInsert = Omit<
  EnrollmentDocument,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string;
};

/** Update type for enrollment_documents */
export type EnrollmentDocumentUpdate = Partial<
  Omit<EnrollmentDocument, 'id' | 'application_id' | 'created_at' | 'updated_at'>
>;

/** Insert type for enrollment_status_history */
export type EnrollmentStatusHistoryInsert = Omit<
  EnrollmentStatusHistory,
  'id' | 'created_at'
> & {
  id?: string;
};

/** Insert type for enrollment_review_notes */
export type EnrollmentReviewNoteInsert = Omit<
  EnrollmentReviewNote,
  'id' | 'created_at'
> & {
  id?: string;
};

/** Insert type for student_onboarding_tasks */
export type StudentOnboardingTaskInsert = Omit<
  StudentOnboardingTask,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string;
};

/** Update type for student_onboarding_tasks */
export type StudentOnboardingTaskUpdate = Partial<
  Omit<StudentOnboardingTask, 'id' | 'application_id' | 'created_at' | 'updated_at'>
>;

/** Insert type for enrollment_audit_log */
export type EnrollmentAuditLogInsert = Omit<
  EnrollmentAuditLog,
  'id' | 'created_at'
> & {
  id?: string;
};

// ------------------------------------------------------------
// 4. FORM DATA INTERFACES
// ------------------------------------------------------------

/** Wizard Step 1: Student personal information */
export interface StudentPersonalFormData {
  full_name_en: string;
  full_name_ar: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  religion: string;
  mother_tongue: string;
  place_of_birth: string;
  secondary_nationality?: string;
  preferred_language?: string;
}

/** Wizard Step 2: Academic details */
export interface AcademicFormData {
  enrollment_type: EnrollmentType;
  applying_grade_id: string;
  applying_grade_name: string;
  academic_year: string;
  curriculum?: string;

  // transfer-specific (required when enrollment_type === 'transfer')
  previous_school_name?: string;
  previous_school_country?: string;
  previous_school_emirate?: string;
  previous_grade_completed?: string;
  is_mid_year_transfer?: boolean;
  transfer_source?: TransferSource;
  last_report_card_year?: string;
  transcript_available?: boolean;
  transfer_certificate_available?: boolean;
  transfer_reason?: string;
}

/** Wizard Step 3: Guardian / parent details (one or more contacts) */
export interface GuardianFormData {
  contact_type: string;
  relationship: GuardianRelationship;
  full_name_en: string;
  full_name_ar: string;
  mobile: string;
  email: string;

  // address
  uae_address: string;
  emirate: string;
  area_city_district?: string;

  // identity
  emirates_id_number?: string;
  passport_number?: string;
  visa_number?: string;

  // guardian-specific
  is_legal_guardian?: boolean;
  custody_case?: boolean;
  guardian_authorization_notes?: string;
}

/** Wizard Step 4: Identity / residency details */
export interface IdentityFormData {
  emirates_id_available: boolean;
  emirates_id_number?: string;
  student_passport_number: string;
  student_passport_expiry: string;
  residence_visa_number?: string;
  residence_visa_expiry?: string;
  residency_status: string;
  country_of_residence: string;
}

/** Wizard Step 5: Medical / SEN details */
export interface MedicalFormData {
  has_medical_condition: boolean;
  medical_condition_details?: string;
  has_sen: boolean;
  sen_details?: string;
  vaccination_record_available: boolean;
  allergies?: string;
  medication_notes?: string;
  health_notes?: string;
}

/** Wizard Step 7: Declarations / consents */
export interface DeclarationsFormData {
  info_correct: boolean;
  docs_authentic: boolean;
  accepts_verification: boolean;
  acknowledges_attestation: boolean;
  acknowledges_missing_delays: boolean;
  privacy_policy_accepted: boolean;

  // optional consents
  medical_emergency_consent?: boolean;
  communications_consent?: boolean;
  marketing_consent?: boolean;
  digital_platform_consent?: boolean;
}

// ------------------------------------------------------------
// 5. API RESPONSE TYPES
// ------------------------------------------------------------

/** Compact summary for application list views */
export interface ApplicationSummary {
  id: string;
  application_number: string;
  status: EnrollmentAppStatus;
  completeness_score: number;
  academic_year: string;
  current_step: number;

  // denormalized from student_details
  student_name_en: string | null;
  student_name_ar: string | null;

  // denormalized from academic_details
  applying_grade_name: string | null;
  enrollment_type: EnrollmentType | null;

  // counts
  documents_total: number;
  documents_verified: number;
  documents_pending: number;

  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Full application with all related data (detail view) */
export interface ApplicationDetail {
  application: EnrollmentApplication;
  student_details: EnrollmentStudentDetails | null;
  academic_details: EnrollmentAcademicDetails | null;
  guardians: EnrollmentGuardianDetails[];
  identity_details: EnrollmentIdentityDetails | null;
  medical_details: EnrollmentMedicalDetails | null;
  declarations: EnrollmentDeclarations | null;
  documents: EnrollmentDocument[];
  status_history: EnrollmentStatusHistory[];
  review_notes: EnrollmentReviewNote[];
  onboarding_tasks: StudentOnboardingTask[];
}

/** Payload for updating application status (admin action) */
export interface ApplicationStatusUpdate {
  application_id: string;
  new_status: EnrollmentAppStatus;
  reason?: string;
  notes?: string;
}

/** Payload for reviewing a single document (admin action) */
export interface DocumentReviewAction {
  document_id: string;
  action: 'verify' | 'reject' | 'request_re_upload' | 'request_attestation' | 'request_translation';
  rejection_reason?: string;
  notes?: string;
}

// ------------------------------------------------------------
// 6. WIZARD STEP DEFINITION
// ------------------------------------------------------------

export interface WizardStep {
  /** 1-based step number */
  step: number;
  /** Machine-readable key */
  key: string;
  /** Display label (English) */
  label_en: string;
  /** Display label (Arabic) */
  label_ar: string;
  /** Brief description (English) */
  description_en: string;
  /** Whether the step is required to submit */
  required: boolean;
}

// ------------------------------------------------------------
// 7. DOCUMENT REQUIREMENT RULE
// ------------------------------------------------------------

/** Context passed to the condition function to decide if a document is required */
export interface DocumentConditionContext {
  enrollment_type: EnrollmentType | null;
  transfer_source: TransferSource | null;
  nationality: string | null;
  has_medical_condition: boolean;
  has_sen: boolean;
  custody_case: boolean;
}

/** A rule that defines when a document type is required */
export interface DocumentRequirement {
  document_type: EnrollmentDocType;
  label_en: string;
  label_ar: string;
  /** Whether this is always required (true) or conditionally required (false) */
  is_always_required: boolean;
  /**
   * If `is_always_required` is false, this function determines
   * whether the document is required given the application context.
   * Returns `true` if required, `false` otherwise.
   */
  condition?: (ctx: DocumentConditionContext) => boolean;
}

// ------------------------------------------------------------
// 8. CONSTANTS
// ------------------------------------------------------------

/** Ordered wizard steps */
export const WIZARD_STEPS: WizardStep[] = [
  {
    step: 1,
    key: 'student_personal',
    label_en: 'Student Information',
    label_ar: 'معلومات الطالب',
    description_en: 'Basic personal details about the student',
    required: true,
  },
  {
    step: 2,
    key: 'academic',
    label_en: 'Academic Details',
    label_ar: 'التفاصيل الأكاديمية',
    description_en: 'Grade, curriculum, and transfer information',
    required: true,
  },
  {
    step: 3,
    key: 'guardian',
    label_en: 'Parent / Guardian',
    label_ar: 'ولي الأمر',
    description_en: 'Parent or guardian contact and identity details',
    required: true,
  },
  {
    step: 4,
    key: 'identity',
    label_en: 'Identity & Residency',
    label_ar: 'الهوية والإقامة',
    description_en: 'Emirates ID, passport, and visa information',
    required: true,
  },
  {
    step: 5,
    key: 'medical',
    label_en: 'Medical & Support',
    label_ar: 'الطبي والدعم',
    description_en: 'Health conditions, SEN, and vaccinations',
    required: true,
  },
  {
    step: 6,
    key: 'documents',
    label_en: 'Documents',
    label_ar: 'المستندات',
    description_en: 'Upload required documents and certificates',
    required: true,
  },
  {
    step: 7,
    key: 'declarations',
    label_en: 'Declarations & Review',
    label_ar: 'الإقرارات والمراجعة',
    description_en: 'Confirm declarations and review the application',
    required: true,
  },
] as const;

/** Human-readable English labels for each application status */
export const APPLICATION_STATUS_LABELS: Record<EnrollmentAppStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  incomplete: 'Incomplete',
  pending_documents: 'Pending Documents',
  pending_verification: 'Pending Verification',
  under_review: 'Under Review',
  pending_attestation: 'Pending Attestation',
  pending_translation: 'Pending Translation',
  awaiting_transfer_certificate: 'Awaiting Transfer Certificate',
  action_required: 'Action Required',
  provisionally_accepted: 'Provisionally Accepted',
  approved: 'Approved',
  rejected: 'Rejected',
  enrollment_activated: 'Enrollment Activated',
};

/** Human-readable English labels for each document type */
export const DOCUMENT_TYPE_LABELS: Record<EnrollmentDocType, string> = {
  student_photo: 'Student Photo',
  student_passport: 'Student Passport',
  student_emirates_id: 'Student Emirates ID',
  birth_certificate: 'Birth Certificate',
  vaccination_record: 'Vaccination Record',
  student_visa: 'Student Visa',
  parent_emirates_id: 'Parent Emirates ID',
  parent_passport: 'Parent Passport',
  parent_visa: 'Parent Visa',
  last_report_card: 'Last Report Card',
  academic_transcript: 'Academic Transcript',
  transfer_certificate: 'Transfer Certificate',
  medical_report: 'Medical Report',
  sen_support_document: 'SEN Support Document',
  custody_guardianship_document: 'Custody / Guardianship Document',
  translation_upload: 'Translation Upload',
  additional_supporting_document: 'Additional Supporting Document',
  undertaking_letter: 'Undertaking Letter',
};

/** Human-readable English labels for each document status */
export const DOCUMENT_STATUS_LABELS: Record<EnrollmentDocStatus, string> = {
  missing: 'Missing',
  uploaded: 'Uploaded',
  pending_review: 'Pending Review',
  verified: 'Verified',
  rejected: 'Rejected',
  pending_attestation: 'Pending Attestation',
  pending_translation: 'Pending Translation',
  re_upload_requested: 'Re-upload Requested',
  expired: 'Expired',
};
