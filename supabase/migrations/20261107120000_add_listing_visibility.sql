BEGIN;

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hidden_note text,
  ADD COLUMN IF NOT EXISTS hidden_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_listings_public_short_stays
  ON public.listings (property_type, location_city, created_at DESC)
  WHERE is_approved = true AND is_hidden = false;

DROP POLICY IF EXISTS "Anyone can view approved listings" ON public.listings;
CREATE POLICY "Anyone can view approved listings"
  ON public.listings
  FOR SELECT
  USING (is_approved = true AND is_hidden = false);

DROP POLICY IF EXISTS "Admins can manage all listings" ON public.listings;
CREATE POLICY "Admins can manage all listings"
  ON public.listings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

COMMIT;
