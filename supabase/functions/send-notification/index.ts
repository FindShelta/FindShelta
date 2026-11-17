import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;

async function sendEmail(to: string, title: string, message: string) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@findshelta.com',
      to,
      subject: title,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;background:#f1f5f9;">
          <div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
            <img src="https://findshelta.com/findshelta-logo.png" width="48" height="48" style="border-radius:12px;display:block;margin:0 auto 16px;" />
            <h2 style="text-align:center;color:#0f172a;margin:0 0 8px;">${title}</h2>
            <p style="text-align:center;color:#64748b;margin:0 0 24px;">${message}</p>
            <div style="text-align:center;">
              <a href="https://findshelta.com/dashboard" style="background:#0ea5e9;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;">
                View on FindShelta
              </a>
            </div>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px;">© 2026 FindShelta · Nigeria</p>
        </div>
      `,
    }),
  });
}

async function sendPushNotification(
  endpoint: string,
  p256dh: string,
  auth: string,
  title: string,
  message: string
) {
  // Use web-push via fetch to the push endpoint
  // For Deno edge functions, we use the web-push protocol manually
  const payload = JSON.stringify({ title, message, url: '/dashboard' });

  // Import web-push compatible library for Deno
  const { default: webpush } = await import('npm:web-push@3.6.7');

  webpush.setVapidDetails('mailto:noreply@findshelta.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  await webpush.sendNotification({ endpoint, keys: { p256dh, auth } }, payload);
}

Deno.serve(async (req) => {
  try {
    const { record } = await req.json();

    if (!record?.user_id) {
      return new Response('Missing user_id', { status: 400 });
    }

    // Get user email
    const { data: userData } = await supabase.auth.admin.getUserById(record.user_id);
    const email = userData?.user?.email;

    // Send email notification
    if (email) {
      await sendEmail(email, record.title, record.message).catch(console.error);
    }

    // Get push subscriptions for this user
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', record.user_id);

    if (subscriptions?.length && VAPID_PRIVATE_KEY) {
      await Promise.allSettled(
        subscriptions.map((sub) =>
          sendPushNotification(sub.endpoint, sub.p256dh, sub.auth, record.title, record.message)
        )
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('send-notification error:', error);
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});
