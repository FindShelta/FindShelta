-- Restore the complete listing workflow for public seekers and approved agents.
-- This migration is intentionally idempotent so it can repair environments that
-- received only part of the earlier listings policy changes.

BEGIN;

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS bedrooms integer,
  ADD COLUMN IF NOT EXISTS bathrooms integer;

GRANT SELECT ON public.listings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.listings TO authenticated;

CREATE OR REPLACE FUNCTION public.is_approved_agent(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.agent_registration AS registration
    WHERE registration.user_id = _user_id
      AND registration.status IN ('approved', 'approve')
  );
$$;

REVOKE ALL ON FUNCTION public.is_approved_agent(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_approved_agent(uuid) TO authenticated;

DROP POLICY IF EXISTS "Anyone can view approved listings" ON public.listings;
CREATE POLICY "Anyone can view approved listings"
  ON public.listings
  FOR SELECT
  TO anon, authenticated
  USING (is_approved = true AND COALESCE(is_hidden, false) = false);

DROP POLICY IF EXISTS "Agents can view own listings" ON public.listings;
DROP POLICY IF EXISTS "Agents can view their own listings" ON public.listings;
CREATE POLICY "Agents can view their own listings"
  ON public.listings
  FOR SELECT
  TO authenticated
  USING (agent_id = auth.uid());

DROP POLICY IF EXISTS "Agents can insert own listings" ON public.listings;
DROP POLICY IF EXISTS "Agents can insert their own listings" ON public.listings;
CREATE POLICY "Agents can insert their own listings"
  ON public.listings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    agent_id = auth.uid()
    AND public.is_approved_agent(auth.uid())
    AND COALESCE(is_approved, false) = false
    AND COALESCE(status, 'pending') = 'pending'
  );

DROP POLICY IF EXISTS "Agents can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Agents can update their own listings" ON public.listings;
CREATE POLICY "Agents can update their own listings"
  ON public.listings
  FOR UPDATE
  TO authenticated
  USING (agent_id = auth.uid())
  WITH CHECK (
    agent_id = auth.uid()
    AND public.is_approved_agent(auth.uid())
    AND COALESCE(is_approved, false) = false
    AND COALESCE(status, 'pending') = 'pending'
  );

DROP POLICY IF EXISTS "Agents can delete own listings" ON public.listings;
DROP POLICY IF EXISTS "Agents can delete their own listings" ON public.listings;
CREATE POLICY "Agents can delete their own listings"
  ON public.listings
  FOR DELETE
  TO authenticated
  USING (agent_id = auth.uid());

DROP POLICY IF EXISTS "Agents can read own registration by user id" ON public.agent_registration;
CREATE POLICY "Agents can read own registration by user id"
  ON public.agent_registration
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR email = auth.email());

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
CREATE POLICY "Public can view property images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Agents can upload property images" ON storage.objects;
CREATE POLICY "Agents can upload property images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_approved_agent(auth.uid())
  );

DROP POLICY IF EXISTS "Agents can update property images" ON storage.objects;
CREATE POLICY "Agents can update property images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_approved_agent(auth.uid())
  );

DROP POLICY IF EXISTS "Agents can delete property images" ON storage.objects;
CREATE POLICY "Agents can delete property images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

NOTIFY pgrst, 'reload schema';

COMMIT;
