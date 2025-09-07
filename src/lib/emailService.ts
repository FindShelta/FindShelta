// Email Service for Password Recovery
// In production, integrate with services like SendGrid, Mailgun, or AWS SES

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface PasswordResetEmailData {
  email: string;
  verificationCode: string;
  expiresIn: number; // minutes
}

interface PasswordChangeConfirmationData {
  email: string;
  timestamp: string;
}

export class EmailService {
  private static instance: EmailService;
  private apiKey: string;
  private fromEmail: string;
  private isProduction: boolean;

  constructor() {
    // In production, get these from environment variables
    this.apiKey = import.meta.env.VITE_EMAIL_API_KEY || '';
    this.fromEmail = import.meta.env.VITE_FROM_EMAIL || 'noreply@findshelter.com';
    this.isProduction = import.meta.env.PROD === 'true';
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Send password reset verification code
  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
    const template = this.getPasswordResetTemplate(data);
    
    try {
      if (this.isProduction && this.apiKey) {
        // Production: Send actual email using SendGrid web API
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: data.email }],
              subject: template.subject
            }],
            from: { email: this.fromEmail },
            content: [
              { type: 'text/plain', value: template.text },
              { type: 'text/html', value: template.html }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`SendGrid API error: ${response.status}`);
        }

        return true;
      } else {
        // Development: Log to console and simulate
        console.log('📧 Password Reset Email (DEV MODE):', {
          to: data.email,
          subject: template.subject,
          code: data.verificationCode
        });

        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      }

    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  // Send password change confirmation
  async sendPasswordChangeConfirmation(data: PasswordChangeConfirmationData): Promise<boolean> {
    const template = this.getPasswordChangeTemplate(data);
    
    try {
      console.log('📧 Password Change Confirmation:', {
        to: data.email,
        subject: template.subject
      });

      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      console.error('Failed to send password change confirmation:', error);
      return false;
    }
  }

  private getPasswordResetTemplate(data: PasswordResetEmailData): EmailTemplate {
    const subject = 'Reset Your FindShelter Password';
    
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
            <h1>🏠 FindShelter</h1>
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
            <p>© 2024 FindShelter. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      FindShelter - Password Reset Request
      
      We received a request to reset your password.
      
      Verification Code: ${data.verificationCode}
      
      This code will expire in ${data.expiresIn} minutes.
      
      If you didn't request this password reset, please ignore this email.
      
      For security reasons, never share this code with anyone.
      
      © 2024 FindShelter. All rights reserved.
    `;

    return { subject, html, text };
  }

  private getPasswordChangeTemplate(data: PasswordChangeConfirmationData): EmailTemplate {
    const subject = 'Password Successfully Changed - FindShelter';
    
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
            <h1>FindShelter</h1>
            <p>Password Changed Successfully</p>
          </div>
          
          <div class="content">
            <div class="success">
              <strong>✅ Success!</strong> Your password has been successfully changed.
            </div>
            
            <p>Your FindShelter account password was changed on ${data.timestamp}.</p>
            
            <p>If you didn't make this change, please contact our support team immediately.</p>
            
            <p>For your security:</p>
            <ul>
              <li>Never share your password with anyone</li>
              <li>Use a strong, unique password</li>
              <li>Sign out of all devices if you suspect unauthorized access</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>© 2024 FindShelta. All rights reserved.</p>
            <p>Need help? Contact support@findshelta.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      FindShelta - Password Changed Successfully
      
      Your password has been successfully changed on ${data.timestamp}.
      
      If you didn't make this change, please contact our support team immediately.
      
      For your security:
      - Never share your password with anyone
      - Use a strong, unique password
      - Sign out of all devices if you suspect unauthorized access
      
      © 2024 FindShelta. All rights reserved.
      Need help? Contact support@findshelta.com
    `;

    return { subject, html, text };
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();