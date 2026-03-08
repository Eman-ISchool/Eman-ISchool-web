-- 20260303_e2e_classes.sql
BEGIN;

-- 1. Create Classes table
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Modify Subjects to link to Classes
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE CASCADE;

-- 3. RLS Policies for Classes
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access to classes" ON classes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Anyone can view active classes" ON classes FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Teachers can manage classes" ON classes FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- Trigger for updated_at
CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
