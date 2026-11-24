import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';

type EmailActionType =
  | 'signup'
  | 'recovery'
  | 'invite'
  | 'magiclink'
  | 'email_change'
  | 'reauthentication';

interface HookPayload {
  user: {
    email: string;
    new_email?: string;
    user_metadata?: {
      name?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: EmailActionType;
    token_new?: string;
    token_hash_new?: string;
  };
}

interface EmailDelivery {
  to: string;
  token: string;
  tokenHash: string;
}

const jsonResponse = (body: unknown, status = 200, extraHeaders?: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] as string);

const getEmailCopy = (action: EmailActionType) => {
  const copy = {
    signup: {
      preview: 'Confirm your FindShelta account',
      subject: 'Verify your FindShelta account',
      eyebrow: 'WELCOME TO FINDSHELTA',
      title: 'Confirm your email address',
      body: 'One quick step and your account is ready. Confirm your email to securely start finding your next stay.',
      button: 'Verify email address',
      note: 'This verification link can only be used once.',
    },
    recovery: {
      preview: 'Reset your FindShelta password',
      subject: 'Reset your FindShelta password',
      eyebrow: 'PASSWORD RESET',
      title: 'Choose a new password',
      body: 'We received a request to reset your password. Use the secure link below to continue.',
      button: 'Reset password',
      note: "If you didn't request this, you can safely ignore this email.",
    },
    invite: {
      preview: 'You have been invited to FindShelta',
      subject: 'You have been invited to FindShelta',
      eyebrow: 'YOU ARE INVITED',
      title: 'Join FindShelta',
      body: 'Your FindShelta account is waiting. Accept the invitation to finish setting it up.',
      button: 'Accept invitation',
      note: 'This invitation is intended only for this email address.',
    },
    magiclink: {
      preview: 'Your secure FindShelta sign-in link',
      subject: 'Your FindShelta sign-in link',
      eyebrow: 'SECURE SIGN IN',
      title: 'Sign in to FindShelta',
      body: 'Use the secure link below to sign in. You do not need to enter a password.',
      button: 'Sign in securely',
      note: 'This sign-in link can only be used once.',
    },
    email_change: {
      preview: 'Confirm your new FindShelta email address',
      subject: 'Confirm your FindShelta email address',
      eyebrow: 'EMAIL UPDATE',
      title: 'Confirm your email change',
      body: 'Confirm this email address to complete the update to your FindShelta account.',
      button: 'Confirm email change',
      note: "If you didn't request this change, please contact support@findshelta.com.",
    },
    reauthentication: {
      preview: 'Your FindShelta verification code',
      subject: 'Your FindShelta verification code',
      eyebrow: 'SECURITY CHECK',
      title: 'Confirm it is you',
      body: 'Use the verification code below to continue this sensitive action.',
      button: 'Continue securely',
      note: 'Never share this code with anyone, including FindShelta support.',
    },
  };

  return copy[action] ?? copy.signup;
};

const getDeliveries = (payload: HookPayload): EmailDelivery[] => {
  const { user, email_data: emailData } = payload;

  if (emailData.email_action_type !== 'email_change') {
    return [{
      to: user.email,
      token: emailData.token,
      tokenHash: emailData.token_hash,
    }];
  }

  // Supabase reverses the hash field names for secure email changes for
  // backwards compatibility. The current address receives token_hash_new,
  // while the new address receives token_hash.
  if (emailData.token_hash_new && user.new_email) {
    return [
      {
        to: user.email,
        token: emailData.token,
        tokenHash: emailData.token_hash_new,
      },
      {
        to: user.new_email,
        token: emailData.token_new || emailData.token,
        tokenHash: emailData.token_hash,
      },
    ];
  }

  return [{
    to: user.new_email || user.email,
    token: emailData.token_new || emailData.token,
    tokenHash: emailData.token_hash,
  }];
};

const createActionUrl = (tokenHash: string, action: EmailActionType, redirectTo: string) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  if (!supabaseUrl) throw new Error('SUPABASE_URL is not configured');

  const verifyUrl = new URL('/auth/v1/verify', supabaseUrl);
  verifyUrl.searchParams.set('token', tokenHash);
  verifyUrl.searchParams.set('type', action);
  verifyUrl.searchParams.set('redirect_to', redirectTo);
  return verifyUrl.toString();
};

