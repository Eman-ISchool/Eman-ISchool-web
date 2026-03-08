-- Add meeting metadata columns to lessons table
-- Migration: 20260227_add_lesson_meeting_metadata.sql
-- Feature: Platform Bug Fix & Hardening (001-fix-platform-issues)

ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS meeting_title        TEXT,
  ADD COLUMN IF NOT EXISTS meeting_provider     TEXT
    CHECK (meeting_provider IN ('google_meet', 'zoom', 'teams', 'other')),
  ADD COLUMN IF NOT EXISTS meeting_duration_min INTEGER
    CHECK (meeting_duration_min > 0);
