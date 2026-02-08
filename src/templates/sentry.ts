export const sentryTemplates = {
  clientConfig: `import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
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
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    // Scrub PII from user data
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
      delete event.user.username;
    }

    // Scrub sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['Authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['Cookie'];
      delete event.request.headers['x-api-key'];
      delete event.request.headers['X-API-Key'];
    }

    return event;
  },
});
`,

  serverConfig: `import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    // Scrub PII from user data
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
      delete event.user.username;
    }

    // Scrub sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['Authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['Cookie'];
      delete event.request.headers['x-api-key'];
      delete event.request.headers['X-API-Key'];
    }

    return event;
  },
});
`,

  edgeConfig: `import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    // Scrub PII from user data
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
      delete event.user.username;
    }

    // Scrub sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['Authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['Cookie'];
      delete event.request.headers['x-api-key'];
      delete event.request.headers['X-API-Key'];
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
  /**
   * Capture an exception with optional context
   * Note: PII is automatically scrubbed by Sentry config
   */
  captureException(error: Error, context?: Record<string, unknown>) {
    Sentry.captureException(error, {
      extra: context,
    });
  }

  /**
   * Capture a message with severity level
   */
  captureMessage(
    message: string,
    level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info'
  ) {
    Sentry.captureMessage(message, level);
  }

  /**
   * Set the current user context (only non-PII fields)
   * Email and IP are automatically scrubbed
   */
  setUser(user: { id: string } | null) {
    Sentry.setUser(user);
  }

  /**
   * Add a breadcrumb for debugging
   */
  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';
    data?: Record<string, unknown>;
  }) {
    Sentry.addBreadcrumb(breadcrumb);
  }

  /**
   * Set extra context data
   */
  setExtra(key: string, value: unknown) {
    Sentry.setExtra(key, value);
  }

  /**
   * Set tag for filtering
   */
  setTag(key: string, value: string) {
    Sentry.setTag(key, value);
  }
}

// Export singleton instance
export const errorService = new ErrorService();
`,

  nextConfig: `import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
`,
};
