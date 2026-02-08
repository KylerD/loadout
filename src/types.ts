export type IntegrationId =
  | 'clerk'
  | 'neon-drizzle'
  | 'ai-sdk'
  | 'resend'
  | 'firecrawl'
  | 'inngest'
  | 'uploadthing'
  | 'stripe'
  | 'posthog'
  | 'sentry';

export interface Integration {
  id: IntegrationId;
  name: string;
  description: string;
  packages: string[];
  devPackages?: string[];
  envVars: EnvVar[];
  setup: (projectPath: string) => Promise<void>;
}

export interface EnvVar {
  key: string;
  description: string;
  example: string;
  isPublic?: boolean;
}

export interface ProjectConfig {
  name: string;
  integrations: IntegrationId[];
}

export interface TemplateFile {
  path: string;
  content: string;
}
