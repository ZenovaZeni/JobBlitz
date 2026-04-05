-- Phase 2: Reconcile usage tracking
-- Adds per-feature counters and migrates existing sessions_used data.
-- Run this via Supabase MCP (AG) before deploying the Phase 2 code changes.

DO $$
BEGIN
  -- tailors_used: tracks monthly tailoring sessions per user
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'tailors_used'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN tailors_used integer NOT NULL DEFAULT 0;
    -- Preserve existing usage — sessions_used was the old tailor counter
    UPDATE public.profiles SET tailors_used = COALESCE(sessions_used, 0);
  END IF;

  -- cover_letters_used: tracks monthly cover letter generations per user
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'cover_letters_used'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN cover_letters_used integer NOT NULL DEFAULT 0;
  END IF;
END $$;
