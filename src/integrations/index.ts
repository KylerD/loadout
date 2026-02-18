import { execa } from 'execa';
import { NPM } from '../bin-paths.js';
import type { Integration, IntegrationId, EnvVar, ProjectConfig } from '../types.js';

import { clerkIntegration } from './clerk.js';
import { neonDrizzleIntegration } from './neon-drizzle.js';
import { createAiSdkIntegration } from './ai-sdk.js';
import { resendIntegration } from './resend.js';
import { firecrawlIntegration } from './firecrawl.js';
import { inngestIntegration } from './inngest.js';
import { uploadthingIntegration } from './uploadthing.js';
import { stripeIntegration } from './stripe.js';
import { postmarkIntegration } from './postmark.js';
import { posthogIntegration } from './posthog.js';
import { sentryIntegration } from './sentry.js';

// Static integrations (don't need config)
const staticIntegrations: Partial<Record<IntegrationId, Integration>> = {
  clerk: clerkIntegration,
  'neon-drizzle': neonDrizzleIntegration,
  resend: resendIntegration,
  firecrawl: firecrawlIntegration,
  inngest: inngestIntegration,
  uploadthing: uploadthingIntegration,
  stripe: stripeIntegration,
  postmark: postmarkIntegration,
  posthog: posthogIntegration,
  sentry: sentryIntegration,
};

// Get integration, with dynamic ones using config
export function getIntegration(id: IntegrationId, config: ProjectConfig): Integration {
  if (id === 'ai-sdk') {
    return createAiSdkIntegration(config.aiProvider ?? 'openai');
  }
  return staticIntegrations[id]!;
}

export async function installIntegrations(
  projectPath: string,
  config: ProjectConfig
): Promise<void> {
  const allPackages: string[] = [];
  const allDevPackages: string[] = [];

  // Collect all packages
  for (const id of config.integrations) {
    const integration = getIntegration(id, config);
    allPackages.push(...integration.packages);
    if (integration.devPackages) {
      allDevPackages.push(...integration.devPackages);
    }
  }

  // Install all packages at once
  if (allPackages.length > 0) {
    await execa(NPM, ['install', ...allPackages], { cwd: projectPath });
  }

  if (allDevPackages.length > 0) {
    await execa(NPM, ['install', '-D', ...allDevPackages], { cwd: projectPath });
  }

  // Run setup for each integration
  for (const id of config.integrations) {
    const integration = getIntegration(id, config);
    await integration.setup(projectPath);
  }
}

export function getEnvVars(config: ProjectConfig): EnvVar[] {
  const envVars: EnvVar[] = [];

  for (const id of config.integrations) {
    const integration = getIntegration(id, config);
    envVars.push(...integration.envVars);
  }

  return envVars;
}

// Export for backwards compatibility
export const integrations = staticIntegrations;
