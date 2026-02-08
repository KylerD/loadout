import fs from 'fs/promises';
import path from 'path';
import type { Integration } from '../types.js';
import { inngestTemplates } from '../templates/inngest.js';

export const inngestIntegration: Integration = {
  id: 'inngest',
  name: 'Inngest',
  description: 'Background jobs and workflows',
  packages: ['inngest'],
  envVars: [
    {
      key: 'INNGEST_EVENT_KEY',
      description: 'Inngest event key',
      example: '...',
    },
    {
      key: 'INNGEST_SIGNING_KEY',
      description: 'Inngest signing key',
      example: '...',
    },
  ],
  setup: async (projectPath: string) => {
    // Create lib directory
    await fs.mkdir(path.join(projectPath, 'lib'), { recursive: true });

    // Create Inngest client
    await fs.writeFile(
      path.join(projectPath, 'lib/inngest.client.ts'),
      inngestTemplates.inngestClient
    );

    // Create Inngest functions
    await fs.writeFile(
      path.join(projectPath, 'lib/inngest.functions.ts'),
      inngestTemplates.inngestFunctions
    );

    // Create jobs service
    await fs.mkdir(path.join(projectPath, 'services'), { recursive: true });
    await fs.writeFile(
      path.join(projectPath, 'services/jobs.service.ts'),
      inngestTemplates.jobsService
    );

    // Create API route
    await fs.mkdir(path.join(projectPath, 'app/api/inngest'), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(projectPath, 'app/api/inngest/route.ts'),
      inngestTemplates.inngestRoute
    );

    // Update package.json with inngest script
    const pkgPath = path.join(projectPath, 'package.json');
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
    pkg.scripts = {
      ...pkg.scripts,
      'inngest:dev': 'npx inngest-cli@latest dev',
    };
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
  },
};
