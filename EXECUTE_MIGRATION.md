# Database Migration Instructions

## Phase 1: Platform Upgrade (2026-02-11)

This migration upgrades the Eduverse platform to support Parents, Payments, Support Tickets, and improved Assignments.

### 1. Apply Migration
Run the contents of `supabase/migrations/20260211_platform_upgrade.sql` in your Supabase SQL Editor.

This script will:
- Update `user_role` ENUM to include 'parent'.
- Update `enrollment_status` ENUM.
- Create 13 new tables (invoices, payments, support_tickets, etc.).
- Update existing tables (users, courses, lessons, enrollments).
- Add necessary RLS policies and indexes.
- Add helper functions for ID generation and discounts.

### 2. Verify Changes
After running the script, verify that:
- The `users` table has `password_hash`, `email_verified`, `stripe_customer_id` columns.
- The `parent_student` table exists.
- The `invoices` table exists.
- The `user_role` type includes 'parent'.

### 3. Update Environment Environment
Ensure your `.env.local` has the necessary keys (Stripe, etc.) if not already present, though strictly for the schema migration, no new env vars are needed immediately for the DB to work.

### 4. Troubleshooting
If you encounter "enum already exists" errors, the script uses `IF NOT EXISTS` but sometimes manual intervention is needed for enum modifications in Supabase.
If you encounter RLS errors, verify you are running the script as a superuser/admin.
