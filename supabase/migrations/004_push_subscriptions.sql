-- ============================================
-- PUSH SUBSCRIPTIONS TABLE
-- Migration: 004_push_subscriptions
-- ============================================

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS push_subscriptions CASCADE;

-- ============================================
-- TABLES
-- ============================================

-- Push Subscriptions Table
-- Stores web push subscription endpoints and keys per user/device for sending push notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    -- Push subscription data (from PushSubscription.toJSON())
    endpoint TEXT NOT NULL UNIQUE, -- Push service endpoint URL
    p256dh TEXT NOT NULL, -- Client public key for encryption (base64 encoded)
    auth TEXT NOT NULL, -- Authentication secret (base64 encoded)

    -- Device information
    user_agent TEXT, -- Browser user agent string for device identification
    device_name TEXT, -- Optional friendly device name (e.g., "John's MacBook Chrome")

    -- Subscription status
    active BOOLEAN DEFAULT TRUE, -- Whether subscription is currently active
    last_used_at TIMESTAMPTZ, -- Last time a notification was sent to this subscription

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Core lookup indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Active subscriptions for sending
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_active
    ON push_subscriptions(user_id, active)
    WHERE active = TRUE;

-- Timestamp indexes for cleanup
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_last_used ON push_subscriptions(last_used_at);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created ON push_subscriptions(created_at);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE push_subscriptions IS 'Stores web push notification subscription endpoints and encryption keys for each user device';
COMMENT ON COLUMN push_subscriptions.user_id IS 'Foreign key to users table - subscription owner';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'Push service endpoint URL from PushSubscription (unique per device/browser)';
COMMENT ON COLUMN push_subscriptions.p256dh IS 'Client public key for message encryption (P-256 ECDH, base64 encoded)';
COMMENT ON COLUMN push_subscriptions.auth IS 'Authentication secret for encryption (base64 encoded)';
COMMENT ON COLUMN push_subscriptions.user_agent IS 'Browser user agent string for identifying device/browser';
COMMENT ON COLUMN push_subscriptions.device_name IS 'Optional user-friendly device name for managing subscriptions';
COMMENT ON COLUMN push_subscriptions.active IS 'Whether subscription is active (inactive subscriptions should not receive notifications)';
COMMENT ON COLUMN push_subscriptions.last_used_at IS 'Timestamp of last successful notification sent to this subscription';

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row modification
CREATE TRIGGER trigger_update_push_subscriptions_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on the table
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own push subscriptions
CREATE POLICY push_subscriptions_select_own
    ON push_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own push subscriptions
CREATE POLICY push_subscriptions_insert_own
    ON push_subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own push subscriptions
CREATE POLICY push_subscriptions_update_own
    ON push_subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own push subscriptions
CREATE POLICY push_subscriptions_delete_own
    ON push_subscriptions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy: System/service can update any subscription (for delivery tracking and status updates)
-- Note: This allows the notification service to update last_used_at and active status
CREATE POLICY push_subscriptions_update_system
    ON push_subscriptions
    FOR UPDATE
    USING (true);
