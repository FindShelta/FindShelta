BEGIN;

-- Keep this specific account in sync with public.admin_users so RLS-backed
-- admin actions continue to work even if the user signs up after deployment.
CREATE OR REPLACE FUNCTION public.sync_shoppermonique_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF lower(COALESCE(NEW.email, '')) = 'shoppermonique20@gmail.com' THEN
    UPDATE public.admin_users
    SET
      user_id = NEW.id,
      email = lower(NEW.email)
    WHERE user_id = NEW.id
       OR lower(email) = 'shoppermonique20@gmail.com';

    IF NOT FOUND THEN
      INSERT INTO public.admin_users (user_id, email)
      VALUES (NEW.id, lower(NEW.email));
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_sync_shoppermonique_admin ON auth.users;

CREATE TRIGGER on_auth_user_sync_shoppermonique_admin
AFTER INSERT OR UPDATE OF email ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_shoppermonique_admin_user();

WITH matching_user AS (
  SELECT id, lower(email) AS email
  FROM auth.users
  WHERE lower(email) = 'shoppermonique20@gmail.com'
  LIMIT 1
),
updated AS (
  UPDATE public.admin_users AS admin_user
  SET
    user_id = matching_user.id,
    email = matching_user.email
  FROM matching_user
  WHERE admin_user.user_id = matching_user.id
     OR lower(admin_user.email) = matching_user.email
  RETURNING admin_user.id
)
INSERT INTO public.admin_users (user_id, email)
SELECT matching_user.id, matching_user.email
FROM matching_user
WHERE NOT EXISTS (SELECT 1 FROM updated);

COMMIT;
