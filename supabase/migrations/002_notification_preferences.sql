-- ============================================
-- NOTIFICATION PREFERENCES TABLE
-- Migration: 002_notification_preferences
-- ============================================

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS notification_preferences CASCADE;

-- ============================================
-- ENUMS
-- ============================================

-- Digest frequency options
DROP TYPE IF EXISTS digest_frequency CASCADE;
CREATE TYPE digest_frequency AS ENUM (
    'instant',      -- Send notifications immediately
    'daily',        -- Aggregate into daily digest
    'weekly'        -- Aggregate into weekly digest
);

-- ============================================
-- TABLES
-- ============================================

-- Notification Preferences Table
-- Stores per-user notification preferences including channels, timing, and digest options
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,

    -- Channel preferences (which channels user wants to receive notifications on)
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    in_app_enabled BOOLEAN DEFAULT TRUE,

    -- Contact information
    phone_number TEXT, -- Phone number for SMS notifications
    phone_verified BOOLEAN DEFAULT FALSE,

    -- Digest preferences
    digest_frequency digest_frequency DEFAULT 'instant',

    -- Quiet hours (user's local time when notifications should not be sent)
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME, -- e.g., '22:00:00' (10 PM)
    quiet_hours_end TIME,   -- e.g., '08:00:00' (8 AM)

    -- Timezone (IANA timezone string)
    timezone TEXT DEFAULT 'UTC', -- e.g., 'America/New_York', 'Europe/London', 'Asia/Dubai'

    -- Granular notification type preferences
    class_reminders_enabled BOOLEAN DEFAULT TRUE,
    grade_updates_enabled BOOLEAN DEFAULT TRUE,
    announcements_enabled BOOLEAN DEFAULT TRUE,
    cancellations_enabled BOOLEAN DEFAULT TRUE, -- Always critical, user can't disable via SMS

    -- Email-specific preferences
    unsubscribed_from_email BOOLEAN DEFAULT FALSE,
    unsubscribe_token TEXT, -- Secure token for one-click unsubscribe

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_unsubscribe_token ON notification_preferences(unsubscribe_token);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE notification_preferences IS 'Stores user notification preferences including enabled channels, digest frequency, quiet hours, and timezone';
COMMENT ON COLUMN notification_preferences.user_id IS 'Foreign key to users table, one preference row per user';
COMMENT ON COLUMN notification_preferences.email_enabled IS 'Whether user wants to receive email notifications';
COMMENT ON COLUMN notification_preferences.push_enabled IS 'Whether user wants to receive push notifications';
COMMENT ON COLUMN notification_preferences.sms_enabled IS 'Whether user wants to receive SMS notifications (requires verified phone)';
COMMENT ON COLUMN notification_preferences.in_app_enabled IS 'Whether user wants to receive in-app notifications';
COMMENT ON COLUMN notification_preferences.phone_number IS 'Phone number for SMS notifications (E.164 format)';
COMMENT ON COLUMN notification_preferences.phone_verified IS 'Whether the phone number has been verified';
COMMENT ON COLUMN notification_preferences.digest_frequency IS 'How often to send notification digests: instant, daily, or weekly';
COMMENT ON COLUMN notification_preferences.quiet_hours_enabled IS 'Whether to respect quiet hours';
COMMENT ON COLUMN notification_preferences.quiet_hours_start IS 'Start of quiet hours in user local time (no notifications sent during this period)';
COMMENT ON COLUMN notification_preferences.quiet_hours_end IS 'End of quiet hours in user local time';
COMMENT ON COLUMN notification_preferences.timezone IS 'IANA timezone string for scheduling notifications at appropriate times';
COMMENT ON COLUMN notification_preferences.class_reminders_enabled IS 'Whether to send class/lesson reminder notifications';
COMMENT ON COLUMN notification_preferences.grade_updates_enabled IS 'Whether to send grade update notifications';
COMMENT ON COLUMN notification_preferences.announcements_enabled IS 'Whether to send announcement notifications';
COMMENT ON COLUMN notification_preferences.cancellations_enabled IS 'Whether to send cancellation notifications (critical, always sent via SMS if enabled)';
COMMENT ON COLUMN notification_preferences.unsubscribed_from_email IS 'Whether user has unsubscribed from email notifications (CAN-SPAM compliance)';
COMMENT ON COLUMN notification_preferences.unsubscribe_token IS 'Secure token for one-click email unsubscribe';

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row modification
CREATE TRIGGER trigger_update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_preferences_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on the table
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own preferences
CREATE POLICY notification_preferences_select_own
    ON notification_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can update their own preferences
CREATE POLICY notification_preferences_update_own
    ON notification_preferences
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own preferences
CREATE POLICY notification_preferences_insert_own
    ON notification_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own preferences
CREATE POLICY notification_preferences_delete_own
    ON notification_preferences
    FOR DELETE
    USING (auth.uid() = user_id);
