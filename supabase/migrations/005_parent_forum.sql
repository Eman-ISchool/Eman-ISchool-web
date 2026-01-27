-- ============================================
-- MIGRATION: Parent Community Forum
-- Description: Creates forum tables for parent community discussions
-- ============================================

-- ============================================
-- CREATE TABLES
-- ============================================

-- Forum Categories Table
CREATE TABLE IF NOT EXISTS forum_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_forum_categories_slug ON forum_categories(slug);
CREATE INDEX IF NOT EXISTS idx_forum_categories_active ON forum_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_forum_categories_order ON forum_categories(display_order);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp for forum_categories
CREATE TRIGGER update_forum_categories_updated_at
    BEFORE UPDATE ON forum_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on forum_categories table
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;

-- Service role bypass for API operations
CREATE POLICY "Service role full access to forum_categories" ON forum_categories
    FOR ALL USING (auth.role() = 'service_role');

-- All authenticated users can view active categories
CREATE POLICY "Authenticated users can view active categories" ON forum_categories
    FOR SELECT USING (
        is_active = TRUE
        AND auth.role() = 'authenticated'
    );

-- Admins can view all categories (including inactive)
CREATE POLICY "Admins can view all forum_categories" ON forum_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.google_id = auth.uid()::text
            AND users.role = 'admin'
        )
    );

-- Admins can manage all forum categories
CREATE POLICY "Admins can manage all forum_categories" ON forum_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.google_id = auth.uid()::text
            AND users.role = 'admin'
        )
    );
