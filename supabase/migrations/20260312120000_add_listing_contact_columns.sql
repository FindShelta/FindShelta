-- Ensure listing and profile contact columns exist across the tables
-- the app relies on for agent contact details.

BEGIN;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

ALTER TABLE public.agent_registration
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS phone_no TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_link TEXT;

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS agent_name TEXT,
  ADD COLUMN IF NOT EXISTS agent_whatsapp TEXT;

CREATE INDEX IF NOT EXISTS idx_listings_agent_whatsapp
  ON public.listings (agent_whatsapp);

-- Backfill whatsapp number on public.users from auth metadata when available.
UPDATE public.users AS u
SET whatsapp_number = COALESCE(
  NULLIF(u.whatsapp_number, ''),
  NULLIF(au.raw_user_meta_data ->> 'whatsapp_number', '')
)
FROM auth.users AS au
WHERE au.id = u.id
  AND COALESCE(u.whatsapp_number, '') = '';

-- Link agent registrations to auth users where possible.
UPDATE public.agent_registration AS ar
SET user_id = au.id
FROM auth.users AS au
WHERE ar.user_id IS NULL
  AND lower(ar.email) = lower(au.email);

-- Normalize phone fields inside agent_registration.
UPDATE public.agent_registration
SET
  phone = COALESCE(NULLIF(phone, ''), NULLIF(phone_no, '')),
  phone_no = COALESCE(NULLIF(phone_no, ''), NULLIF(phone, ''))
WHERE COALESCE(phone, '') = ''
   OR COALESCE(phone_no, '') = '';

-- Fill whatsapp_link from the normalized phone when missing.
UPDATE public.agent_registration
SET whatsapp_link = 'https://wa.me/' || regexp_replace(COALESCE(phone, phone_no), '[^0-9]', '', 'g')
WHERE COALESCE(whatsapp_link, '') = ''
  AND COALESCE(phone, phone_no, '') <> '';

-- Backfill listing contact/name data from users, agent_registration, then auth metadata.
UPDATE public.listings AS l
SET
  agent_name = COALESCE(
    NULLIF(l.agent_name, ''),
    NULLIF(u.full_name, ''),
    NULLIF(ar.full_name, ''),
    NULLIF(au.raw_user_meta_data ->> 'name', ''),
    au.email,
    'Agent'
  ),
  agent_whatsapp = COALESCE(
    NULLIF(l.agent_whatsapp, ''),
    NULLIF(u.whatsapp_number, ''),
    NULLIF(ar.phone, ''),
    NULLIF(ar.phone_no, ''),
    NULLIF(au.raw_user_meta_data ->> 'whatsapp_number', '')
  )
FROM auth.users AS au
LEFT JOIN public.users AS u
  ON u.id = au.id
LEFT JOIN public.agent_registration AS ar
  ON ar.user_id = au.id
   OR lower(ar.email) = lower(au.email)
WHERE l.agent_id = au.id
  AND (
    COALESCE(l.agent_name, '') = ''
    OR COALESCE(l.agent_whatsapp, '') = ''
  );

COMMIT;
