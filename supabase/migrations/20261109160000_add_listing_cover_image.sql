-- Add a lightweight image URL for listing feeds. The full images array remains
-- available for detail views, while feeds can avoid transferring legacy base64
-- payloads that exceed the PostgREST statement timeout.

BEGIN;

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS cover_image_url text;

UPDATE public.listings
SET cover_image_url = images[1]
WHERE cover_image_url IS NULL
  AND images[1] ~* '^https?://';

CREATE OR REPLACE FUNCTION public.sync_listing_cover_image_url()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.images[1] ~* '^https?://' THEN
    NEW.cover_image_url := NEW.images[1];
  ELSE
    NEW.cover_image_url := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_listing_cover_image_url_on_write ON public.listings;
CREATE TRIGGER sync_listing_cover_image_url_on_write
BEFORE INSERT OR UPDATE OF images ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.sync_listing_cover_image_url();

COMMENT ON COLUMN public.listings.cover_image_url IS
  'Public Storage URL for lightweight listing feeds; synchronized from images[1] when it is an HTTP URL.';

GRANT SELECT (cover_image_url) ON public.listings TO anon, authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
