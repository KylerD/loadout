import { input, confirm, select } from '@inquirer/prompts';
import type { IntegrationId, ProjectConfig, AIProviderChoice } from './types.js';
import { validateProjectName } from './validate.js';

export interface AddIntegrationConfig {
  integrations: IntegrationId[];
  aiProvider?: AIProviderChoice;
}

export async function getProjectConfig(): Promise<ProjectConfig> {
  const name = await input({
    message: 'Project name:',
    default: 'my-app',
    validate: (value) => {
      const errors = validateProjectName(value);
      return errors.length > 0 ? errors[0].message : true;
    },
  });

  const integrations: IntegrationId[] = [];
  let aiProvider: AIProviderChoice | undefined;

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
    aiProvider = await select({
      message: 'Which AI provider?',
      choices: [
        { value: 'openai' as const, name: 'OpenAI (GPT-4o)' },
        { value: 'anthropic' as const, name: 'Anthropic (Claude)' },
        { value: 'google' as const, name: 'Google (Gemini)' },
      ],
    });
  }

  // Email
  if (await confirm({ message: 'Add email?', default: false })) {
    const emailProvider = await select({
      message: 'Which email provider?',
      choices: [
        { value: 'resend' as const, name: 'Resend (Modern DX, React Email templates)' },
        { value: 'postmark' as const, name: 'Postmark (Best-in-class deliverability, fast transactional email)' },
      ],
    });
    integrations.push(emailProvider);
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

  return { name, integrations, aiProvider };
}

const integrationPrompts: Record<IntegrationId, string> = {
  clerk: 'Add Clerk for authentication?',
  'neon-drizzle': 'Add Neon + Drizzle for database?',
  'ai-sdk': 'Add Vercel AI SDK?',
  resend: 'Add email?',
  postmark: 'Add email?',
  firecrawl: 'Add Firecrawl for web scraping?',
  inngest: 'Add Inngest for background jobs?',
  uploadthing: 'Add UploadThing for file uploads?',
  stripe: 'Add Stripe for payments?',
  posthog: 'Add PostHog for analytics?',
  sentry: 'Add Sentry for error tracking?',
};

export async function getAddIntegrationConfig(
  available: IntegrationId[]
): Promise<AddIntegrationConfig> {
  const integrations: IntegrationId[] = [];
  let aiProvider: AIProviderChoice | undefined;

  const emailProviders: IntegrationId[] = ['resend', 'postmark'];
  let emailPromptShown = false;

  for (const id of available) {
    // For email providers, show a single confirm + select prompt
    if (emailProviders.includes(id)) {
      if (emailPromptShown) continue;
      emailPromptShown = true;

      if (await confirm({ message: 'Add email?', default: false })) {
        const emailProvider = await select({
          message: 'Which email provider?',
          choices: [
            { value: 'resend' as const, name: 'Resend (Modern DX, React Email templates)' },
            { value: 'postmark' as const, name: 'Postmark (Best-in-class deliverability, fast transactional email)' },
          ],
        });
        integrations.push(emailProvider);
      }
      continue;
    }

    const message = integrationPrompts[id];
    if (await confirm({ message, default: false })) {
      integrations.push(id);

      if (id === 'ai-sdk') {
        aiProvider = await select({
          message: 'Which AI provider?',
          choices: [
            { value: 'openai' as const, name: 'OpenAI (GPT-4o)' },
            { value: 'anthropic' as const, name: 'Anthropic (Claude)' },
            { value: 'google' as const, name: 'Google (Gemini)' },
          ],
        });
      }
    }
  }

  return { integrations, aiProvider };
}
