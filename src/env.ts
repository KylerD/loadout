import fs from 'fs/promises';
import path from 'path';
import type { IntegrationId, ProjectConfig, AIProviderChoice } from './types.js';
import { getAiEnvVar } from './templates/ai-sdk.js';

interface EnvSection {
  name: string;
  url?: string;
  vars: { key: string; example: string; description: string }[];
}

const staticEnvSections: Record<Exclude<IntegrationId, 'ai-sdk'> | 'core', EnvSection> = {
  core: {
    name: 'CORE',
    vars: [],
  },
  clerk: {
    name: 'CLERK - Authentication',
    url: 'https://dashboard.clerk.com',
    vars: [
      { key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', example: 'pk_test_...', description: 'Clerk publishable key' },
      { key: 'CLERK_SECRET_KEY', example: 'sk_test_...', description: 'Clerk secret key' },
    ],
  },
  'neon-drizzle': {
    name: 'NEON - Database',
    url: 'https://console.neon.tech',
    vars: [
      { key: 'DATABASE_URL', example: 'postgresql://user:pass@host/db?sslmode=require', description: 'Neon database connection string' },
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
  postmark: {
    name: 'POSTMARK - Email',
    url: 'https://account.postmarkapp.com/servers',
    vars: [
      { key: 'POSTMARK_SERVER_TOKEN', example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', description: 'Postmark server token' },
      { key: 'POSTMARK_FROM_EMAIL', example: 'hello@yourdomain.com', description: 'Default from email address' },
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

function getAiEnvSection(provider: AIProviderChoice): EnvSection {
  const envVar = getAiEnvVar(provider);
  const urls: Record<AIProviderChoice, string> = {
    openai: 'https://platform.openai.com/api-keys',
    anthropic: 'https://console.anthropic.com/settings/keys',
    google: 'https://aistudio.google.com/apikey',
  };
  const names: Record<AIProviderChoice, string> = {
    openai: 'OPENAI - AI',
    anthropic: 'ANTHROPIC - AI',
    google: 'GOOGLE - AI',
  };

  return {
    name: names[provider],
    url: urls[provider],
    vars: [envVar],
  };
}

function getEnvSection(id: IntegrationId | 'core', aiProvider?: AIProviderChoice): EnvSection {
  if (id === 'ai-sdk') {
    return getAiEnvSection(aiProvider ?? 'openai');
  }
  return staticEnvSections[id];
}

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
  config: ProjectConfig
): Promise<void> {
  const selectedIds: (IntegrationId | 'core')[] = ['core', ...config.integrations];

  // Generate .env.example with all vars and examples
  let envExample = '';
  for (const id of selectedIds) {
    const section = getEnvSection(id, config.aiProvider);
    envExample += generateEnvSection(section, true);
    envExample += '\n';
  }
  await fs.writeFile(path.join(projectPath, '.env.example'), envExample.trim() + '\n');

  // Generate .env.local with empty values
  let envLocal = '';
  for (const id of selectedIds) {
    const section = getEnvSection(id, config.aiProvider);
    envLocal += generateEnvSection(section, false);
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

export async function appendEnvFiles(
  projectPath: string,
  integrations: IntegrationId[],
  aiProvider?: AIProviderChoice
): Promise<void> {
  const envExamplePath = path.join(projectPath, '.env.example');
  const envLocalPath = path.join(projectPath, '.env.local');

  let envExampleContent = '';
  let envLocalContent = '';

  for (const id of integrations) {
    const section = getEnvSection(id, aiProvider);
    envExampleContent += '\n' + generateEnvSection(section, true);
    envLocalContent += '\n' + generateEnvSection(section, false);
  }

  if (envExampleContent) {
    try {
      const existing = await fs.readFile(envExamplePath, 'utf-8');
      await fs.writeFile(envExamplePath, existing.trimEnd() + '\n' + envExampleContent.trim() + '\n');
    } catch {
      await fs.writeFile(envExamplePath, envExampleContent.trim() + '\n');
    }
  }

  if (envLocalContent) {
    try {
      const existing = await fs.readFile(envLocalPath, 'utf-8');
      await fs.writeFile(envLocalPath, existing.trimEnd() + '\n' + envLocalContent.trim() + '\n');
    } catch {
      await fs.writeFile(envLocalPath, envLocalContent.trim() + '\n');
    }
  }
}
