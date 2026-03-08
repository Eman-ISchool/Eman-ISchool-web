-- ============================================
-- EDUVERSE ENROLLMENT APPLICATIONS MIGRATION
-- Date: 2026-02-20
-- ============================================

-- Create Enum for Application Status if not exists
DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('pending', 'payment_pending', 'payment_completed', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Create enrollment_applications table
CREATE TABLE IF NOT EXISTS enrollment_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    grade_id UUID REFERENCES grades(id) ON DELETE SET NULL,
    student_details JSONB DEFAULT '{}',
    parent_details JSONB DEFAULT '{}',
    documents JSONB DEFAULT '{}',
    payment_method TEXT,
    payment_plan JSONB DEFAULT '{}',
    total_amount DECIMAL(10,2),
    currency TEXT DEFAULT 'AED',
    status application_status DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add Indexes
CREATE INDEX IF NOT EXISTS idx_enrollment_applications_user ON enrollment_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_applications_grade ON enrollment_applications(grade_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_applications_status ON enrollment_applications(status);

-- 3. Add updated_at trigger
CREATE TRIGGER update_enrollment_applications_updated_at
    BEFORE UPDATE ON enrollment_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Row Level Security (RLS)
ALTER TABLE enrollment_applications ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access to enrollment_applications" ON enrollment_applications FOR ALL USING (auth.role() = 'service_role');

-- Users can view and manage their own applications
CREATE POLICY "Users can manage their own enrollment_applications" ON enrollment_applications 
    FOR ALL USING (user_id = (SELECT id FROM users WHERE google_id = auth.uid()::text));

-- Admins can view and manage all applications
CREATE POLICY "Admins can manage all enrollment_applications" ON enrollment_applications 
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'admin'));

-- 5. Storage Buckets for Documents and Receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('enrollment_documents', 'enrollment_documents', false, 20971520) -- 20MB limit
ON CONFLICT (id) DO NOTHING;

-- RLS for storage bucket
CREATE POLICY "Users can upload their own enrollment documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'enrollment_documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND name LIKE auth.uid()::text || '/%'
);

CREATE POLICY "Users can download own enrollment documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'enrollment_documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can view and manage all enrollment documents"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'enrollment_documents'
  AND EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'admin')
);
