export const resendTemplates = {
  // Email service with constructor-based DI
  emailService: `import { Resend } from 'resend';
import type { ReactElement } from 'react';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
  replyTo?: string;
}

export class EmailService {
  private resend: Resend;
  private defaultFrom: string;

  constructor(apiKey: string, defaultFrom: string) {
    this.resend = new Resend(apiKey);
    this.defaultFrom = defaultFrom;
  }

  /**
   * Send an email using a React component template
   */
  async send(options: SendEmailOptions) {
    const { data, error } = await this.resend.emails.send({
      from: options.from || this.defaultFrom,
      to: options.to,
      subject: options.subject,
      react: options.react,
      replyTo: options.replyTo,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Send a welcome email to a new user
   */
  async sendWelcome(to: string, name: string) {
    const { WelcomeEmail } = await import('@/emails/welcome');
    return this.send({
      to,
      subject: 'Welcome!',
      react: WelcomeEmail({ name }),
    });
  }
}

// Export singleton instance
export const emailService = new EmailService(
  process.env.RESEND_API_KEY!,
  process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
);
`,

  welcomeEmail: `import * as React from 'react';

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h1 style={{ color: '#333' }}>Welcome, {name}!</h1>
      <p style={{ color: '#666', lineHeight: 1.6 }}>
        Thanks for signing up. We're excited to have you on board.
      </p>
      <p style={{ color: '#666', lineHeight: 1.6 }}>
        If you have any questions, feel free to reply to this email.
      </p>
    </div>
  );
}
`,

  sendRoute: `import { NextResponse } from 'next/server';
import { emailService } from '@/services/email.service';
import { z } from 'zod';

const sendEmailSchema = z.object({
  to: z.email(),
  name: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, name } = sendEmailSchema.parse(body);

    const data = await emailService.sendWelcome(to, name);

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}
`,
};
