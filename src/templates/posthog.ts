export const posthogTemplates = {
  // instrumentation-client.ts - lightweight PostHog setup for Next.js 15.3+
  // Client components can then just: import posthog from 'posthog-js'
  instrumentationClient: `import posthog from 'posthog-js';
import { POSTHOG_KEY, POSTHOG_HOST } from '@/lib/config';

posthog.init(POSTHOG_KEY, {
  api_host: POSTHOG_HOST,
  defaults: '2025-11-30',
});
`,
};
