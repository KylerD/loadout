export const posthogTemplates = {
  // instrumentation-client.ts - lightweight PostHog setup for Next.js 15.3+
  instrumentationClient: `import posthog from 'posthog-js';
import { POSTHOG_KEY, POSTHOG_HOST } from '@/lib/config';

posthog.init(POSTHOG_KEY, {
  api_host: POSTHOG_HOST,
  defaults: '2025-05-01',
});
`,

  // Analytics service - client-side helpers
  analyticsService: `'use client';

import posthog from 'posthog-js';
import { useCallback } from 'react';

/**
 * Track an event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  posthog.capture(eventName, properties);
}

/**
 * Identify a user
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>
) {
  posthog.identify(userId, properties);
}

/**
 * Reset user identity (e.g., on logout)
 */
export function resetUser() {
  posthog.reset();
}

/**
 * Hook for tracking events in components
 */
export function useTrackEvent() {
  return useCallback(
    (eventName: string, properties?: Record<string, unknown>) => {
      posthog.capture(eventName, properties);
    },
    []
  );
}

/**
 * Hook for identifying users in components
 */
export function useIdentify() {
  return useCallback(
    (userId: string, properties?: Record<string, unknown>) => {
      posthog.identify(userId, properties);
    },
    []
  );
}
`,
};
