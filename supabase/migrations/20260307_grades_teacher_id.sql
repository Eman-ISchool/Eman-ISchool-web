-- Add teacher_id to grades, as Grades act as Classes in the new hierarchy where Teachers create and own them

ALTER TABLE grades ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_grades_teacher_id ON grades(teacher_id);

-- Update RLS policies so teachers can view and manage their own classes (grades)
CREATE POLICY "Teachers can view their own classes"
ON grades FOR SELECT
USING (auth.uid() = teacher_id)
WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE id = teacher_id AND role = 'teacher'));

CREATE POLICY "Teachers can update their own classes"
ON grades FOR UPDATE
USING (auth.uid() = teacher_id)
WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE id = teacher_id AND role = 'teacher'));

CREATE POLICY "Teachers can insert their own classes"
ON grades FOR INSERT
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own classes"
ON grades FOR DELETE
USING (auth.uid() = teacher_id);
