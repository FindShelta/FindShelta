interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface PasswordResetEmailData {
  email: string;
  verificationCode: string;
  expiresIn: number;
}

interface PasswordChangeConfirmationData {
  email: string;
  timestamp: string;
}

export class EmailService {
  private static instance: EmailService;
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_RESEND_API_KEY || '';
    this.fromEmail = 'noreply@findshelta.com';
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async sendEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
    if (!this.apiKey) {
      console.log('📧 Email (no API key):', { to, subject });
      return true;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: this.fromEmail, to, subject, html, text }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Resend API error: ${response.status} ${err}`);
    }

    return true;
  }

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
    const template = this.getPasswordResetTemplate(data);
    try {
      return await this.sendEmail(data.email, template.subject, template.html, template.text);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  async sendPasswordChangeConfirmation(data: PasswordChangeConfirmationData): Promise<boolean> {
    const template = this.getPasswordChangeTemplate(data);
    try {
      return await this.sendEmail(data.email, template.subject, template.html, template.text);
    } catch (error) {
      console.error('Failed to send password change confirmation:', error);
      return false;
    }
  }

  private getPasswordResetTemplate(data: PasswordResetEmailData): EmailTemplate {
    const subject = 'Reset Your FindShelta Password';
    const logoUrl = `${import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin}/findshelta-logo.png`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .code { font-size: 32px; font-weight: bold; color: #3B82F6; text-align: center;
                  background: white; padding: 20px; border-radius: 8px; margin: 20px 0;
                  letter-spacing: 8px; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" width="72" height="72" alt="FindShelta" style="display:block;margin:0 auto 12px;border-radius:14px;" />
            <h1>FindShelta</h1>
            <p>Password Reset Request</p>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password. Use the verification code below to proceed:</p>
            <div class="code">${data.verificationCode}</div>
            <p><strong>This code will expire in ${data.expiresIn} minutes.</strong></p>
            <div class="warning">
              <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email.
              Your account remains secure.
            </div>
            <p>For security reasons, never share this code with anyone.</p>
          </div>
          <div class="footer">
            <p>© 2026 FindShelta. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      FindShelta - Password Reset Request

      Verification Code: ${data.verificationCode}

      This code will expire in ${data.expiresIn} minutes.

      If you didn't request this, please ignore this email.

      © 2026 FindShelta. All rights reserved.
    `;

    return { subject, html, text };
  }

  private getPasswordChangeTemplate(data: PasswordChangeConfirmationData): EmailTemplate {
    const subject = 'Password Successfully Changed - FindShelta';
    const logoUrl = `${import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin}/findshelta-logo.png`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .success { background: #D1FAE5; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" width="72" height="72" alt="FindShelta" style="display:block;margin:0 auto 12px;border-radius:14px;" />
            <h1>FindShelta</h1>
            <p>Password Changed Successfully</p>
          </div>
          <div class="content">
            <div class="success">
              <strong>✅ Success!</strong> Your password has been successfully changed.
            </div>
            <p>Your FindShelta account password was changed on ${data.timestamp}.</p>
            <p>If you didn't make this change, please contact our support team immediately.</p>
          </div>
          <div class="footer">
            <p>© 2026 FindShelta. All rights reserved.</p>
            <p>Need help? Contact support@findshelta.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      FindShelta - Password Changed Successfully

      Your password was changed on ${data.timestamp}.

      If you didn't make this change, contact support@findshelta.com immediately.

      © 2026 FindShelta. All rights reserved.
    `;

    return { subject, html, text };
  }
}

export const emailService = EmailService.getInstance();
