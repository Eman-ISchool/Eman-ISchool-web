-- ============================================
-- EDUVERSE PASSWORD RESET TOKEN CLEANUP
-- Date: 2026-02-26
-- ============================================

-- 1. Create a function to clean up expired password reset tokens
CREATE OR REPLACE FUNCTION cleanup_expired_password_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM password_resets
    WHERE expires_at < NOW();
    
    RAISE NOTICE 'Deleted % expired password reset tokens', ROW_COUNT;
END;
$$ LANGUAGE plpgsql;

-- 2. Create an index on expires_at for better performance
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);

-- 3. Schedule cleanup job to run every hour
-- Note: This requires pg_cron extension. If not available, 
-- you can run the function manually or use a separate cron job.
DO $$
BEGIN
    -- Try to create the extension if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        CREATE EXTENSION IF NOT EXISTS pg_cron;
    END IF;
    
    -- Schedule cleanup every hour (at minute 0)
    SELECT cron.schedule(
        'cleanup-expired-password-tokens',
        '0 * * * *',
        $$SELECT cleanup_expired_password_tokens();$$
    );
    
    RAISE NOTICE 'Password token cleanup scheduled to run hourly';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not schedule pg_cron job. Extension may not be available. Run cleanup_expired_password_tokens() manually or use external cron.';
END $$;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION cleanup_expired_password_tokens() IS 'Deletes expired password reset tokens from the password_resets table';
COMMENT ON INDEX idx_password_resets_expires_at IS 'Index on expires_at column for efficient cleanup queries';

-- ============================================
-- ALTERNATIVE: Manual cleanup endpoint
-- If pg_cron is not available, you can create an API endpoint
-- that calls this function periodically (e.g., daily)
-- Example: POST /api/admin/cleanup/password-tokens
-- ============================================
