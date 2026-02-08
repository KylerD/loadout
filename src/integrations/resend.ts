import fs from 'fs/promises';
import path from 'path';
import type { Integration } from '../types.js';
import { resendTemplates } from '../templates/resend.js';

export const resendIntegration: Integration = {
  id: 'resend',
  name: 'Resend',
  description: 'Email API',
  packages: ['resend'],
  envVars: [
    {
      key: 'RESEND_API_KEY',
      description: 'Resend API key',
      example: 're_...',
    },
    {
      key: 'RESEND_FROM_EMAIL',
      description: 'Default from email address',
      example: 'onboarding@resend.dev',
    },
  ],
  setup: async (projectPath: string) => {
    // Create email service
    await fs.mkdir(path.join(projectPath, 'services'), { recursive: true });
    await fs.writeFile(
      path.join(projectPath, 'services/email.service.ts'),
      resendTemplates.emailService
    );

    // Create email templates in components/emails
    await fs.mkdir(path.join(projectPath, 'components/emails'), { recursive: true });
    await fs.writeFile(
      path.join(projectPath, 'components/emails/welcome.tsx'),
      resendTemplates.welcomeEmail
    );

    // Create API route
    await fs.mkdir(path.join(projectPath, 'app/api/email/send'), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(projectPath, 'app/api/email/send/route.ts'),
      resendTemplates.sendRoute
    );
  },
};
