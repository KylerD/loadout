import fs from 'fs/promises';
import path from 'path';
import type { Integration } from '../types.js';
import { postmarkTemplates } from '../templates/postmark.js';

export const postmarkIntegration: Integration = {
  id: 'postmark',
  name: 'Postmark',
  description: 'Transactional email',
  packages: ['postmark'],
  envVars: [
    {
      key: 'POSTMARK_SERVER_TOKEN',
      description: 'Postmark server token',
      example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    },
    {
      key: 'POSTMARK_FROM_EMAIL',
      description: 'Default from email address',
      example: 'hello@yourdomain.com',
    },
  ],
  setup: async (projectPath: string) => {
    // Create email service
    await fs.mkdir(path.join(projectPath, 'services'), { recursive: true });
    await fs.writeFile(
      path.join(projectPath, 'services/email.service.ts'),
      postmarkTemplates.emailService
    );

    // Create email templates in components/emails
    await fs.mkdir(path.join(projectPath, 'components/emails'), { recursive: true });
    await fs.writeFile(
      path.join(projectPath, 'components/emails/welcome.tsx'),
      postmarkTemplates.welcomeEmail
    );

    // Create API route
    await fs.mkdir(path.join(projectPath, 'app/api/email/send'), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(projectPath, 'app/api/email/send/route.ts'),
      postmarkTemplates.sendRoute
    );
  },
};
