import fs from 'fs/promises';
import path from 'path';
import type { IntegrationId, ProjectConfig, AIProviderChoice } from './types.js';
import { getAiConfigVar } from './templates/ai-sdk.js';

interface ConfigVar {
  name: string;
  envKey: string;
  isPublic: boolean;
  defaultValue?: string;
}

const staticConfigVars: Record<Exclude<IntegrationId, 'ai-sdk'> | 'core', ConfigVar[]> = {
  core: [],
  clerk: [
    { name: 'CLERK_PUBLISHABLE_KEY', envKey: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', isPublic: true },
    { name: 'CLERK_SECRET_KEY', envKey: 'CLERK_SECRET_KEY', isPublic: false },
  ],
  'neon-drizzle': [
    { name: 'DATABASE_URL', envKey: 'DATABASE_URL', isPublic: false },
  ],
  resend: [
    { name: 'RESEND_API_KEY', envKey: 'RESEND_API_KEY', isPublic: false },
    { name: 'RESEND_FROM_EMAIL', envKey: 'RESEND_FROM_EMAIL', isPublic: false, defaultValue: 'onboarding@resend.dev' },
  ],
  postmark: [
    { name: 'POSTMARK_SERVER_TOKEN', envKey: 'POSTMARK_SERVER_TOKEN', isPublic: false },
    { name: 'POSTMARK_FROM_EMAIL', envKey: 'POSTMARK_FROM_EMAIL', isPublic: false },
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

function getConfigVars(id: IntegrationId | 'core', aiProvider?: AIProviderChoice): ConfigVar[] {
  if (id === 'ai-sdk') {
    const aiVar = getAiConfigVar(aiProvider ?? 'openai');
    return [{ name: aiVar.name, envKey: aiVar.envKey, isPublic: false }];
  }
  return staticConfigVars[id] ?? [];
}

export async function generateConfig(
  projectPath: string,
  config: ProjectConfig
): Promise<void> {
  const selectedIds: (IntegrationId | 'core')[] = ['core', ...config.integrations];

  let content = '';

  for (const id of selectedIds) {
    const vars = getConfigVars(id, config.aiProvider);
    if (!vars || vars.length === 0) continue;

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

export async function appendConfig(
  projectPath: string,
  integrations: IntegrationId[],
  aiProvider?: AIProviderChoice
): Promise<void> {
  const configPath = path.join(projectPath, 'lib/config.ts');

  let existing = '';
  try {
    existing = await fs.readFile(configPath, 'utf-8');
  } catch {
    existing = '';
  }

  let content = '';

  for (const id of integrations) {
    const vars = getConfigVars(id, aiProvider);
    if (!vars || vars.length === 0) continue;

    for (const v of vars) {
      if (v.defaultValue) {
        content += `export const ${v.name} = process.env.${v.envKey} ?? '${v.defaultValue}';\n`;
      } else {
        content += `export const ${v.name} = process.env.${v.envKey} as string;\n`;
      }
    }
    content += '\n';
  }

  if (content) {
    const newContent = existing.trimEnd() + '\n\n' + content.trim() + '\n';
    await fs.writeFile(configPath, newContent);
  }
}
