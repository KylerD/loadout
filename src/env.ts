import fs from 'fs/promises';
import path from 'path';
import type { IntegrationId } from './types.js';
import { integrations, getEnvVars } from './integrations/index.js';

interface EnvSection {
  name: string;
  url?: string;
  vars: { key: string; example: string; description: string }[];
}

const envSections: Record<IntegrationId | 'core', EnvSection> = {
  core: {
    name: 'CORE',
    vars: [
      { key: 'NEXT_PUBLIC_APP_URL', example: 'http://localhost:3000', description: 'Application URL' },
    ],
  },
  clerk: {
    name: 'CLERK - Authentication',
    url: 'https://dashboard.clerk.com',
    vars: [
      { key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', example: 'pk_test_...', description: 'Clerk publishable key' },
      { key: 'CLERK_SECRET_KEY', example: 'sk_test_...', description: 'Clerk secret key' },
      { key: 'NEXT_PUBLIC_CLERK_SIGN_IN_URL', example: '/sign-in', description: 'Sign in URL' },
      { key: 'NEXT_PUBLIC_CLERK_SIGN_UP_URL', example: '/sign-up', description: 'Sign up URL' },
    ],
  },
  'neon-drizzle': {
    name: 'NEON - Database',
    url: 'https://console.neon.tech',
    vars: [
      { key: 'DATABASE_URL', example: 'postgresql://user:pass@host/db?sslmode=require', description: 'Neon database connection string' },
    ],
  },
  'ai-sdk': {
    name: 'OPENAI - AI',
    url: 'https://platform.openai.com/api-keys',
    vars: [
      { key: 'OPENAI_API_KEY', example: 'sk-...', description: 'OpenAI API key' },
    ],
  },
  resend: {
    name: 'RESEND - Email',
    url: 'https://resend.com/api-keys',
    vars: [
      { key: 'RESEND_API_KEY', example: 're_...', description: 'Resend API key' },
      { key: 'RESEND_FROM_EMAIL', example: 'onboarding@resend.dev', description: 'Default from email address' },
    ],
  },
  firecrawl: {
    name: 'FIRECRAWL - Scraping',
    url: 'https://firecrawl.dev',
    vars: [
      { key: 'FIRECRAWL_API_KEY', example: 'fc-...', description: 'Firecrawl API key' },
    ],
  },
  inngest: {
    name: 'INNGEST - Background Jobs',
    url: 'https://app.inngest.com',
    vars: [
      { key: 'INNGEST_EVENT_KEY', example: '...', description: 'Inngest event key' },
      { key: 'INNGEST_SIGNING_KEY', example: '...', description: 'Inngest signing key' },
    ],
  },
  uploadthing: {
    name: 'UPLOADTHING - File Uploads',
    url: 'https://uploadthing.com/dashboard',
    vars: [
      { key: 'UPLOADTHING_TOKEN', example: '...', description: 'UploadThing token' },
    ],
  },
  stripe: {
    name: 'STRIPE - Payments',
    url: 'https://dashboard.stripe.com/apikeys',
    vars: [
      { key: 'STRIPE_SECRET_KEY', example: 'sk_test_...', description: 'Stripe secret key' },
      { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', example: 'pk_test_...', description: 'Stripe publishable key' },
      { key: 'STRIPE_WEBHOOK_SECRET', example: 'whsec_...', description: 'Stripe webhook secret' },
    ],
  },
  posthog: {
    name: 'POSTHOG - Analytics',
    url: 'https://app.posthog.com/project/settings',
    vars: [
      { key: 'NEXT_PUBLIC_POSTHOG_KEY', example: 'phc_...', description: 'PostHog project API key' },
      { key: 'NEXT_PUBLIC_POSTHOG_HOST', example: 'https://us.i.posthog.com', description: 'PostHog host' },
    ],
  },
  sentry: {
    name: 'SENTRY - Error Tracking',
    url: 'https://sentry.io/settings/projects',
    vars: [
      { key: 'NEXT_PUBLIC_SENTRY_DSN', example: 'https://...@sentry.io/...', description: 'Sentry DSN' },
      { key: 'SENTRY_AUTH_TOKEN', example: 'sntrys_...', description: 'Sentry auth token for source maps' },
      { key: 'SENTRY_ORG', example: 'your-org', description: 'Sentry organization slug' },
      { key: 'SENTRY_PROJECT', example: 'your-project', description: 'Sentry project slug' },
    ],
  },
};

function generateEnvSection(section: EnvSection, includeExamples: boolean): string {
  let content = `# ===========================================\n`;
  content += `# ${section.name}\n`;
  if (section.url) {
    content += `# Get keys at: ${section.url}\n`;
  }
  content += `# ===========================================\n`;

  for (const v of section.vars) {
    if (includeExamples) {
      content += `${v.key}=${v.example}\n`;
    } else {
      content += `${v.key}=\n`;
    }
  }

  return content;
}

export async function generateEnvFiles(
  projectPath: string,
  integrationIds: IntegrationId[]
): Promise<void> {
  const selectedSections: (IntegrationId | 'core')[] = ['core', ...integrationIds];

  // Generate .env.example with all vars and examples
  let envExample = '';
  for (const id of selectedSections) {
    envExample += generateEnvSection(envSections[id], true);
    envExample += '\n';
  }
  await fs.writeFile(path.join(projectPath, '.env.example'), envExample.trim() + '\n');

  // Generate .env.local with empty values
  let envLocal = '';
  for (const id of selectedSections) {
    envLocal += generateEnvSection(envSections[id], false);
    envLocal += '\n';
  }
  await fs.writeFile(path.join(projectPath, '.env.local'), envLocal.trim() + '\n');

  // Update .gitignore to include .env.local
  const gitignorePath = path.join(projectPath, '.gitignore');
  try {
    let gitignore = await fs.readFile(gitignorePath, 'utf-8');
    if (!gitignore.includes('.env.local')) {
      gitignore += '\n# Environment variables\n.env.local\n.env*.local\n';
      await fs.writeFile(gitignorePath, gitignore);
    }
  } catch {
    // .gitignore doesn't exist, create it
    await fs.writeFile(
      gitignorePath,
      '# Environment variables\n.env.local\n.env*.local\n'
    );
  }
}
