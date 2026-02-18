import fs from 'fs/promises';
import path from 'path';
import { createNextApp } from './create-next.js';
import { setupShadcn } from './setup-shadcn.js';
import { installIntegrations, getEnvVars } from './integrations/index.js';
import { generateClaudeMd, appendClaudeMd } from './claude-md.js';
import { generateEnvFiles, appendEnvFiles } from './env.js';
import { generateConfig, appendConfig } from './config.js';
import { generateReadme, generateGitignore } from './generate-readme.js';
import {
  generateInstrumentationClient,
  generateInstrumentation,
} from './instrumentation.js';
import { zustandTemplates } from './templates/zustand.js';
import { generateLandingPage } from './landing-page.js';
import type { ProjectConfig, IntegrationId } from './types.js';

export type ProgressCallback = (step: string) => void;

export interface EngineResult {
  projectPath: string;
  integrations: IntegrationId[];
  envVarsNeeded: string[];
}

export async function createProject(
  config: ProjectConfig,
  onProgress?: ProgressCallback
): Promise<EngineResult> {
  onProgress?.('Creating Next.js app...');
  const projectPath = await createNextApp(config.name);

  onProgress?.('Setting up shadcn/ui...');
  await setupShadcn(projectPath);

  await extendUtils(projectPath);

  onProgress?.('Installing base packages...');
  const { execa } = await import('execa');
  const { NPM } = await import('./bin-paths.js');
  await execa(NPM, ['install', 'zod', 'zustand', 'luxon'], { cwd: projectPath });
  await execa(NPM, ['install', '-D', '@types/luxon'], { cwd: projectPath });

  await fs.mkdir(path.join(projectPath, 'lib/stores'), { recursive: true });
  await fs.writeFile(
    path.join(projectPath, 'lib/stores/counter.store.ts'),
    zustandTemplates.exampleStore
  );

  if (config.integrations.length > 0) {
    onProgress?.(`Setting up ${config.integrations.length} integration(s)...`);
    await installIntegrations(projectPath, config);
  }

  await generateInstrumentationClient(projectPath, config);
  await generateInstrumentation(projectPath, config);

  onProgress?.('Generating config and environment files...');
  await generateConfig(projectPath, config);
  await generateEnvFiles(projectPath, config);

  onProgress?.('Generating project files...');
  await generateLandingPage(projectPath, config);
  await generateGitignore(projectPath);
  await generateReadme(projectPath, config);
  await generateClaudeMd(projectPath, config);

  const envVarsNeeded = collectEnvVars(config);

  return { projectPath, integrations: config.integrations, envVarsNeeded };
}

export async function addIntegrations(
  projectPath: string,
  config: ProjectConfig,
  onProgress?: ProgressCallback
): Promise<EngineResult> {
  onProgress?.(`Installing ${config.integrations.length} integration(s)...`);
  await installIntegrations(projectPath, config);

  onProgress?.('Updating config and environment files...');
  await appendConfig(projectPath, config.integrations, config.aiProvider);
  await appendEnvFiles(projectPath, config.integrations, config.aiProvider);

  onProgress?.('Updating CLAUDE.md...');
  await appendClaudeMd(projectPath, config.integrations);

  const envVarsNeeded = collectEnvVars(config);

  return { projectPath, integrations: config.integrations, envVarsNeeded };
}

async function extendUtils(projectPath: string): Promise<void> {
  const utilsPath = path.join(projectPath, 'lib/utils.ts');
  const existingContent = await fs.readFile(utilsPath, 'utf-8');

  const additionalUtils = `
import { DateTime } from 'luxon';

export function formatDate(date: Date | string, format = 'LLL d, yyyy'): string {
  const dt = typeof date === 'string' ? DateTime.fromISO(date) : DateTime.fromJSDate(date);
  return dt.toFormat(format);
}

export function formatRelative(date: Date | string): string {
  const dt = typeof date === 'string' ? DateTime.fromISO(date) : DateTime.fromJSDate(date);
  return dt.toRelative() ?? dt.toFormat('LLL d, yyyy');
}

export function debounce<P extends unknown[], R>(
  func: (...args: P) => R,
  wait: number
): (...args: P) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: P) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
`;

  await fs.writeFile(utilsPath, existingContent + additionalUtils);
}

function collectEnvVars(config: ProjectConfig): string[] {
  return getEnvVars(config).map((v) => v.key);
}
