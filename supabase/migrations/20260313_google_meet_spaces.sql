-- Google Meet account-linking and meeting-space persistence upgrades

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS google_email TEXT,
    ADD COLUMN IF NOT EXISTS google_connected_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_google_email
    ON public.users (google_email)
    WHERE google_email IS NOT NULL;

ALTER TABLE public.lesson_meetings
    ADD COLUMN IF NOT EXISTS space_name TEXT,
    ADD COLUMN IF NOT EXISTS meeting_uri TEXT,
    ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS owner_google_email TEXT,
    ADD COLUMN IF NOT EXISTS conference_record_name TEXT,
    ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS last_error TEXT;

-- Wrap data migration in a transaction for safety
DO $$
BEGIN
  UPDATE public.lesson_meetings
  SET
      meeting_uri = COALESCE(meeting_uri, meet_url),
      owner_user_id = COALESCE(owner_user_id, created_by_teacher_id),
      last_synced_at = COALESCE(last_synced_at, updated_at)
  WHERE
      (meeting_uri IS NULL OR owner_user_id IS NULL OR last_synced_at IS NULL)
      -- Skip rows that were already migrated (prevent re-migration)
      AND id NOT IN (
        SELECT id FROM public.lesson_meetings
        WHERE last_synced_at IS NOT NULL
        AND last_synced_at > updated_at
      );
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_lesson_meetings_space_name
    ON public.lesson_meetings (space_name)
    WHERE space_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lesson_meetings_owner_user
    ON public.lesson_meetings (owner_user_id)
    WHERE owner_user_id IS NOT NULL;
