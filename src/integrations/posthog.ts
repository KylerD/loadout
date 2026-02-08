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
    // Create providers.tsx
    await fs.writeFile(
      path.join(projectPath, 'app/providers.tsx'),
      posthogTemplates.posthogProvider
    );

    // Create analytics service
    await fs.mkdir(path.join(projectPath, 'services'), { recursive: true });
    await fs.writeFile(
      path.join(projectPath, 'services/analytics.service.ts'),
      posthogTemplates.analyticsService
    );

    // Create analytics components
    await fs.mkdir(path.join(projectPath, 'components'), { recursive: true });
    await fs.writeFile(
      path.join(projectPath, 'components/analytics.tsx'),
      posthogTemplates.analyticsComponents
    );

    // Update layout.tsx to include provider
    const layoutPath = path.join(projectPath, 'app/layout.tsx');
    const layoutContent = await fs.readFile(layoutPath, 'utf-8');
    const updatedLayout = posthogTemplates.wrapLayout(layoutContent);
    await fs.writeFile(layoutPath, updatedLayout);
  },
};
