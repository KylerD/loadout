import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import { getProjectConfig, getAddIntegrationConfig } from './prompts.js';
import { createNextApp } from './create-next.js';
import { setupShadcn } from './setup-shadcn.js';
import { installIntegrations } from './integrations/index.js';
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
import {
  isExistingProject,
  getInstalledIntegrations,
  getAvailableIntegrations,
} from './detect.js';
import type { ProjectConfig } from './types.js';

export async function main() {
  console.log();
  console.log(chalk.bold.cyan('  create-loadout'));
  console.log(chalk.gray('  Custom Next.js scaffolding with SaaS integrations'));
  console.log();

  const cwd = process.cwd();

  try {
    if (await isExistingProject(cwd)) {
      await addIntegrationFlow(cwd);
    } else {
      await newProjectFlow();
    }
  } catch (error) {
    console.error();
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function newProjectFlow() {
  const config: ProjectConfig = await getProjectConfig();

  console.log();

  const spinner = ora('Creating Next.js app...').start();
  const projectPath = await createNextApp(config.name);
  spinner.succeed('Next.js app created');

  spinner.start('Setting up shadcn/ui...');
  await setupShadcn(projectPath);
  spinner.succeed('shadcn/ui configured');

  await extendUtils(projectPath);

  spinner.start('Installing base packages...');
  const { execa } = await import('execa');
  await execa('npm', ['install', 'zod@^3.24', 'zustand@^5', 'luxon@^3'], { cwd: projectPath });
  await execa('npm', ['install', '-D', '@types/luxon'], { cwd: projectPath });
  spinner.succeed('Base packages installed (zod, zustand, luxon)');

  await fs.mkdir(path.join(projectPath, 'lib/stores'), { recursive: true });
  await fs.writeFile(
    path.join(projectPath, 'lib/stores/counter.store.ts'),
    zustandTemplates.exampleStore
  );

  if (config.integrations.length > 0) {
    spinner.start(`Setting up ${config.integrations.length} integration(s)...`);
    await installIntegrations(projectPath, config);
    spinner.succeed('Integrations configured');
  }

  await generateInstrumentationClient(projectPath, config);
  await generateInstrumentation(projectPath, config);

  spinner.start('Generating config and environment files...');
  await generateConfig(projectPath, config);
  await generateEnvFiles(projectPath, config);
  spinner.succeed('Config and environment files created');

  spinner.start('Generating project files...');
  await generateLandingPage(projectPath, config);
  await generateGitignore(projectPath);
  await generateReadme(projectPath, config);
  await generateClaudeMd(projectPath, config);
  spinner.succeed('Project files created');

  console.log();
  console.log(chalk.green.bold('  Success!') + ' Created ' + chalk.cyan(config.name));
  console.log();

  if (config.integrations.length > 0) {
    console.log(chalk.bold('  Installed integrations:'));
    config.integrations.forEach((integration) => {
      console.log(chalk.gray(`    - ${integration}`));
    });
    console.log();
  }

  console.log(chalk.bold('  Next steps:'));
  console.log(chalk.gray(`    1. cd ${config.name}`));
  console.log(chalk.gray('    2. Configure .env.local with your API keys'));
  console.log(chalk.gray('    3. npm run dev'));
  console.log();

  if (config.integrations.includes('neon-drizzle')) {
    console.log(chalk.yellow('  Database commands:'));
    console.log(chalk.gray('    npm run db:generate  - Generate migrations'));
    console.log(chalk.gray('    npm run db:migrate   - Run migrations'));
    console.log(chalk.gray('    npm run db:studio    - Open Drizzle Studio'));
    console.log();
  }

  if (config.integrations.includes('inngest')) {
    console.log(chalk.yellow('  Inngest commands:'));
    console.log(chalk.gray('    npm run inngest:dev  - Start Inngest dev server'));
    console.log();
  }
}

async function addIntegrationFlow(projectPath: string) {
  console.log(chalk.yellow('  Existing Next.js project detected'));
  console.log(chalk.gray('  Running in add integration mode'));
  console.log();

  const installed = await getInstalledIntegrations(projectPath);
  const available = getAvailableIntegrations(installed);

  if (available.length === 0) {
    console.log(chalk.green('  All integrations already installed!'));
    return;
  }

  if (installed.length > 0) {
    console.log(chalk.gray('  Already installed: ') + installed.join(', '));
    console.log();
  }

  const addConfig = await getAddIntegrationConfig(available);

  if (addConfig.integrations.length === 0) {
    console.log();
    console.log(chalk.gray('  No integrations selected'));
    return;
  }

  console.log();

  const spinner = ora(`Installing ${addConfig.integrations.length} integration(s)...`).start();

  const config: ProjectConfig = {
    name: path.basename(projectPath),
    integrations: addConfig.integrations,
    aiProvider: addConfig.aiProvider,
  };

  await installIntegrations(projectPath, config);
  spinner.succeed('Integrations installed');

  spinner.start('Updating config and environment files...');
  await appendConfig(projectPath, addConfig.integrations, addConfig.aiProvider);
  await appendEnvFiles(projectPath, addConfig.integrations, addConfig.aiProvider);
  spinner.succeed('Config and environment files updated');

  spinner.start('Updating CLAUDE.md...');
  await appendClaudeMd(projectPath, addConfig.integrations);
  spinner.succeed('CLAUDE.md updated');

  console.log();
  console.log(chalk.green.bold('  Success!') + ' Added integrations:');
  addConfig.integrations.forEach((integration) => {
    console.log(chalk.gray(`    - ${integration}`));
  });
  console.log();

  console.log(chalk.bold('  Next steps:'));
  console.log(chalk.gray('    1. Update .env.local with new API keys'));
  console.log(chalk.gray('    2. npm run dev'));
  console.log();

  if (addConfig.integrations.includes('neon-drizzle')) {
    console.log(chalk.yellow('  Database commands:'));
    console.log(chalk.gray('    npm run db:generate  - Generate migrations'));
    console.log(chalk.gray('    npm run db:migrate   - Run migrations'));
    console.log(chalk.gray('    npm run db:studio    - Open Drizzle Studio'));
    console.log();
  }

  if (addConfig.integrations.includes('inngest')) {
    console.log(chalk.yellow('  Inngest commands:'));
    console.log(chalk.gray('    npm run inngest:dev  - Start Inngest dev server'));
    console.log();
  }
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