const renderEmail = (
  payload: HookPayload,
  delivery: EmailDelivery,
  actionUrl: string,
  publicSiteUrl: string,
) => {
  const action = payload.email_data.email_action_type;
  const copy = getEmailCopy(action);
  const rawDisplayName = payload.user.user_metadata?.name;
  const displayName = typeof rawDisplayName === 'string' ? rawDisplayName.trim() : '';
  const greeting = displayName ? `Hi ${escapeHtml(displayName)},` : 'Hello,';
  const safeActionUrl = escapeHtml(actionUrl);
  const logoUrl = `${publicSiteUrl.replace(/\/$/, '')}/findshelta-logo.png`;
  const codeBlock = action === 'reauthentication'
    ? `<div style="margin:28px 0;padding:18px 20px;border-radius:14px;background:#eff6ff;color:#1e3a8a;font-size:30px;font-weight:700;letter-spacing:8px;text-align:center;">${escapeHtml(delivery.token)}</div>`
    : '';

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${escapeHtml(copy.subject)}</title>
  </head>
  <body style="margin:0;background:#f5f7fb;color:#111827;font-family:'League Spartan',Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(copy.preview)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:32px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;background:#ffffff;border:1px solid #dfe3e8;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(30,58,138,.08);">
            <tr>
              <td style="padding:34px 38px 22px;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td><img src="${escapeHtml(logoUrl)}" width="52" height="52" alt="FindShelta" style="display:block;width:52px;height:52px;border:0;"></td>
                    <td style="padding-left:12px;color:#111827;font-size:24px;font-weight:700;letter-spacing:-.4px;">FindShelta</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 38px 38px;">
                <p style="margin:0 0 12px;color:#1d4ed8;font-size:12px;font-weight:700;letter-spacing:1.6px;">${escapeHtml(copy.eyebrow)}</p>
                <h1 style="margin:0 0 20px;color:#111827;font-size:34px;line-height:1.08;letter-spacing:-.7px;">${escapeHtml(copy.title)}</h1>
                <p style="margin:0 0 12px;color:#273244;font-size:17px;line-height:1.6;">${greeting}</p>
                <p style="margin:0;color:#5f6877;font-size:16px;line-height:1.65;">${escapeHtml(copy.body)}</p>
                ${codeBlock}
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:30px 0 24px;">
                  <tr>
                    <td style="border-radius:12px;background:#1d4ed8;">
                      <a href="${safeActionUrl}" style="display:inline-block;padding:15px 24px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">${escapeHtml(copy.button)}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;color:#697386;font-size:13px;line-height:1.55;">${escapeHtml(copy.note)}</p>
                <p style="margin:0;color:#8a94a4;font-size:12px;line-height:1.55;word-break:break-all;">Button not working? Copy and paste this link:<br><a href="${safeActionUrl}" style="color:#1d4ed8;">${safeActionUrl}</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 38px;background:#1e3a8a;color:#dbeafe;font-size:12px;line-height:1.6;">
                FindShelta &middot; Your trusted home-finding companion in Nigeria<br>
                Need help? <a href="mailto:support@findshelta.com" style="color:#ffffff;">support@findshelta.com</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${copy.title}\n\n${displayName ? `Hi ${displayName},` : 'Hello,'}\n\n${copy.body}\n\n${action === 'reauthentication' ? `Verification code: ${delivery.token}\n\n` : ''}${copy.button}: ${actionUrl}\n\n${copy.note}\n\nFindShelta`;

  return { subject: copy.subject, html, text };
};

const sendWithResend = async (delivery: EmailDelivery, subject: string, html: string, text: string) => {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured');

  const from = Deno.env.get('RESEND_FROM_EMAIL') || 'FindShelta <noreply@findshelta.com>';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [delivery.to],
      subject,
      html,
      text,
    }),
    signal: AbortSignal.timeout(4_000),
  });

  if (!response.ok) {
    const providerMessage = await response.text();
    throw new Error(`Resend rejected the email (${response.status}): ${providerMessage}`);
  }
};

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, { Allow: 'POST' });
  }

  const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET');
  if (!hookSecret) {
    console.error('send-email: SEND_EMAIL_HOOK_SECRET is not configured');
    return jsonResponse({ error: 'Email service is not configured' }, 500);
  }

  try {
    const rawPayload = await request.text();
    const webhook = new Webhook(hookSecret.replace('v1,whsec_', ''));
    const payload = webhook.verify(
      rawPayload,
      Object.fromEntries(request.headers),
    ) as HookPayload;

    const publicSiteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://findshelta.com';
    const deliveries = getDeliveries(payload);

    await Promise.all(deliveries.map(async (delivery) => {
      const actionUrl = createActionUrl(
        delivery.tokenHash,
        payload.email_data.email_action_type,
        payload.email_data.redirect_to,
      );
      const email = renderEmail(payload, delivery, actionUrl, publicSiteUrl);
      await sendWithResend(delivery, email.subject, email.html, email.text);
    }));

    return jsonResponse({});
  } catch (error) {
    console.error('send-email hook failed:', error instanceof Error ? error.message : String(error));
    return jsonResponse({
      error: {
        message: 'Unable to send authentication email',
      },
    }, 500);
  }
});
