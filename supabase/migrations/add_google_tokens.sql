-- Migration: Add Google OAuth token storage columns
-- This allows us to store and refresh Google tokens for Meet creation

ALTER TABLE users ADD COLUMN IF NOT EXISTS google_access_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_token_expires_at TIMESTAMPTZ;

-- Create index for quick token lookups
CREATE INDEX IF NOT EXISTS idx_users_google_token_expires ON users(google_token_expires_at) WHERE google_access_token IS NOT NULL;

COMMENT ON COLUMN users.google_access_token IS 'Google OAuth access token for API calls';
COMMENT ON COLUMN users.google_refresh_token IS 'Google OAuth refresh token for token renewal';
COMMENT ON COLUMN users.google_token_expires_at IS 'Expiration timestamp for the access token';
