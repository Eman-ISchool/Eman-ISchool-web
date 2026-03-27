-- Supervisor section access permissions
-- Admins can toggle which dashboard nav sections supervisors can see

CREATE TABLE IF NOT EXISTS supervisor_section_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  section_label TEXT NOT NULL,
  is_allowed BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default sections (only Academic is allowed for supervisor by default)
INSERT INTO supervisor_section_access (section_key, section_label, is_allowed) VALUES
  ('academic',    'الأكاديمي',      true),
  ('admin',       'الإدارة',        false),
  ('finance',     'المالية',        false),
  ('communication','التواصل',       false),
  ('content',     'المحتوى',        false),
  ('analytics',   'التحليلات',      false),
  ('data',        'إدارة البيانات', false)
ON CONFLICT (section_key) DO NOTHING;

-- RLS: only admins can write, admins+supervisors can read
ALTER TABLE supervisor_section_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_full_access" ON supervisor_section_access
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "supervisors_read" ON supervisor_section_access
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'supervisor')
  );
