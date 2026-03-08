-- Seed default Grades
INSERT INTO grades (name, name_en, slug, sort_order, is_active)
VALUES
    ('KG 1', 'KG 1', 'kg1', 1, true),
    ('KG 2', 'KG 2', 'kg2', 2, true),
    ('Grade 1', 'Grade 1', 'grade-1', 3, true),
    ('Grade 2', 'Grade 2', 'grade-2', 4, true),
    ('Grade 3', 'Grade 3', 'grade-3', 5, true),
    ('Grade 4', 'Grade 4', 'grade-4', 6, true),
    ('Grade 5', 'Grade 5', 'grade-5', 7, true),
    ('Grade 6', 'Grade 6', 'grade-6', 8, true),
    ('Grade 7', 'Grade 7', 'grade-7', 9, true),
    ('Grade 8', 'Grade 8', 'grade-8', 10, true),
    ('Grade 9', 'Grade 9', 'grade-9', 11, true),
    ('Grade 10', 'Grade 10', 'grade-10', 12, true),
    ('Grade 11', 'Grade 11', 'grade-11', 13, true),
    ('Grade 12', 'Grade 12', 'grade-12', 14, true)
ON CONFLICT (slug) DO NOTHING;

-- Seed some default generic subjects for administrative testing if needed
-- Wait, subjects belong to a teacher, so we won't seed global subjects since they require a teacher_id.
-- However, we can drop the NOT NULL constraint on teacher_id if we want global subjects.
