BEGIN;

CREATE INDEX IF NOT EXISTS idx_listings_approved_created_at
  ON public.listings (is_approved, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listings_status_created_at
  ON public.listings (status, created_at DESC);

COMMIT;
