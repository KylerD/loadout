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

    await fs.writeFile(
      path.join(projectPath, 'lib/db/client.ts'),
      neonDrizzleTemplates.dbClient
    );

    await fs.writeFile(
      path.join(projectPath, 'lib/db/schema.ts'),
      neonDrizzleTemplates.schema
    );

    await fs.writeFile(
      path.join(projectPath, 'lib/db/index.ts'),
      neonDrizzleTemplates.dbIndex
    );

    // Create models directory
    await fs.mkdir(path.join(projectPath, 'models'), { recursive: true });

    await fs.writeFile(
      path.join(projectPath, 'models/todo.dto.ts'),
      neonDrizzleTemplates.todoDto
    );

    await fs.writeFile(
      path.join(projectPath, 'models/todo.view.ts'),
      neonDrizzleTemplates.todoView
    );

    await fs.writeFile(
      path.join(projectPath, 'models/todoCreate.schema.ts'),
      neonDrizzleTemplates.todoCreateSchema
    );

    await fs.writeFile(
      path.join(projectPath, 'models/todoCreate.state.ts'),
      neonDrizzleTemplates.todoCreateState
    );

    await fs.writeFile(
      path.join(projectPath, 'models/todoUpdate.schema.ts'),
      neonDrizzleTemplates.todoUpdateSchema
    );

    await fs.writeFile(
      path.join(projectPath, 'models/todoUpdate.state.ts'),
      neonDrizzleTemplates.todoUpdateState
    );

    // Create dao directory
    await fs.mkdir(path.join(projectPath, 'dao'), { recursive: true });

    await fs.writeFile(
      path.join(projectPath, 'dao/todo.dao.ts'),
      neonDrizzleTemplates.todoDao
    );

    // Create mappers directory
    await fs.mkdir(path.join(projectPath, 'mappers'), { recursive: true });

    await fs.writeFile(
      path.join(projectPath, 'mappers/todo.mapper.ts'),
      neonDrizzleTemplates.todoMapper
    );

    // Create services directory
    await fs.mkdir(path.join(projectPath, 'services'), { recursive: true });

    await fs.writeFile(
      path.join(projectPath, 'services/todo.service.ts'),
      neonDrizzleTemplates.todoService
    );

    // Create actions directory
    await fs.mkdir(path.join(projectPath, 'actions'), { recursive: true });

    await fs.writeFile(
      path.join(projectPath, 'actions/todo.actions.ts'),
      neonDrizzleTemplates.todoActions
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
