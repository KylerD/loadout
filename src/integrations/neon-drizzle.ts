import fs from 'fs/promises';
import path from 'path';
import type { Integration } from '../types.js';
import { neonDrizzleTemplates } from '../templates/neon-drizzle.js';

export const neonDrizzleIntegration: Integration = {
  id: 'neon-drizzle',
  name: 'Neon + Drizzle',
  description: 'Serverless Postgres with TypeScript ORM',
  packages: ['drizzle-orm', '@neondatabase/serverless'],
  devPackages: ['drizzle-kit'],
  envVars: [
    {
      key: 'DATABASE_URL',
      description: 'Neon database connection string',
      example: 'postgresql://user:pass@host/db?sslmode=require',
    },
  ],
  setup: async (projectPath: string) => {
    // Create drizzle.config.ts
    await fs.writeFile(
      path.join(projectPath, 'drizzle.config.ts'),
      neonDrizzleTemplates.drizzleConfig
    );

    // Create lib/db directory
    await fs.mkdir(path.join(projectPath, 'lib/db'), { recursive: true });

    // Create database client
    await fs.writeFile(
      path.join(projectPath, 'lib/db/client.ts'),
      neonDrizzleTemplates.dbClient
    );

    // Create schema
    await fs.writeFile(
      path.join(projectPath, 'lib/db/schema.ts'),
      neonDrizzleTemplates.schema
    );

    // Create index re-export
    await fs.writeFile(
      path.join(projectPath, 'lib/db/index.ts'),
      neonDrizzleTemplates.dbIndex
    );

    // Create services directory and database service
    await fs.mkdir(path.join(projectPath, 'services'), { recursive: true });
    await fs.writeFile(
      path.join(projectPath, 'services/database.service.ts'),
      neonDrizzleTemplates.dbService
    );

    // Update package.json with db scripts
    const pkgPath = path.join(projectPath, 'package.json');
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
    pkg.scripts = {
      ...pkg.scripts,
      'db:generate': 'drizzle-kit generate',
      'db:migrate': 'drizzle-kit migrate',
      'db:studio': 'drizzle-kit studio',
    };
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
  },
};
