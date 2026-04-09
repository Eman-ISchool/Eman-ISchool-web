-- Add extended user profile fields for admin user management
-- These columns support the full Create User form (matching futurelab.school reference)

ALTER TABLE users ADD COLUMN IF NOT EXISTS base_salary NUMERIC;
ALTER TABLE users ADD COLUMN IF NOT EXISTS price_per_lesson NUMERIC;
ALTER TABLE users ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'AED';
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS previous_education TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_phone TEXT;
