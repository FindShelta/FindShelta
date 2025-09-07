# 📧 Email Service Setup Guide

This guide explains how to set up email delivery for password reset verification codes in your FindShelta web application.

## 🚀 Quick Setup Options

### Option 1: SendGrid (Recommended)
**Best for:** Production web applications, reliable delivery

1. **Create SendGrid Account:**
   - Go to [SendGrid.com](https://sendgrid.com)
   - Sign up for free account (100 emails/day free)

2. **Get API Key:**
   - Dashboard → Settings → API Keys
   - Create new API key with "Mail Send" permissions
   - Copy the API key

3. **Configure Environment:**
   ```bash
   VITE_SENDGRID_API_KEY=your_sendgrid_api_key_here
   VITE_FROM_EMAIL=noreply@yourdomain.com
   VITE_EMAIL_PROVIDER=sendgrid
   ```

### Option 2: Resend (Modern Alternative)
**Best for:** Developers, modern API

1. **Create Resend Account:**
   - Go to [Resend.com](https://resend.com)
   - Sign up (3,000 emails/month free)

2. **Get API Key:**
   - Dashboard → API Keys → Create
   - Copy the API key

3. **Configure Environment:**
   ```bash
   VITE_RESEND_API_KEY=your_resend_api_key_here
   VITE_FROM_EMAIL=noreply@yourdomain.com
   VITE_EMAIL_PROVIDER=resend
   ```

### Option 3: Mailgun
**Best for:** High volume, advanced features

1. **Create Mailgun Account:**
   - Go to [Mailgun.com](https://mailgun.com)
   - Sign up for free account

2. **Get Credentials:**
   - Dashboard → Domains → Select domain
   - Copy API key and domain name

3. **Configure Environment:**
   ```bash
   VITE_MAILGUN_API_KEY=your_mailgun_api_key_here
   VITE_MAILGUN_DOMAIN=your_domain.mailgun.org
   VITE_FROM_EMAIL=noreply@yourdomain.com
   VITE_EMAIL_PROVIDER=mailgun
   ```

## 🔧 Environment Configuration

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Add your email service credentials to `.env`:**
   ```bash
   # Choose one email provider
   VITE_SENDGRID_API_KEY=your_api_key_here
   VITE_FROM_EMAIL=noreply@yourdomain.com
   VITE_EMAIL_PROVIDER=sendgrid
   ```

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

## 📋 Testing Email Delivery

### Development Mode:
- Verification codes are shown in browser console
- No actual emails sent (saves API quota)

### Production Mode:
- Real emails sent to users
- Codes hidden from UI for security

### Test the Flow:
1. Go to login page
2. Click "Forgot Password?"
3. Enter a real email address
4. Check email inbox for verification code
5. Enter code to reset password

## 🛠️ Troubleshooting

### Common Issues:

**"Failed to send email"**
- Check API key is correct
- Verify email provider is configured
- Check network connectivity

**"Email not received"**
- Check spam/junk folder
- Verify email address is correct
- Check email service dashboard for delivery logs

**"Invalid API key"**
- Regenerate API key in provider dashboard
- Update .env file with new key
- Restart development server

### Debug Mode:
Add this to see detailed email logs:
```bash
VITE_DEBUG_EMAIL=true
```

## 🔒 Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables for all credentials**
3. **Rotate API keys regularly**
4. **Monitor email delivery rates**
5. **Set up proper SPF/DKIM records for your domain**

## 📊 Email Templates

The system includes professional email templates with:
- ✅ Responsive HTML design
- ✅ Dark mode support
- ✅ Security warnings
- ✅ Branded styling
- ✅ Plain text fallback

## 🚀 Production Deployment

For production deployment:

1. **Set production environment variables**
2. **Configure custom domain for emails**
3. **Set up email authentication (SPF, DKIM)**
4. **Monitor delivery rates and bounces**
5. **Set up email analytics**

## 💡 Tips for Better Delivery

1. **Use a custom domain** (not Gmail/Yahoo)
2. **Set up proper DNS records**
3. **Start with low volume** to build reputation
4. **Monitor bounce rates**
5. **Include unsubscribe links** (for marketing emails)

---

**Need help?** Check the email provider's documentation or contact their support team.