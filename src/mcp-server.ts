#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import path from 'path';
import { createProject, addIntegrations } from './engine.js';
import {
  validateProjectConfig,
  validateIntegrationSelection,
  ALL_INTEGRATION_IDS,
  AI_PROVIDERS,
} from './validate.js';
import { listIntegrations } from './metadata.js';
import {
  isExistingProject,
  getInstalledIntegrations,
  getAvailableIntegrations,
} from './detect.js';
import type { IntegrationId, AIProviderChoice, ProjectConfig } from './types.js';

const server = new McpServer({
  name: 'create-loadout',
  version: '1.0.1',
});

// Tool: list_integrations
server.tool(
  'list_integrations',
  'List all available integrations with metadata, env vars, and constraints',
  {},
  async () => {
    const integrations = listIntegrations();
    return {
      content: [{ type: 'text', text: JSON.stringify(integrations, null, 2) }],
    };
  }
);

// Tool: create_project
server.tool(
  'create_project',
  'Scaffold a new Next.js project with selected integrations',
  {
    name: z.string().describe('Project name (lowercase, numbers, hyphens only)'),
    integrations: z.array(z.string()).default([]).describe('Integration IDs to install'),
    aiProvider: z.enum(['openai', 'anthropic', 'google']).optional().describe('AI provider (required if ai-sdk selected)'),
  },
  async ({ name, integrations, aiProvider }) => {
    const config: ProjectConfig = {
      name,
      integrations: integrations as IntegrationId[],
      aiProvider: aiProvider as AIProviderChoice | undefined,
    };

    const errors = validateProjectConfig(config);
    if (errors.length > 0) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: 'Validation failed', details: errors }),
        }],
        isError: true,
      };
    }

    const log: string[] = [];
    const result = await createProject(config, (step) => log.push(step));

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          projectPath: result.projectPath,
          integrations: result.integrations,
          envVarsNeeded: result.envVarsNeeded,
          log,
        }, null, 2),
      }],
    };
  }
);

// Tool: add_integrations
server.tool(
  'add_integrations',
  'Add integrations to an existing Next.js project',
  {
    projectPath: z.string().describe('Absolute path to the existing Next.js project'),
    integrations: z.array(z.string()).describe('Integration IDs to add'),
    aiProvider: z.enum(['openai', 'anthropic', 'google']).optional().describe('AI provider (required if ai-sdk selected)'),
  },
  async ({ projectPath, integrations, aiProvider }) => {
    const resolved = path.resolve(projectPath);

    if (!(await isExistingProject(resolved))) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: 'Not a Next.js project', path: resolved }),
        }],
        isError: true,
      };
    }

    const valErrors = validateIntegrationSelection(integrations);
    if (valErrors.length > 0) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: 'Validation failed', details: valErrors }),
        }],
        isError: true,
      };
    }

    const installed = await getInstalledIntegrations(resolved);
    const alreadyInstalled = integrations.filter((id) => installed.includes(id as IntegrationId));
    if (alreadyInstalled.length > 0) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: 'Already installed', integrations: alreadyInstalled }),
        }],
        isError: true,
      };
    }

    if (integrations.includes('ai-sdk') && !aiProvider) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: 'aiProvider required when ai-sdk is selected' }),
        }],
        isError: true,
      };
    }

    const config: ProjectConfig = {
      name: path.basename(resolved),
      integrations: integrations as IntegrationId[],
      aiProvider: aiProvider as AIProviderChoice | undefined,
    };

    const log: string[] = [];
    const result = await addIntegrations(resolved, config, (step) => log.push(step));

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          projectPath: result.projectPath,
          integrations: result.integrations,
          envVarsNeeded: result.envVarsNeeded,
          log,
        }, null, 2),
      }],
    };
  }
);

// Tool: detect_project
server.tool(
  'detect_project',
  'Check if a directory is a Next.js project and list installed/available integrations',
  {
    projectPath: z.string().optional().describe('Path to check (defaults to cwd)'),
  },
  async ({ projectPath }) => {
    const resolved = path.resolve(projectPath || process.cwd());
    const isProject = await isExistingProject(resolved);

    if (!isProject) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            isNextJsProject: false,
            path: resolved,
          }, null, 2),
        }],
      };
    }

    const installed = await getInstalledIntegrations(resolved);
    const available = getAvailableIntegrations(installed);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          isNextJsProject: true,
          path: resolved,
          installedIntegrations: installed,
          availableIntegrations: available,
        }, null, 2),
      }],
    };
  }
);

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

run().catch((error) => {
  console.error('MCP server error:', error);
  process.exit(1);
});
