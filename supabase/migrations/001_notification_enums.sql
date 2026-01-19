-- ============================================
-- NOTIFICATION SYSTEM ENUMS
-- Migration: 001_notification_enums
-- ============================================

-- Drop existing types if they exist (for clean migration)
DROP TYPE IF EXISTS notification_channel CASCADE;
DROP TYPE IF EXISTS notification_status CASCADE;

-- ============================================
-- ENUMS
-- ============================================

-- Notification delivery channels
CREATE TYPE notification_channel AS ENUM (
    'email',
    'push',
    'sms',
    'in_app'
);

-- Notification delivery status
CREATE TYPE notification_status AS ENUM (
    'pending',
    'sent',
    'delivered',
    'failed',
    'read'
);
