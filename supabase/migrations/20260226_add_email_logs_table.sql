-- ============================================
-- EDUVERSE EMAIL LOGS MIGRATION
-- Date: 2026-02-26
-- Purpose: Track email sending for rate limiting
-- ============================================

-- Create email_logs table for rate limiting
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    to TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_email_logs_to ON email_logs(to);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);

-- Add RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access to email_logs" ON email_logs 
    FOR ALL USING (auth.role() = 'service_role');

-- Users can only see their own email logs (optional, for transparency)
CREATE POLICY "Users can view their own email logs" ON email_logs 
    FOR SELECT USING (to = (SELECT email FROM users WHERE id = auth.uid()));

-- Cleanup old logs (older than 7 days) - can be run as a scheduled job
-- This is optional and can be handled by a separate cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_email_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM email_logs 
    WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Comment on table
COMMENT ON TABLE email_logs IS 'Logs of emails sent for rate limiting purposes';
