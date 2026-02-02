-- Production Supabase migration (MVP)
-- Run this in Supabase Dashboard → SQL Editor for your PRODUCTION project.
-- Safe to re-run (uses IF EXISTS / IF NOT EXISTS where possible).

-- 1) Default language for new accounts + backfill existing profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'sl';

UPDATE public.profiles
SET language = 'sl'
WHERE language IS NULL OR language = '';

-- 2) SECURITY: fix mutable search_path warnings on functions
-- (Search path should be fixed, especially for SECURITY DEFINER functions.)

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_chat_thread_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.chat_threads
  SET last_message_at = NEW.created_at
  WHERE job_id = NEW.job_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, phone, specialties, language)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NEW.raw_user_meta_data->>'phone',
    CASE
      WHEN jsonb_typeof(NEW.raw_user_meta_data->'specialties') = 'array'
        THEN ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'specialties'))
      ELSE '{}'::text[]
    END,
    'sl'
  );
  RETURN NEW;
END;
$$;

-- 3) SECURITY: ensure jobs UPDATE policy is not permissive
-- If Supabase linter ever flags "Job owners can update their jobs" as always true,
-- this fixes it by dropping and recreating with strict checks.

DROP POLICY IF EXISTS "Job owners can update their jobs" ON public.jobs;

CREATE POLICY "Job owners can update their jobs" ON public.jobs
  FOR UPDATE
  USING (
    (SELECT auth.uid()) = client_id OR (SELECT auth.uid()) = provider_id
  )
  WITH CHECK (
    (SELECT auth.uid()) = client_id OR (SELECT auth.uid()) = provider_id
  );

-- 4) PUBLIC: completed job category counts (safe aggregate for public provider profiles)
CREATE OR REPLACE FUNCTION public.get_provider_completed_job_category_counts(provider_id uuid)
RETURNS TABLE(name text, count integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(j.category, 'Other')::text AS name,
    COUNT(*)::int AS count
  FROM public.jobs j
  WHERE j.provider_id = $1
    AND j.status = 'completed'
  GROUP BY COALESCE(j.category, 'Other')
  ORDER BY COUNT(*) DESC, COALESCE(j.category, 'Other') ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_provider_completed_job_category_counts(uuid) TO anon, authenticated;


