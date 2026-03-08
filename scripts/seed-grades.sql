-- Seed grades table with Arabic grade names
-- Feature: Platform Bug Fix & Hardening (001-fix-platform-issues)
-- Purpose: Ensure Create Course form has active grades to select from

-- Check if grades table is empty and seed if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM grades LIMIT 1) THEN
        INSERT INTO grades (name, name_en, slug, is_active, sort_order) VALUES
        ('الصف الأول', 'Grade 1', 'grade-1', true, 1),
        ('الصف الثاني', 'Grade 2', 'grade-2', true, 2),
        ('الصف الثالث', 'Grade 3', 'grade-3', true, 3),
        ('الصف الرابع', 'Grade 4', 'grade-4', true, 4),
        ('الصف الخامس', 'Grade 5', 'grade-5', true, 5),
        ('الصف السادس', 'Grade 6', 'grade-6', true, 6);
    END IF;
END $$;
