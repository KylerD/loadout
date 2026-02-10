export const postmarkTemplates = {
  emailService: `import { ServerClient } from 'postmark';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { POSTMARK_SERVER_TOKEN, POSTMARK_FROM_EMAIL } from '@/lib/config';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
  replyTo?: string;
}

export class EmailService {
  private client: ServerClient;
  private defaultFrom: string;

  constructor(serverToken: string, defaultFrom: string) {
    this.client = new ServerClient(serverToken);
    this.defaultFrom = defaultFrom;
  }

  async send(options: SendEmailOptions) {
    const htmlBody = renderToStaticMarkup(options.react);
    const to = Array.isArray(options.to) ? options.to.join(',') : options.to;

    const result = await this.client.sendEmail({
      From: options.from || this.defaultFrom,
      To: to,
      Subject: options.subject,
      HtmlBody: htmlBody,
      ReplyTo: options.replyTo,
      MessageStream: 'outbound',
    });

    return { id: result.MessageID };
  }

  async sendWelcome(to: string, name: string) {
    const { WelcomeEmail } = await import('@/components/emails/welcome');
    return this.send({
      to,
      subject: 'Welcome!',
      react: WelcomeEmail({ name }),
    });
  }
}

export const emailService = new EmailService(POSTMARK_SERVER_TOKEN, POSTMARK_FROM_EMAIL);
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
