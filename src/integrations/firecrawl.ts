import fs from 'fs/promises';
import path from 'path';
import type { Integration } from '../types.js';
import { firecrawlTemplates } from '../templates/firecrawl.js';

export const firecrawlIntegration: Integration = {
  id: 'firecrawl',
  name: 'Firecrawl',
  description: 'Web scraping',
  packages: ['@mendable/firecrawl-js'],
  envVars: [
    {
      key: 'FIRECRAWL_API_KEY',
      description: 'Firecrawl API key',
      example: 'fc-...',
    },
  ],
  setup: async (projectPath: string) => {
    // Create scrape service
    await fs.mkdir(path.join(projectPath, 'services'), { recursive: true });
    await fs.writeFile(
      path.join(projectPath, 'services/scrape.service.ts'),
      firecrawlTemplates.scrapeService
    );

    // Create API route
    await fs.mkdir(path.join(projectPath, 'app/api/scrape'), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(projectPath, 'app/api/scrape/route.ts'),
      firecrawlTemplates.scrapeRoute
    );
  },
};
