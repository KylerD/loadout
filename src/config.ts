import fs from 'fs/promises';
import path from 'path';
import type { IntegrationId } from './types.js';

interface ConfigVar {
  name: string;
  envKey: string;
  isPublic: boolean;
  defaultValue?: string;
}

const configVars: Record<IntegrationId | 'core', ConfigVar[]> = {
  core: [
    { name: 'APP_URL', envKey: 'NEXT_PUBLIC_APP_URL', isPublic: true },
  ],
  clerk: [
    { name: 'CLERK_PUBLISHABLE_KEY', envKey: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', isPublic: true },
    { name: 'CLERK_SECRET_KEY', envKey: 'CLERK_SECRET_KEY', isPublic: false },
  ],
  'neon-drizzle': [
    { name: 'DATABASE_URL', envKey: 'DATABASE_URL', isPublic: false },
  ],
  'ai-sdk': [
    { name: 'OPENAI_API_KEY', envKey: 'OPENAI_API_KEY', isPublic: false },
  ],
  resend: [
    { name: 'RESEND_API_KEY', envKey: 'RESEND_API_KEY', isPublic: false },
    { name: 'RESEND_FROM_EMAIL', envKey: 'RESEND_FROM_EMAIL', isPublic: false, defaultValue: 'onboarding@resend.dev' },
  ],
  firecrawl: [
    { name: 'FIRECRAWL_API_KEY', envKey: 'FIRECRAWL_API_KEY', isPublic: false },
  ],
  inngest: [
    { name: 'INNGEST_EVENT_KEY', envKey: 'INNGEST_EVENT_KEY', isPublic: false },
    { name: 'INNGEST_SIGNING_KEY', envKey: 'INNGEST_SIGNING_KEY', isPublic: false },
  ],
  uploadthing: [
    { name: 'UPLOADTHING_TOKEN', envKey: 'UPLOADTHING_TOKEN', isPublic: false },
  ],
  stripe: [
    { name: 'STRIPE_SECRET_KEY', envKey: 'STRIPE_SECRET_KEY', isPublic: false },
    { name: 'STRIPE_PUBLISHABLE_KEY', envKey: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', isPublic: true },
    { name: 'STRIPE_WEBHOOK_SECRET', envKey: 'STRIPE_WEBHOOK_SECRET', isPublic: false },
  ],
  posthog: [
    { name: 'POSTHOG_KEY', envKey: 'NEXT_PUBLIC_POSTHOG_KEY', isPublic: true },
    { name: 'POSTHOG_HOST', envKey: 'NEXT_PUBLIC_POSTHOG_HOST', isPublic: true, defaultValue: 'https://us.i.posthog.com' },
  ],
  sentry: [
    { name: 'SENTRY_DSN', envKey: 'NEXT_PUBLIC_SENTRY_DSN', isPublic: true },
    { name: 'SENTRY_AUTH_TOKEN', envKey: 'SENTRY_AUTH_TOKEN', isPublic: false },
    { name: 'SENTRY_ORG', envKey: 'SENTRY_ORG', isPublic: false },
    { name: 'SENTRY_PROJECT', envKey: 'SENTRY_PROJECT', isPublic: false },
  ],
};

export async function generateConfig(
  projectPath: string,
  integrationIds: IntegrationId[]
): Promise<void> {
  const selectedIds: (IntegrationId | 'core')[] = ['core', ...integrationIds];

  let content = `// Environment configuration
// All environment variables are exported from here for type-safe access
// Update .env.local with your actual values

`;

  for (const id of selectedIds) {
    const vars = configVars[id];
    if (!vars || vars.length === 0) continue;

    const sectionName = id === 'core' ? 'Core' : id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
    content += `// ${sectionName}\n`;

    for (const v of vars) {
      if (v.defaultValue) {
        content += `export const ${v.name} = process.env.${v.envKey} ?? '${v.defaultValue}';\n`;
      } else {
        content += `export const ${v.name} = process.env.${v.envKey} as string;\n`;
      }
    }
    content += '\n';
  }

  await fs.mkdir(path.join(projectPath, 'lib'), { recursive: true });
  await fs.writeFile(path.join(projectPath, 'lib/config.ts'), content.trim() + '\n');
}
