-- ============================================
-- NOTIFICATION QUEUE TABLE
-- Migration: 003_notification_queue
-- ============================================

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS notification_queue CASCADE;

-- ============================================
-- ENUMS
-- ============================================

-- Notification type/category
DROP TYPE IF EXISTS notification_type CASCADE;
CREATE TYPE notification_type AS ENUM (
    'class_reminder',       -- Reminder for upcoming class/lesson
    'grade_update',         -- Student grade posted or updated
    'announcement',         -- Course or school-wide announcement
    'cancellation',         -- Class cancellation (critical)
    'assignment_due',       -- Assignment due date reminder
    'exam_reminder'         -- Exam/test reminder
);

-- Priority level for notifications
DROP TYPE IF EXISTS notification_priority CASCADE;
CREATE TYPE notification_priority AS ENUM (
    'low',          -- Non-urgent, can be delayed
    'normal',       -- Standard priority
    'high',         -- Important, should be sent soon
    'critical'      -- Urgent, send immediately (e.g., cancellations)
);

-- ============================================
-- TABLES
-- ============================================

-- Notification Queue Table
-- Stores queued notifications with scheduling, retry logic, and delivery tracking
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Recipient information
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    -- Notification metadata
    notification_type notification_type NOT NULL,
    channel notification_channel NOT NULL,
    priority notification_priority DEFAULT 'normal',

    -- Notification content
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Additional structured data (e.g., class_id, grade_id, links)

    -- Status tracking
    status notification_status DEFAULT 'pending' NOT NULL,

    -- Scheduling
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- When to send this notification

    -- Retry logic
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    last_attempted_at TIMESTAMPTZ,

    -- Delivery tracking timestamps
    sent_at TIMESTAMPTZ,        -- When the notification was sent to provider
    delivered_at TIMESTAMPTZ,   -- When provider confirmed delivery
    read_at TIMESTAMPTZ,        -- When user read the notification (in-app only)
    failed_at TIMESTAMPTZ,      -- When the notification permanently failed

    -- Error tracking
    error_message TEXT,         -- Error details if delivery failed

    -- Digest batching
    digest_batch_id UUID,       -- For grouping notifications into digest emails
    is_digest_aggregated BOOLEAN DEFAULT FALSE, -- Whether this was included in a digest

    -- Provider-specific tracking
    external_id TEXT,           -- ID from external provider (e.g., Resend message ID, Twilio SID)

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Core lookup indexes
CREATE INDEX IF NOT EXISTS idx_notification_queue_user ON notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled_for ON notification_queue(scheduled_for);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_status ON notification_queue(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_pending_scheduled
    ON notification_queue(status, scheduled_for)
    WHERE status = 'pending' AND scheduled_for <= NOW();

-- Digest and batch processing indexes
CREATE INDEX IF NOT EXISTS idx_notification_queue_digest_batch ON notification_queue(digest_batch_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_digest
    ON notification_queue(user_id, is_digest_aggregated)
    WHERE is_digest_aggregated = FALSE;

-- Priority and type indexes
CREATE INDEX IF NOT EXISTS idx_notification_queue_priority ON notification_queue(priority, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_queue_type ON notification_queue(notification_type);

-- Failed notifications for retry
CREATE INDEX IF NOT EXISTS idx_notification_queue_failed_retry
    ON notification_queue(status, retry_count, max_retries)
    WHERE status = 'failed' AND retry_count < max_retries;

-- External tracking
CREATE INDEX IF NOT EXISTS idx_notification_queue_external_id ON notification_queue(external_id);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE notification_queue IS 'Queues notifications for delivery across multiple channels with scheduling, retry logic, and delivery tracking';
COMMENT ON COLUMN notification_queue.user_id IS 'Foreign key to users table - notification recipient';
COMMENT ON COLUMN notification_queue.notification_type IS 'Type of notification: class_reminder, grade_update, announcement, cancellation, etc.';
COMMENT ON COLUMN notification_queue.channel IS 'Delivery channel: email, push, sms, or in_app';
COMMENT ON COLUMN notification_queue.priority IS 'Priority level: low, normal, high, or critical (affects scheduling)';
COMMENT ON COLUMN notification_queue.title IS 'Notification title/subject';
COMMENT ON COLUMN notification_queue.body IS 'Notification body/message content';
COMMENT ON COLUMN notification_queue.data IS 'Additional structured data as JSON (e.g., {class_id, grade_id, action_url})';
COMMENT ON COLUMN notification_queue.status IS 'Current delivery status: pending, sent, delivered, failed, or read';
COMMENT ON COLUMN notification_queue.scheduled_for IS 'Timestamp when notification should be sent (respects timezone and quiet hours)';
COMMENT ON COLUMN notification_queue.retry_count IS 'Number of delivery attempts made';
COMMENT ON COLUMN notification_queue.max_retries IS 'Maximum number of retry attempts before marking as permanently failed';
COMMENT ON COLUMN notification_queue.last_attempted_at IS 'Timestamp of last delivery attempt';
COMMENT ON COLUMN notification_queue.sent_at IS 'Timestamp when notification was sent to delivery provider';
COMMENT ON COLUMN notification_queue.delivered_at IS 'Timestamp when delivery provider confirmed delivery';
COMMENT ON COLUMN notification_queue.read_at IS 'Timestamp when user read the notification (in-app notifications only)';
COMMENT ON COLUMN notification_queue.failed_at IS 'Timestamp when notification permanently failed after all retries';
COMMENT ON COLUMN notification_queue.error_message IS 'Error message if delivery failed';
COMMENT ON COLUMN notification_queue.digest_batch_id IS 'UUID for grouping multiple notifications into a single digest email';
COMMENT ON COLUMN notification_queue.is_digest_aggregated IS 'Whether this notification was included in a digest email';
COMMENT ON COLUMN notification_queue.external_id IS 'Provider-specific tracking ID (Resend message ID, Twilio SID, etc.)';

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row modification
CREATE TRIGGER trigger_update_notification_queue_updated_at
    BEFORE UPDATE ON notification_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_queue_updated_at();

-- Function to automatically set failed_at when status changes to failed
CREATE OR REPLACE FUNCTION set_notification_failed_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
        NEW.failed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set failed_at timestamp
CREATE TRIGGER trigger_set_notification_failed_timestamp
    BEFORE UPDATE ON notification_queue
    FOR EACH ROW
    WHEN (NEW.status = 'failed')
    EXECUTE FUNCTION set_notification_failed_timestamp();

-- Function to automatically set sent_at when status changes to sent
CREATE OR REPLACE FUNCTION set_notification_sent_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('sent', 'delivered') AND OLD.status = 'pending' AND NEW.sent_at IS NULL THEN
        NEW.sent_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set sent_at timestamp
CREATE TRIGGER trigger_set_notification_sent_timestamp
    BEFORE UPDATE ON notification_queue
    FOR EACH ROW
    EXECUTE FUNCTION set_notification_sent_timestamp();

-- Function to automatically set delivered_at when status changes to delivered
CREATE OR REPLACE FUNCTION set_notification_delivered_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.delivered_at IS NULL THEN
        NEW.delivered_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set delivered_at timestamp
CREATE TRIGGER trigger_set_notification_delivered_timestamp
    BEFORE UPDATE ON notification_queue
    FOR EACH ROW
    WHEN (NEW.status = 'delivered')
    EXECUTE FUNCTION set_notification_delivered_timestamp();

-- Function to automatically set read_at when status changes to read
CREATE OR REPLACE FUNCTION set_notification_read_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'read' AND OLD.status != 'read' AND NEW.read_at IS NULL THEN
        NEW.read_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set read_at timestamp
CREATE TRIGGER trigger_set_notification_read_timestamp
    BEFORE UPDATE ON notification_queue
    FOR EACH ROW
    WHEN (NEW.status = 'read')
    EXECUTE FUNCTION set_notification_read_timestamp();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on the table
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY notification_queue_select_own
    ON notification_queue
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (e.g., mark as read)
CREATE POLICY notification_queue_update_own
    ON notification_queue
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: System/service can insert notifications (no user restriction)
-- Note: In production, you may want to restrict this to service role only
CREATE POLICY notification_queue_insert_system
    ON notification_queue
    FOR INSERT
    WITH CHECK (true);

-- Policy: System/service can update any notification (for delivery tracking)
-- Note: This allows the notification service to update delivery status
CREATE POLICY notification_queue_update_system
    ON notification_queue
    FOR UPDATE
    USING (true);
