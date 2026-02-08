export const sentryTemplates = {
  // instrumentation.ts - registers Sentry for server/edge (Next.js 15+)
  instrumentation: `import * as Sentry from '@sentry/nextjs';

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
`,

  // instrumentation-client.ts - client-side Sentry init (Next.js 15.3+)
  instrumentationClient: `import * as Sentry from '@sentry/nextjs';
import { SENTRY_DSN } from '@/lib/config';

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
`,

  serverConfig: `import * as Sentry from '@sentry/nextjs';
import { SENTRY_DSN } from '@/lib/config';

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') return null;

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
`,

  edgeConfig: `import * as Sentry from '@sentry/nextjs';
import { SENTRY_DSN } from '@/lib/config';

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') return null;

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
`,

  globalError: `'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">Something went wrong!</h2>
          <p className="text-muted-foreground">
            We've been notified and are working on a fix.
          </p>
          <Button onClick={() => reset()}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
`,

  // Error service for manual error tracking
  errorService: `import * as Sentry from '@sentry/nextjs';

export class ErrorService {
  captureException(error: Error, context?: Record<string, unknown>) {
    Sentry.captureException(error, { extra: context });
  }

  captureMessage(
    message: string,
    level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info'
  ) {
    Sentry.captureMessage(message, level);
  }

  setUser(user: { id: string } | null) {
    Sentry.setUser(user);
  }

  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';
    data?: Record<string, unknown>;
  }) {
    Sentry.addBreadcrumb(breadcrumb);
  }
}

export const errorService = new ErrorService();
`,

  nextConfig: `import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import { SENTRY_ORG, SENTRY_PROJECT } from './lib/config';

const nextConfig: NextConfig = {};

export default withSentryConfig(nextConfig, {
  org: SENTRY_ORG,
  project: SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
});
`,
};
