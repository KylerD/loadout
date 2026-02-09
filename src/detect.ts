import fs from 'fs/promises';
import path from 'path';
import type { IntegrationId } from './types.js';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const integrationPackages: Record<IntegrationId, string[]> = {
  clerk: ['@clerk/nextjs'],
  'neon-drizzle': ['drizzle-orm', '@neondatabase/serverless'],
  'ai-sdk': ['ai'],
  resend: ['resend'],
  firecrawl: ['@mendable/firecrawl-js'],
  inngest: ['inngest'],
  uploadthing: ['uploadthing'],
  stripe: ['stripe'],
  posthog: ['posthog-js'],
  sentry: ['@sentry/nextjs'],
};

export async function isExistingProject(cwd: string): Promise<boolean> {
  try {
    const pkgPath = path.join(cwd, 'package.json');
    const content = await fs.readFile(pkgPath, 'utf-8');
    const pkg: PackageJson = JSON.parse(content);

    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    return 'next' in allDeps;
  } catch {
    return false;
  }
}

export async function getInstalledIntegrations(cwd: string): Promise<IntegrationId[]> {
  try {
    const pkgPath = path.join(cwd, 'package.json');
    const content = await fs.readFile(pkgPath, 'utf-8');
    const pkg: PackageJson = JSON.parse(content);

    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    const installed: IntegrationId[] = [];

    for (const [integrationId, packages] of Object.entries(integrationPackages)) {
      const hasAll = packages.every((pkg) => pkg in allDeps);
      if (hasAll) {
        installed.push(integrationId as IntegrationId);
      }
    }

    return installed;
  } catch {
    return [];
  }
}

export function getAvailableIntegrations(installed: IntegrationId[]): IntegrationId[] {
  const all: IntegrationId[] = [
    'clerk',
    'neon-drizzle',
    'ai-sdk',
    'resend',
    'firecrawl',
    'inngest',
    'uploadthing',
    'stripe',
    'posthog',
    'sentry',
  ];

  return all.filter((id) => !installed.includes(id));
}
