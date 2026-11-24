# FindShelta authentication email hook

This Edge Function replaces Supabase's built-in authentication email delivery with Resend. Supabase still creates and validates the secure signup, recovery, invite, magic-link, email-change, and reauthentication tokens.

## Deploy

1. Set the existing Resend key and non-hook server-side settings. You can also set these under **Project Settings > Edge Functions > Secrets**:

   ```powershell
   npx supabase secrets set RESEND_API_KEY="your_resend_key" RESEND_FROM_EMAIL="FindShelta <noreply@findshelta.com>" PUBLIC_SITE_URL="https://findshelta.com" --project-ref vvtldnyxnqmfhlpascel
   ```

2. Deploy the unsigned webhook endpoint:

   ```powershell
   npx supabase functions deploy send-email --no-verify-jwt --project-ref vvtldnyxnqmfhlpascel
   ```

3. In Supabase, open **Authentication > Hooks** and create a **Send Email** HTTPS hook.
4. Use `https://vvtldnyxnqmfhlpascel.supabase.co/functions/v1/send-email` as the hook URL and select **Generate Secret**.
5. Before selecting **Create**, copy the generated value into an Edge Function secret named `SEND_EMAIL_HOOK_SECRET`. Keep the complete `v1,whsec_...` value.
6. Create the hook, then enable **Confirm email** under **Authentication > Providers > Email**.
7. Add `https://findshelta.com/verify-email` and the local development URL to **Authentication > URL Configuration > Redirect URLs**.

The Resend API key must be stored as `RESEND_API_KEY` in Supabase Edge Function secrets. Never use a `VITE_` prefix for a secret because Vite exposes those values to browser code.
