-- Correct legacy short-stay rates that were entered as abbreviated thousands
-- (for example, 120 instead of 120000), then prevent the same issue on writes.

BEGIN;

UPDATE public.listings
SET price = price * 1000
WHERE property_type = 'shortstay'
  AND price >= 100
  AND price < 1000;

ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS listings_shortstay_minimum_price;

ALTER TABLE public.listings
  ADD CONSTRAINT listings_shortstay_minimum_price
  CHECK (property_type <> 'shortstay' OR price >= 1000);

COMMIT;
