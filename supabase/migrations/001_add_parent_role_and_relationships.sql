-- ============================================
-- MIGRATION: Add Parent Role and Parent-Children Relationships
-- Description: Extends user_role enum to include 'parent' and creates parent_children table
-- ============================================

-- ============================================
-- ALTER ENUMS
-- ============================================

-- Add 'parent' to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'parent';

-- ============================================
-- CREATE TABLES
-- ============================================

-- Parent-Children Relationship Table
CREATE TABLE IF NOT EXISTS parent_children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    child_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_id, child_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_parent_children_parent ON parent_children(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_child ON parent_children(child_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_created ON parent_children(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on parent_children table
ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;

-- Service role bypass for API operations
CREATE POLICY "Service role full access to parent_children" ON parent_children
    FOR ALL USING (auth.role() = 'service_role');

-- Parents can view their own relationships
CREATE POLICY "Parents can view their own children" ON parent_children
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = parent_children.parent_id
            AND users.google_id = auth.uid()::text
            AND users.role = 'parent'
        )
    );

-- Parents can insert their own relationships
CREATE POLICY "Parents can add their own children" ON parent_children
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = parent_children.parent_id
            AND users.google_id = auth.uid()::text
            AND users.role = 'parent'
        )
    );

-- Parents can delete their own relationships
CREATE POLICY "Parents can remove their own children" ON parent_children
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = parent_children.parent_id
            AND users.google_id = auth.uid()::text
            AND users.role = 'parent'
        )
    );

-- Admins can view all parent-child relationships
CREATE POLICY "Admins can view all parent_children" ON parent_children
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.google_id = auth.uid()::text
            AND users.role = 'admin'
        )
    );

-- Admins can manage all parent-child relationships
CREATE POLICY "Admins can manage all parent_children" ON parent_children
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.google_id = auth.uid()::text
            AND users.role = 'admin'
        )
    );

-- ============================================
-- CONSTRAINTS AND VALIDATION
-- ============================================

-- Add constraint to ensure parent and child are different users
ALTER TABLE parent_children
    ADD CONSTRAINT parent_child_not_same
    CHECK (parent_id != child_id);

-- Add constraint to ensure child has student role
ALTER TABLE parent_children
    ADD CONSTRAINT child_must_be_student
    CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = parent_children.child_id
            AND users.role = 'student'
        )
    );

-- Add constraint to ensure parent has parent role
ALTER TABLE parent_children
    ADD CONSTRAINT parent_must_have_parent_role
    CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = parent_children.parent_id
            AND users.role = 'parent'
        )
    );
