import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import { getProjectConfig, getAddIntegrationConfig } from './prompts.js';
import { createProject, addIntegrations } from './engine.js';
import {
  isExistingProject,
  getInstalledIntegrations,
  getAvailableIntegrations,
} from './detect.js';
import type { ProjectConfig } from './types.js';

function oraReporter() {
  const spinner = ora();
  const callback = (step: string) => {
    spinner.start(step);
  };
  return { spinner, callback };
}

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

  const { spinner, callback } = oraReporter();
  const result = await createProject(config, callback);
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

  const config: ProjectConfig = {
    name: path.basename(projectPath),
    integrations: addConfig.integrations,
    aiProvider: addConfig.aiProvider,
  };

  const { spinner, callback } = oraReporter();
  const result = await addIntegrations(projectPath, config, callback);
  spinner.succeed('Integrations installed');

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
