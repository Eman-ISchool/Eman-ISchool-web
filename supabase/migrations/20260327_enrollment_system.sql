-- ============================================================
-- ENROLLMENT SYSTEM MIGRATION
-- Full student enrollment + onboarding for UAE/Gulf schools
-- ============================================================

-- Application-level status enum
DO $$ BEGIN
  CREATE TYPE enrollment_app_status AS ENUM (
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
    'enrollment_activated'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Document-level status enum
DO $$ BEGIN
  CREATE TYPE enrollment_doc_status AS ENUM (
    'missing',
    'uploaded',
    'pending_review',
    'verified',
    'rejected',
    'pending_attestation',
    'pending_translation',
    're_upload_requested',
    'expired'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enrollment type enum
DO $$ BEGIN
  CREATE TYPE enrollment_type AS ENUM ('new', 'transfer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Transfer source enum
DO $$ BEGIN
  CREATE TYPE transfer_source AS ENUM (
    'egypt',
    'another_uae_emirate',
    'gcc_country',
    'outside_uae_gcc',
    'same_emirate'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Guardian relationship enum
DO $$ BEGIN
  CREATE TYPE guardian_relationship AS ENUM (
    'father',
    'mother',
    'grandfather',
    'grandmother',
    'uncle',
    'aunt',
    'sibling',
    'legal_guardian',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Document type enum
DO $$ BEGIN
  CREATE TYPE enrollment_doc_type AS ENUM (
    'student_photo',
    'student_passport',
    'student_emirates_id',
    'birth_certificate',
    'vaccination_record',
    'student_visa',
    'parent_emirates_id',
    'parent_passport',
    'parent_visa',
    'last_report_card',
    'academic_transcript',
    'transfer_certificate',
    'medical_report',
    'sen_support_document',
    'custody_guardianship_document',
    'translation_upload',
    'additional_supporting_document',
    'undertaking_letter'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 1. ENROLLMENT APPLICATIONS (master record)
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollment_applications_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number TEXT UNIQUE NOT NULL,

  -- ownership
  parent_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,

  -- status
  status enrollment_app_status NOT NULL DEFAULT 'draft',
  completeness_score INTEGER DEFAULT 0,

  -- wizard progress
  current_step INTEGER DEFAULT 1,
  steps_completed JSONB DEFAULT '[]'::jsonb,

  -- submission
  submitted_at TIMESTAMPTZ,

  -- review
  assigned_reviewer_id UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_decision TEXT,

  -- activation
  activated_at TIMESTAMPTZ,
  linked_student_user_id UUID REFERENCES users(id),

  -- metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Generate application numbers
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TRIGGER AS $$
DECLARE
  seq_val INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(application_number FROM 5) AS INTEGER)), 0) + 1
  INTO seq_val
  FROM enrollment_applications_v2
  WHERE application_number LIKE 'APP-%';

  NEW.application_number := 'APP-' || LPAD(seq_val::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_app_number ON enrollment_applications_v2;
CREATE TRIGGER trg_generate_app_number
  BEFORE INSERT ON enrollment_applications_v2
  FOR EACH ROW
  WHEN (NEW.application_number IS NULL OR NEW.application_number = '')
  EXECUTE FUNCTION generate_application_number();

-- ============================================================
-- 2. STUDENT DETAILS
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollment_student_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL UNIQUE REFERENCES enrollment_applications_v2(id) ON DELETE CASCADE,

  -- names
  full_name_en TEXT,
  full_name_ar TEXT,

  -- personal
  date_of_birth DATE,
  gender TEXT,
  nationality TEXT,
  religion TEXT,
  mother_tongue TEXT,
  place_of_birth TEXT,
  secondary_nationality TEXT,
  preferred_language TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. ACADEMIC DETAILS
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollment_academic_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL UNIQUE REFERENCES enrollment_applications_v2(id) ON DELETE CASCADE,

  enrollment_type enrollment_type,
  applying_grade_id UUID REFERENCES grades(id),
  applying_grade_name TEXT,
  academic_year TEXT,
  curriculum TEXT,

  -- transfer-specific
  previous_school_name TEXT,
  previous_school_country TEXT,
  previous_school_emirate TEXT,
  previous_grade_completed TEXT,
  is_mid_year_transfer BOOLEAN DEFAULT false,
  transfer_source transfer_source,
  last_report_card_year TEXT,
  transcript_available BOOLEAN DEFAULT false,
  transfer_certificate_available BOOLEAN DEFAULT false,
  transfer_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. GUARDIAN DETAILS
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollment_guardian_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES enrollment_applications_v2(id) ON DELETE CASCADE,

  -- contact type: primary, father, mother, guardian, emergency
  contact_type TEXT NOT NULL DEFAULT 'primary',

  relationship guardian_relationship,
  full_name_en TEXT,
  full_name_ar TEXT,
  mobile TEXT,
  email TEXT,

  -- address
  uae_address TEXT,
  emirate TEXT,
  area_city_district TEXT,

  -- identity
  emirates_id_number TEXT,
  passport_number TEXT,
  visa_number TEXT,

  -- guardian-specific
  is_legal_guardian BOOLEAN DEFAULT false,
  custody_case BOOLEAN DEFAULT false,
  guardian_authorization_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. IDENTITY / RESIDENCY DETAILS
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollment_identity_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL UNIQUE REFERENCES enrollment_applications_v2(id) ON DELETE CASCADE,

  -- student identity
  emirates_id_available BOOLEAN DEFAULT false,
  emirates_id_number TEXT,
  student_passport_number TEXT,
  student_passport_expiry DATE,
  residence_visa_number TEXT,
  residence_visa_expiry DATE,
  residency_status TEXT,
  country_of_residence TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. MEDICAL / SPECIAL SUPPORT
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollment_medical_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL UNIQUE REFERENCES enrollment_applications_v2(id) ON DELETE CASCADE,

  has_medical_condition BOOLEAN DEFAULT false,
  medical_condition_details TEXT,
  has_sen BOOLEAN DEFAULT false,
  sen_details TEXT,
  vaccination_record_available BOOLEAN DEFAULT false,
  allergies TEXT,
  medication_notes TEXT,
  health_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 7. DECLARATIONS / CONSENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollment_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL UNIQUE REFERENCES enrollment_applications_v2(id) ON DELETE CASCADE,

  info_correct BOOLEAN DEFAULT false,
  docs_authentic BOOLEAN DEFAULT false,
  accepts_verification BOOLEAN DEFAULT false,
  acknowledges_attestation BOOLEAN DEFAULT false,
  acknowledges_missing_delays BOOLEAN DEFAULT false,
  privacy_policy_accepted BOOLEAN DEFAULT false,

  -- optional
  medical_emergency_consent BOOLEAN,
  communications_consent BOOLEAN,
  marketing_consent BOOLEAN,
  digital_platform_consent BOOLEAN,

  declared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 8. ENROLLMENT DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES enrollment_applications_v2(id) ON DELETE CASCADE,

  document_type enrollment_doc_type NOT NULL,
  label TEXT,

  -- requirement
  is_required BOOLEAN NOT NULL DEFAULT true,
  is_conditional BOOLEAN DEFAULT false,
  condition_rule TEXT,

  -- file
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_mime_type TEXT,
  storage_path TEXT,

  -- status
  status enrollment_doc_status NOT NULL DEFAULT 'missing',

  -- review
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- attestation / translation
  issuing_country TEXT,
  document_language TEXT,
  attestation_required BOOLEAN DEFAULT false,
  attestation_status TEXT DEFAULT 'not_required',
  translation_required BOOLEAN DEFAULT false,
  translation_status TEXT DEFAULT 'not_required',

  -- linked translation doc
  translation_document_id UUID REFERENCES enrollment_documents(id),

  -- tracking
  upload_count INTEGER DEFAULT 0,
  last_uploaded_at TIMESTAMPTZ,
  expiry_date DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(application_id, document_type)
);

-- ============================================================
-- 9. APPLICATION STATUS HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollment_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES enrollment_applications_v2(id) ON DELETE CASCADE,

  previous_status enrollment_app_status,
  new_status enrollment_app_status NOT NULL,
  changed_by UUID REFERENCES users(id),
  reason TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 10. APPLICATION REVIEW NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollment_review_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES enrollment_applications_v2(id) ON DELETE CASCADE,

  author_id UUID NOT NULL REFERENCES users(id),
  note_type TEXT DEFAULT 'internal',
  content TEXT NOT NULL,
  is_visible_to_parent BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 11. STUDENT ONBOARDING TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS student_onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES enrollment_applications_v2(id) ON DELETE CASCADE,
  student_user_id UUID REFERENCES users(id),

  task_key TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,

  is_required BOOLEAN DEFAULT true,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),

  sort_order INTEGER DEFAULT 0,
  due_date DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 12. ENROLLMENT AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollment_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES enrollment_applications_v2(id) ON DELETE SET NULL,
  document_id UUID REFERENCES enrollment_documents(id) ON DELETE SET NULL,

  actor_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  target_id UUID,

  previous_state JSONB,
  new_state JSONB,
  reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_enroll_app_parent ON enrollment_applications_v2(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_enroll_app_status ON enrollment_applications_v2(status);
CREATE INDEX IF NOT EXISTS idx_enroll_app_year ON enrollment_applications_v2(academic_year);
CREATE INDEX IF NOT EXISTS idx_enroll_app_student ON enrollment_applications_v2(linked_student_user_id);
CREATE INDEX IF NOT EXISTS idx_enroll_app_reviewer ON enrollment_applications_v2(assigned_reviewer_id);

CREATE INDEX IF NOT EXISTS idx_enroll_student_app ON enrollment_student_details(application_id);
CREATE INDEX IF NOT EXISTS idx_enroll_academic_app ON enrollment_academic_details(application_id);
CREATE INDEX IF NOT EXISTS idx_enroll_guardian_app ON enrollment_guardian_details(application_id);
CREATE INDEX IF NOT EXISTS idx_enroll_identity_app ON enrollment_identity_details(application_id);
CREATE INDEX IF NOT EXISTS idx_enroll_medical_app ON enrollment_medical_details(application_id);

CREATE INDEX IF NOT EXISTS idx_enroll_docs_app ON enrollment_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_enroll_docs_status ON enrollment_documents(status);
CREATE INDEX IF NOT EXISTS idx_enroll_docs_type ON enrollment_documents(document_type);

CREATE INDEX IF NOT EXISTS idx_enroll_status_hist_app ON enrollment_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_enroll_status_hist_time ON enrollment_status_history(created_at);

CREATE INDEX IF NOT EXISTS idx_enroll_notes_app ON enrollment_review_notes(application_id);

CREATE INDEX IF NOT EXISTS idx_onboard_tasks_app ON student_onboarding_tasks(application_id);
CREATE INDEX IF NOT EXISTS idx_onboard_tasks_student ON student_onboarding_tasks(student_user_id);

CREATE INDEX IF NOT EXISTS idx_enroll_audit_app ON enrollment_audit_log(application_id);
CREATE INDEX IF NOT EXISTS idx_enroll_audit_doc ON enrollment_audit_log(document_id);
CREATE INDEX IF NOT EXISTS idx_enroll_audit_actor ON enrollment_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_enroll_audit_time ON enrollment_audit_log(created_at);

-- ============================================================
-- DUPLICATE PREVENTION
-- Prevent duplicate student applications for same academic year
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_student_year
  ON enrollment_applications_v2(parent_user_id, academic_year, (
    SELECT sd.full_name_en FROM enrollment_student_details sd WHERE sd.application_id = enrollment_applications_v2.id
  ))
  WHERE status NOT IN ('rejected', 'draft');

-- Note: The above may not work as a functional index referencing another table.
-- Instead we enforce this in the application layer.
DROP INDEX IF EXISTS idx_unique_student_year;

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_enrollment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'enrollment_applications_v2',
    'enrollment_student_details',
    'enrollment_academic_details',
    'enrollment_guardian_details',
    'enrollment_identity_details',
    'enrollment_medical_details',
    'enrollment_declarations',
    'enrollment_documents',
    'student_onboarding_tasks'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_updated_at ON %I; CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_enrollment_updated_at();',
      tbl, tbl
    );
  END LOOP;
END $$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE enrollment_applications_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_student_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_academic_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_guardian_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_identity_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_medical_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_review_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_audit_log ENABLE ROW LEVEL SECURITY;

-- Service role bypass (for API routes using supabaseAdmin)
CREATE POLICY service_role_all ON enrollment_applications_v2 FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY service_role_all ON enrollment_student_details FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY service_role_all ON enrollment_academic_details FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY service_role_all ON enrollment_guardian_details FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY service_role_all ON enrollment_identity_details FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY service_role_all ON enrollment_medical_details FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY service_role_all ON enrollment_declarations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY service_role_all ON enrollment_documents FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY service_role_all ON enrollment_status_history FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY service_role_all ON enrollment_review_notes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY service_role_all ON student_onboarding_tasks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY service_role_all ON enrollment_audit_log FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create storage bucket for enrollment documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'enrollment-documents-v2',
  'enrollment-documents-v2',
  false,
  20971520, -- 20MB
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;
