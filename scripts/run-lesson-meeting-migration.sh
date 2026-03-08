#!/bin/bash

# Database Migration Script for Supabase
# Adds meeting metadata columns to lessons table
# Feature: Platform Bug Fix & Hardening (001-fix-platform-issues)

echo "🔄 Starting database migration for lesson meeting metadata..."
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Check required environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Missing required environment variables"
    echo "   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
SERVICE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

# SQL to execute
SQL_QUERY="ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS meeting_title TEXT,
  ADD COLUMN IF NOT EXISTS meeting_provider TEXT
    CHECK (meeting_provider IN ('google_meet', 'zoom', 'teams', 'other')),
  ADD COLUMN IF NOT EXISTS meeting_duration_min INTEGER
    CHECK (meeting_duration_min > 0);"

echo "📝 Executing SQL migration..."
echo ""

# Execute via Supabase REST API
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \n  -H "apikey: ${SERVICE_KEY}" \n  -H "Authorization: Bearer ${SERVICE_KEY}" \n  -H "Content-Type: application/json" \n  -d "{"query": "${SQL_QUERY}"}"

echo ""
echo ""
echo "✅ Migration script executed!"
echo ""
echo "To verify, check your Supabase dashboard or run:"
echo "SELECT column_name FROM information_schema.columns WHERE table_name = 'lessons' AND column_name IN ('meeting_title', 'meeting_provider', 'meeting_duration_min');"
