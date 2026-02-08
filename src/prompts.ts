import { input, confirm } from '@inquirer/prompts';
import type { IntegrationId, ProjectConfig } from './types.js';

export async function getProjectConfig(): Promise<ProjectConfig> {
  const name = await input({
    message: 'Project name:',
    default: 'my-app',
    validate: (value) => {
      if (!value.trim()) return 'Project name is required';
      if (!/^[a-z0-9-]+$/.test(value)) {
        return 'Project name can only contain lowercase letters, numbers, and hyphens';
      }
      return true;
    },
  });

  const integrations: IntegrationId[] = [];

  // Authentication
  if (await confirm({ message: 'Add Clerk for authentication?', default: false })) {
    integrations.push('clerk');
  }

  // Database
  if (await confirm({ message: 'Add Neon + Drizzle for database?', default: false })) {
    integrations.push('neon-drizzle');
  }

  // AI
  if (await confirm({ message: 'Add Vercel AI SDK?', default: false })) {
    integrations.push('ai-sdk');
  }

  // Email
  if (await confirm({ message: 'Add Resend for email?', default: false })) {
    integrations.push('resend');
  }

  // Scraping
  if (await confirm({ message: 'Add Firecrawl for web scraping?', default: false })) {
    integrations.push('firecrawl');
  }

  // Background Jobs
  if (await confirm({ message: 'Add Inngest for background jobs?', default: false })) {
    integrations.push('inngest');
  }

  // File Uploads
  if (await confirm({ message: 'Add UploadThing for file uploads?', default: false })) {
    integrations.push('uploadthing');
  }

  // Payments
  if (await confirm({ message: 'Add Stripe for payments?', default: false })) {
    integrations.push('stripe');
  }

  // Analytics
  if (await confirm({ message: 'Add PostHog for analytics?', default: false })) {
    integrations.push('posthog');
  }

  // Error Tracking
  if (await confirm({ message: 'Add Sentry for error tracking?', default: false })) {
    integrations.push('sentry');
  }

  return { name, integrations };
}
