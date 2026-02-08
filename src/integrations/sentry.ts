import fs from 'fs/promises';
import path from 'path';
import type { Integration } from '../types.js';
import { sentryTemplates } from '../templates/sentry.js';

export const sentryIntegration: Integration = {
  id: 'sentry',
  name: 'Sentry',
  description: 'Error tracking and monitoring',
  packages: ['@sentry/nextjs'],
  envVars: [
    {
      key: 'NEXT_PUBLIC_SENTRY_DSN',
      description: 'Sentry DSN',
      example: 'https://...@sentry.io/...',
      isPublic: true,
    },
    {
      key: 'SENTRY_AUTH_TOKEN',
      description: 'Sentry auth token for source maps',
      example: 'sntrys_...',
    },
    {
      key: 'SENTRY_ORG',
      description: 'Sentry organization slug',
      example: 'your-org',
    },
    {
      key: 'SENTRY_PROJECT',
      description: 'Sentry project slug',
      example: 'your-project',
    },
  ],
  setup: async (projectPath: string) => {
    // instrumentation.ts and instrumentation-client.ts are generated centrally
    // in cli.ts to handle merging with other integrations (e.g., PostHog)

    // Create server and edge config files (imported by instrumentation.ts)
    await fs.writeFile(
      path.join(projectPath, 'sentry.server.config.ts'),
      sentryTemplates.serverConfig
    );
    await fs.writeFile(
      path.join(projectPath, 'sentry.edge.config.ts'),
      sentryTemplates.edgeConfig
    );

    // Create global-error.tsx
    await fs.writeFile(
      path.join(projectPath, 'app/global-error.tsx'),
      sentryTemplates.globalError
    );

    // Update next.config.ts to wrap with Sentry
    const nextConfigPath = path.join(projectPath, 'next.config.ts');
    await fs.writeFile(nextConfigPath, sentryTemplates.nextConfig);

    // No service needed - use Sentry directly:
    // Server: import * as Sentry from '@sentry/nextjs'; Sentry.captureException(error)
    // Client: Same import, already initialized via instrumentation-client.ts
  },
};
