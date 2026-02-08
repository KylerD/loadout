import { execa } from 'execa';
import type { Integration, IntegrationId, EnvVar } from '../types.js';

import { clerkIntegration } from './clerk.js';
import { neonDrizzleIntegration } from './neon-drizzle.js';
import { aiSdkIntegration } from './ai-sdk.js';
import { resendIntegration } from './resend.js';
import { firecrawlIntegration } from './firecrawl.js';
import { inngestIntegration } from './inngest.js';
import { uploadthingIntegration } from './uploadthing.js';
import { stripeIntegration } from './stripe.js';
import { posthogIntegration } from './posthog.js';
import { sentryIntegration } from './sentry.js';

export const integrations: Record<IntegrationId, Integration> = {
  clerk: clerkIntegration,
  'neon-drizzle': neonDrizzleIntegration,
  'ai-sdk': aiSdkIntegration,
  resend: resendIntegration,
  firecrawl: firecrawlIntegration,
  inngest: inngestIntegration,
  uploadthing: uploadthingIntegration,
  stripe: stripeIntegration,
  posthog: posthogIntegration,
  sentry: sentryIntegration,
};

export async function installIntegrations(
  projectPath: string,
  integrationIds: IntegrationId[]
): Promise<void> {
  const allPackages: string[] = [];
  const allDevPackages: string[] = [];

  // Collect all packages
  for (const id of integrationIds) {
    const integration = integrations[id];
    allPackages.push(...integration.packages);
    if (integration.devPackages) {
      allDevPackages.push(...integration.devPackages);
    }
  }

  // Install all packages at once
  if (allPackages.length > 0) {
    await execa('npm', ['install', ...allPackages], { cwd: projectPath });
  }

  if (allDevPackages.length > 0) {
    await execa('npm', ['install', '-D', ...allDevPackages], { cwd: projectPath });
  }

  // Run setup for each integration
  for (const id of integrationIds) {
    const integration = integrations[id];
    await integration.setup(projectPath);
  }
}

export function getEnvVars(integrationIds: IntegrationId[]): EnvVar[] {
  const envVars: EnvVar[] = [
    {
      key: 'NEXT_PUBLIC_APP_URL',
      description: 'Application URL',
      example: 'http://localhost:3000',
      isPublic: true,
    },
  ];

  for (const id of integrationIds) {
    envVars.push(...integrations[id].envVars);
  }

  return envVars;
}
