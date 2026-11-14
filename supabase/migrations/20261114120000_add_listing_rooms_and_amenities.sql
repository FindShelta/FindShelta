-- Add structured room counts while keeping the existing amenity selections.
-- Nullable room counts preserve older listings until an agent updates them.

BEGIN;

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS bedrooms integer,
  ADD COLUMN IF NOT EXISTS bathrooms integer,
  ADD COLUMN IF NOT EXISTS amenities text[] DEFAULT '{}'::text[];

DO $$
BEGIN
  ALTER TABLE public.listings
    ADD CONSTRAINT listings_bedrooms_nonnegative
    CHECK (bedrooms IS NULL OR bedrooms >= 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE public.listings
    ADD CONSTRAINT listings_bathrooms_nonnegative
    CHECK (bathrooms IS NULL OR bathrooms >= 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

COMMENT ON COLUMN public.listings.bedrooms IS 'Number of bedrooms; zero can represent a studio.';
COMMENT ON COLUMN public.listings.bathrooms IS 'Number of bathrooms in the property.';
COMMENT ON COLUMN public.listings.amenities IS 'Amenity identifiers selected by the listing agent.';

NOTIFY pgrst, 'reload schema';

COMMIT;
