#!/bin/bash

# Database Migration Script for Supabase
# Adds class_id column to reels table

echo "🔄 Starting database migration..."
echo ""

# Supabase credentials
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-${SUPABASE_URL:-}}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-${SUPABASE_SERVICE_KEY:-}}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_KEY" ]; then
  echo "Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
  exit 1
fi

# SQL to execute
SQL_QUERY="DO \$\$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reels' AND column_name = 'class_id'
    ) THEN
        ALTER TABLE reels ADD COLUMN class_id UUID REFERENCES lessons(id) ON DELETE SET NULL;
        CREATE INDEX idx_reels_class ON reels(class_id);
        COMMENT ON COLUMN reels.class_id IS 'Optional reference to the class/lesson this reel belongs to';
    END IF;
END \$\$;"

echo "📝 Executing SQL migration..."
echo ""

# Execute via Supabase REST API
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"${SQL_QUERY}\"}"

echo ""
echo ""
echo "✅ Migration script executed!"
echo ""
echo "To verify, check your Supabase dashboard or run:"
echo "SELECT column_name FROM information_schema.columns WHERE table_name = 'reels' AND column_name = 'class_id';"
