export const sentryTemplates = {
  instrumentation: `import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
`,

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
import NextError from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
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
