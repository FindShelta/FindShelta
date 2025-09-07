// Email Provider Configurations
// Choose one based on your preferred email service

interface EmailProvider {
  name: string;
  send: (data: EmailData) => Promise<boolean>;
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// 1. SendGrid Provider (Recommended for production)
export class SendGridProvider implements EmailProvider {
  name = 'SendGrid';
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_SENDGRID_API_KEY || '';
    this.fromEmail = import.meta.env.VITE_FROM_EMAIL || '';
  }

  async send(data: EmailData): Promise<boolean> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: data.to }],
            subject: data.subject
          }],
          from: { email: this.fromEmail },
          content: [
            { type: 'text/plain', value: data.text },
            { type: 'text/html', value: data.html }
          ]
        })
      });

      return response.ok;
    } catch (error) {
      console.error('SendGrid error:', error);
      return false;
    }
  }
}

// 2. Mailgun Provider
export class MailgunProvider implements EmailProvider {
  name = 'Mailgun';
  private apiKey: string;
  private domain: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_MAILGUN_API_KEY || '';
    this.domain = import.meta.env.VITE_MAILGUN_DOMAIN || '';
    this.fromEmail = import.meta.env.VITE_FROM_EMAIL || '';
  }

  async send(data: EmailData): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('from', this.fromEmail);
      formData.append('to', data.to);
      formData.append('subject', data.subject);
      formData.append('text', data.text);
      formData.append('html', data.html);

      const response = await fetch(`https://api.mailgun.net/v3/${this.domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${this.apiKey}`)}`
        },
        body: formData
      });

      return response.ok;
    } catch (error) {
      console.error('Mailgun error:', error);
      return false;
    }
  }
}

// 3. Resend Provider (Modern alternative)
export class ResendProvider implements EmailProvider {
  name = 'Resend';
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_RESEND_API_KEY || '';
    this.fromEmail = import.meta.env.VITE_FROM_EMAIL || '';
  }

  async send(data: EmailData): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [data.to],
          subject: data.subject,
          text: data.text,
          html: data.html
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Resend error:', error);
      return false;
    }
  }
}

// Factory function to get the configured provider
export function getEmailProvider(): EmailProvider {
  const provider = import.meta.env.VITE_EMAIL_PROVIDER || 'sendgrid';
  
  switch (provider.toLowerCase()) {
    case 'mailgun':
      return new MailgunProvider();
    case 'resend':
      return new ResendProvider();
    case 'sendgrid':
    default:
      return new SendGridProvider();
  }
}