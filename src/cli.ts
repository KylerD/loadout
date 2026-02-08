import chalk from 'chalk';
import ora from 'ora';
import { getProjectConfig } from './prompts.js';
import { createNextApp } from './create-next.js';
import { setupShadcn } from './setup-shadcn.js';
import { installIntegrations } from './integrations/index.js';
import { generateClaudeMd } from './claude-md.js';
import { generateEnvFiles } from './env.js';
import { generateConfig } from './config.js';
import { generateReadme, generateGitignore } from './generate-readme.js';
import {
  generateInstrumentationClient,
  generateInstrumentation,
} from './instrumentation.js';
import type { ProjectConfig } from './types.js';

export async function main() {
  console.log();
  console.log(chalk.bold.cyan('  create-loadout'));
  console.log(chalk.gray('  Custom Next.js scaffolding with SaaS integrations'));
  console.log();

  try {
    // Get project configuration from user
    const config: ProjectConfig = await getProjectConfig();

    console.log();

    // Create Next.js app
    const spinner = ora('Creating Next.js app...').start();
    const projectPath = await createNextApp(config.name);
    spinner.succeed('Next.js app created');

    // Setup shadcn/ui
    spinner.start('Setting up shadcn/ui...');
    await setupShadcn(projectPath);
    spinner.succeed('shadcn/ui configured');

    // Install zod (always included)
    spinner.start('Installing zod...');
    const { execa } = await import('execa');
    await execa('npm', ['install', 'zod@^3.24'], { cwd: projectPath });
    spinner.succeed('Zod installed');

    // Install and setup integrations
    if (config.integrations.length > 0) {
      spinner.start(`Setting up ${config.integrations.length} integration(s)...`);
      await installIntegrations(projectPath, config);
      spinner.succeed('Integrations configured');
    }

    // Generate instrumentation files (for PostHog, Sentry, etc.)
    await generateInstrumentationClient(projectPath, config);
    await generateInstrumentation(projectPath, config);

    // Generate config and environment files
    spinner.start('Generating config and environment files...');
    await generateConfig(projectPath, config);
    await generateEnvFiles(projectPath, config);
    spinner.succeed('Config and environment files created');

    // Generate project files
    spinner.start('Generating project files...');
    await generateGitignore(projectPath);
    await generateReadme(projectPath, config);
    await generateClaudeMd(projectPath, config);
    spinner.succeed('Project files created');

    // Success message
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
  } catch (error) {
    console.error();
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
