-- Create Supabase Storage bucket for assignment submissions
-- Run this in Supabase SQL Editor

-- Create the submissions bucket (private, 10MB max file size)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('submissions', 'submissions', false, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Grant authenticated users access to upload/download their own submissions
-- Note: RLS policies should be set up separately for proper access control
-- This is a basic setup - adjust based on your security requirements

-- Allow authenticated users to upload files to their own folder
-- Expected folder structure: user-id/filename
-- Files must be uploaded to the user's own folder
CREATE POLICY "Authenticated users can upload submissions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'submissions'
  AND (name LIKE auth.uid()::text || '/%' OR name LIKE auth.uid()::text || '%')
);

-- Allow authenticated users to download their own files
-- More flexible to handle different folder structures
CREATE POLICY "Authenticated users can download own submissions"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'submissions'
  AND (name LIKE auth.uid()::text || '/%' OR name LIKE '%' || auth.uid()::text || '/%')
);

-- Allow teachers/admins to view all submissions
CREATE POLICY "Teachers and admins can view all submissions"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'submissions'
  AND (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('teacher', 'admin')
    )
  )
);
