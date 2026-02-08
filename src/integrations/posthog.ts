import fs from 'fs/promises';
import path from 'path';
import type { Integration } from '../types.js';
import { posthogTemplates } from '../templates/posthog.js';

export const posthogIntegration: Integration = {
  id: 'posthog',
  name: 'PostHog',
  description: 'Product analytics',
  packages: ['posthog-js'],
  envVars: [
    {
      key: 'NEXT_PUBLIC_POSTHOG_KEY',
      description: 'PostHog project API key',
      example: 'phc_...',
      isPublic: true,
    },
    {
      key: 'NEXT_PUBLIC_POSTHOG_HOST',
      description: 'PostHog host',
      example: 'https://us.i.posthog.com',
      isPublic: true,
    },
  ],
  setup: async (projectPath: string) => {
    // instrumentation-client.ts is generated centrally in cli.ts
    // to handle merging with other integrations (e.g., Sentry)

    // Create analytics service with helper functions
    await fs.mkdir(path.join(projectPath, 'services'), { recursive: true });
    await fs.writeFile(
      path.join(projectPath, 'services/analytics.service.ts'),
      posthogTemplates.analyticsService
    );
  },
};
