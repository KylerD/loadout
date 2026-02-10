#!/usr/bin/env node
import { Command } from 'commander';
import { main } from './cli.js';
import { createProject, addIntegrations } from './engine.js';
import { validateProjectConfig, validateIntegrationSelection, ALL_INTEGRATION_IDS } from './validate.js';
import { listIntegrations } from './metadata.js';
import { isExistingProject, getInstalledIntegrations, getAvailableIntegrations } from './detect.js';
import type { IntegrationId, AIProviderChoice, ProjectConfig } from './types.js';
import fs from 'fs/promises';
import path from 'path';

const program = new Command();

program
  .name('create-loadout')
  .description('Custom Next.js scaffolding with SaaS integrations')
  .version('1.0.1')
  .argument('[name]', 'Project name')
  .option('--clerk', 'Add Clerk authentication')
  .option('--neon-drizzle', 'Add Neon + Drizzle database')
  .option('--ai-sdk', 'Add Vercel AI SDK')
  .option('--ai-provider <provider>', 'AI provider (openai, anthropic, google)')
  .option('--resend', 'Add Resend email')
  .option('--postmark', 'Add Postmark email')
  .option('--firecrawl', 'Add Firecrawl web scraping')
  .option('--inngest', 'Add Inngest background jobs')
  .option('--uploadthing', 'Add UploadThing file uploads')
  .option('--stripe', 'Add Stripe payments')
  .option('--posthog', 'Add PostHog analytics')
  .option('--sentry', 'Add Sentry error tracking')
  .option('--config <path>', 'Path to loadout.json config file')
  .option('--add', 'Add integrations to existing project')
  .option('--list', 'List all available integrations as JSON')
  .action(async (name: string | undefined, opts: Record<string, unknown>) => {
    // --list: dump integration metadata and exit
    if (opts.list) {
      console.log(JSON.stringify(listIntegrations(), null, 2));
      return;
    }

    // Detect if running non-interactive
    const hasConfig = typeof opts.config === 'string';
    const hasFlags = name || hasConfig || opts.add || integrationFlagsPresent(opts);

    if (!hasFlags) {
      // No flags → interactive mode (existing behavior)
      await main();
      return;
    }

    // Non-interactive mode
    try {
      if (hasConfig) {
        await runFromConfigFile(opts.config as string);
      } else if (opts.add) {
        await runAddMode(opts);
      } else {
        await runCreateMode(name!, opts);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

function integrationFlagsPresent(opts: Record<string, unknown>): boolean {
  return ALL_INTEGRATION_IDS.some((id) => opts[camelCase(id)] === true);
}

function camelCase(s: string): string {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function collectIntegrations(opts: Record<string, unknown>): IntegrationId[] {
  const integrations: IntegrationId[] = [];
  for (const id of ALL_INTEGRATION_IDS) {
    if (opts[camelCase(id)] === true) {
      integrations.push(id);
    }
  }
  return integrations;
}

async function runCreateMode(name: string, opts: Record<string, unknown>) {
  const integrations = collectIntegrations(opts);
  const aiProvider = (opts.aiProvider as AIProviderChoice) || undefined;

  const config: ProjectConfig = { name, integrations, aiProvider };
  const errors = validateProjectConfig(config);
  if (errors.length > 0) {
    console.error('Validation errors:');
    errors.forEach((e) => console.error(`  - ${e.field}: ${e.message}`));
    process.exit(1);
  }

  const result = await createProject(config, (step) => console.log(step));

  console.log();
  console.log(`Success! Created ${config.name} at ${result.projectPath}`);
  if (result.integrations.length > 0) {
    console.log(`Integrations: ${result.integrations.join(', ')}`);
  }
  if (result.envVarsNeeded.length > 0) {
    console.log(`Environment variables to configure: ${result.envVarsNeeded.join(', ')}`);
  }
}

async function runAddMode(opts: Record<string, unknown>) {
  const cwd = process.cwd();

  if (!(await isExistingProject(cwd))) {
    console.error('Error: Not in a Next.js project directory. --add requires an existing project.');
    process.exit(1);
  }

  const integrations = collectIntegrations(opts);
  if (integrations.length === 0) {
    console.error('Error: --add requires at least one integration flag (e.g. --clerk --stripe)');
    process.exit(1);
  }

  const valErrors = validateIntegrationSelection(integrations);
  if (valErrors.length > 0) {
    console.error('Validation errors:');
    valErrors.forEach((e) => console.error(`  - ${e.field}: ${e.message}`));
    process.exit(1);
  }

  const installed = await getInstalledIntegrations(cwd);
  const alreadyInstalled = integrations.filter((id) => installed.includes(id));
  if (alreadyInstalled.length > 0) {
    console.error(`Error: Already installed: ${alreadyInstalled.join(', ')}`);
    process.exit(1);
  }

  const aiProvider = (opts.aiProvider as AIProviderChoice) || undefined;
  const config: ProjectConfig = {
    name: path.basename(cwd),
    integrations,
    aiProvider,
  };

  const result = await addIntegrations(cwd, config, (step) => console.log(step));

  console.log();
  console.log(`Success! Added integrations: ${result.integrations.join(', ')}`);
  if (result.envVarsNeeded.length > 0) {
    console.log(`Environment variables to configure: ${result.envVarsNeeded.join(', ')}`);
  }
}

async function runFromConfigFile(configPath: string) {
  const resolved = path.resolve(configPath);
  const raw = await fs.readFile(resolved, 'utf-8');
  const parsed = JSON.parse(raw);

  const config: ProjectConfig = {
    name: parsed.name,
    integrations: parsed.integrations || [],
    aiProvider: parsed.aiProvider,
  };

  const errors = validateProjectConfig(config);
  if (errors.length > 0) {
    console.error('Config validation errors:');
    errors.forEach((e) => console.error(`  - ${e.field}: ${e.message}`));
    process.exit(1);
  }

  const result = await createProject(config, (step) => console.log(step));

  console.log();
  console.log(`Success! Created ${config.name} at ${result.projectPath}`);
  if (result.integrations.length > 0) {
    console.log(`Integrations: ${result.integrations.join(', ')}`);
  }
  if (result.envVarsNeeded.length > 0) {
    console.log(`Environment variables to configure: ${result.envVarsNeeded.join(', ')}`);
  }
}

program.parse();
