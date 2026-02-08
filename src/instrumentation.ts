import fs from 'fs/promises';
import path from 'path';
import type { ProjectConfig } from './types.js';

// Generate instrumentation-client.ts content based on selected integrations
export async function generateInstrumentationClient(
  projectPath: string,
  config: ProjectConfig
): Promise<void> {
  const hasPostHog = config.integrations.includes('posthog');
  const hasSentry = config.integrations.includes('sentry');

  if (!hasPostHog && !hasSentry) return;

  let content = '';
  const imports: string[] = [];

  // PostHog initialization
  if (hasPostHog) {
    imports.push("import posthog from 'posthog-js';");
    imports.push("import { POSTHOG_KEY, POSTHOG_HOST } from '@/lib/config';");
  }

  // Sentry initialization
  if (hasSentry) {
    imports.push("import * as Sentry from '@sentry/nextjs';");
    imports.push("import { SENTRY_DSN } from '@/lib/config';");
  }

  content += imports.join('\n') + '\n\n';

  // PostHog init
  if (hasPostHog) {
    content += `// PostHog analytics
posthog.init(POSTHOG_KEY, {
  api_host: POSTHOG_HOST,
  defaults: '2025-05-01',
});
`;
  }

  // Sentry init
  if (hasSentry) {
    if (hasPostHog) content += '\n';
    content += `// Sentry error tracking
Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') return null;

    // Scrub PII
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
      delete event.user.username;
    }
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },
});

// Instrument router navigations for performance
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
`;
  }

  await fs.writeFile(
    path.join(projectPath, 'instrumentation-client.ts'),
    content
  );
}

// Generate instrumentation.ts for server-side (Sentry only currently)
export async function generateInstrumentation(
  projectPath: string,
  config: ProjectConfig
): Promise<void> {
  if (!config.integrations.includes('sentry')) return;

  const content = `import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Capture errors from Server Components, middleware, and proxies
export const onRequestError = Sentry.captureRequestError;
`;

  await fs.writeFile(path.join(projectPath, 'instrumentation.ts'), content);
}
