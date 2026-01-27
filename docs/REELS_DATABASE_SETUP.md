# Database Setup Guide for Reels

This guide will help you set up the reels database tables in Supabase.

## Prerequisites

- Access to your Supabase Dashboard
- The migration file: `supabase/migrations/add_reels_tables.sql`

## Step-by-Step Instructions

### 1. Open Supabase Dashboard

Navigate to your Supabase project dashboard:
```
https://cxphxyblhvrupnmcmtoy.supabase.co
```

### 2. Access SQL Editor

1. In the left sidebar, click on **"SQL Editor"**
2. Click the **"New Query"** button

### 3. Copy Migration SQL

Open the migration file located at:
```
/Users/hazmy/ProgrammingProjects/2026/eduverse/supabase/migrations/add_reels_tables.sql
```

Copy the entire contents of this file.

### 4. Execute Migration

1. Paste the SQL into the SQL Editor
2. Click the **"Run"** button (or press Cmd/Ctrl + Enter)
3. Wait for the execution to complete

### 5. Verify Tables Created

After successful execution, verify the tables were created:

1. Go to **"Table Editor"** in the left sidebar
2. You should see these new tables:
   - `reels` - Stores educational video reels
   - `reel_progress` - Tracks student watch progress
   - `generation_logs` - Audit trail for AI generation

### 6. Seed Sample Data

After tables are created, you have two options to add sample data:

#### Option A: Use the Simulation API (Recommended)

The easiest way is to use the simulation API endpoint:

1. Open your browser's developer console (F12)
2. Navigate to http://localhost:3456/student/reels
3. Run this command in the console:

```javascript
fetch('/api/reels/simulate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ count: 10 })
})
.then(r => r.json())
.then(data => {
  console.log('Created reels:', data);
  window.location.reload();
});
```

#### Option B: Run the Seeding Script

If you have Node.js installed, you can run the seeding script:

```bash
# From the project root directory
node scripts/seed-reels.ts
```

To force recreate all reels:
```bash
node scripts/seed-reels.ts --force
```

## Troubleshooting

### Error: "relation does not exist"

This means the tables haven't been created yet. Make sure you:
1. Executed the migration SQL in the SQL Editor
2. Clicked "Run" and waited for completion
3. Checked for any error messages in the SQL Editor

### Error: "Failed to fetch reels"

If you still see this error after setup:
1. Verify tables exist in Table Editor
2. Check that sample data was inserted (should see rows in the `reels` table)
3. Refresh the browser page
4. Check browser console for detailed error messages

### No Reels Showing

If tables exist but no reels are showing:
1. Use the simulation API to create sample reels (Option A above)
2. Or run the seeding script (Option B above)
3. Verify reels are marked as `is_published = true` and `status = 'approved'`

## Next Steps

Once the database is set up and seeded:

1. Navigate to http://localhost:3456/student/reels
2. You should see the sample educational reels
3. Click on any reel to watch the video
4. The "Failed to fetch reels" error should be resolved

## Simulation Mode

The application now includes a simulation mode that works without the Nanobana API:

- When `NANO_BANANA_API_KEY` is empty or not set, simulation mode is automatically enabled
- The simulation API (`/api/reels/simulate`) can generate realistic mock reels
- Sample videos use publicly available educational content from Google
- All metadata is bilingual (English/Arabic)

To generate more reels at any time, use the simulation API as described in Option A above.
