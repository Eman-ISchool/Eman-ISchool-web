-- ============================================
-- EDUVERSE NOTIFICATIONS TABLE MIGRATION
-- Date: 2026-02-26
-- ============================================

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- 3. Add updated_at trigger (optional, for future use)
-- CREATE TRIGGER update_notifications_updated_at
--     BEFORE UPDATE ON notifications
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();

-- 4. Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access to notifications" ON notifications FOR ALL USING (auth.role() = 'service_role');

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE notifications IS 'Simple in-app notifications for users';
COMMENT ON COLUMN notifications.user_id IS 'Foreign key to users table - notification recipient';
COMMENT ON COLUMN notifications.type IS 'Notification type (e.g., class_reminder, grade_update, announcement, cancellation, assignment_due, exam_reminder)';
COMMENT ON COLUMN notifications.is_read IS 'Whether the notification has been read by the user';
COMMENT ON COLUMN notifications.link IS 'Optional deep link to relevant page in the application';
