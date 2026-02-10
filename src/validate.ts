import type { IntegrationId, AIProviderChoice, ProjectConfig } from './types.js';

export const ALL_INTEGRATION_IDS: IntegrationId[] = [
  'clerk',
  'neon-drizzle',
  'ai-sdk',
  'resend',
  'postmark',
  'firecrawl',
  'inngest',
  'uploadthing',
  'stripe',
  'posthog',
  'sentry',
];

export const AI_PROVIDERS: AIProviderChoice[] = ['openai', 'anthropic', 'google'];

const EMAIL_PROVIDERS: IntegrationId[] = ['resend', 'postmark'];

const PROJECT_NAME_REGEX = /^[a-z0-9-]+$/;

export interface ValidationError {
  field: string;
  message: string;
}

export function validateProjectName(name: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!name.trim()) {
    errors.push({ field: 'name', message: 'Project name is required' });
  } else if (!PROJECT_NAME_REGEX.test(name)) {
    errors.push({
      field: 'name',
      message: 'Project name can only contain lowercase letters, numbers, and hyphens',
    });
  }
  return errors;
}

export function validateIntegrationSelection(ids: string[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const id of ids) {
    if (!ALL_INTEGRATION_IDS.includes(id as IntegrationId)) {
      errors.push({
        field: 'integrations',
        message: `Unknown integration: "${id}". Valid: ${ALL_INTEGRATION_IDS.join(', ')}`,
      });
    }
  }

  const selectedEmail = ids.filter((id) => EMAIL_PROVIDERS.includes(id as IntegrationId));
  if (selectedEmail.length > 1) {
    errors.push({
      field: 'integrations',
      message: 'Only one email provider allowed (resend or postmark)',
    });
  }

  return errors;
}

export function validateProjectConfig(config: {
  name: string;
  integrations: string[];
  aiProvider?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  errors.push(...validateProjectName(config.name));
  errors.push(...validateIntegrationSelection(config.integrations));

  if (config.integrations.includes('ai-sdk') && !config.aiProvider) {
    errors.push({
      field: 'aiProvider',
      message: 'aiProvider is required when ai-sdk is selected (openai, anthropic, or google)',
    });
  }

  if (config.aiProvider && !AI_PROVIDERS.includes(config.aiProvider as AIProviderChoice)) {
    errors.push({
      field: 'aiProvider',
      message: `Invalid AI provider: "${config.aiProvider}". Valid: ${AI_PROVIDERS.join(', ')}`,
    });
  }

  return errors;
}
