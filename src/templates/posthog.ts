export const posthogTemplates = {
  // PostHog provider component
  posthogProvider: `'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
`,

  // Analytics service
  analyticsService: `'use client';

import posthog from 'posthog-js';
import { usePostHog } from 'posthog-js/react';
import { useCallback } from 'react';

/**
 * Track an event (client-side only)
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  posthog.capture(eventName, properties);
}

/**
 * Identify a user (client-side only)
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
 * Set user properties without identifying
 */
export function setUserProperties(properties: Record<string, unknown>) {
  posthog.people.set(properties);
}

/**
 * Hook for tracking events in components
 */
export function useTrackEvent() {
  const posthog = usePostHog();

  return useCallback(
    (eventName: string, properties?: Record<string, unknown>) => {
      posthog.capture(eventName, properties);
    },
    [posthog]
  );
}

/**
 * Hook for identifying users in components
 */
export function useIdentify() {
  const posthog = usePostHog();

  return useCallback(
    (userId: string, properties?: Record<string, unknown>) => {
      posthog.identify(userId, properties);
    },
    [posthog]
  );
}
`,

  // Analytics components
  analyticsComponents: `'use client';

import { usePostHog } from 'posthog-js/react';
import { useCallback, type ReactNode } from 'react';

interface TrackClickProps {
  eventName: string;
  properties?: Record<string, unknown>;
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper component that tracks clicks
 */
export function TrackClick({
  eventName,
  properties,
  children,
  className,
}: TrackClickProps) {
  const posthog = usePostHog();

  const handleClick = useCallback(() => {
    posthog.capture(eventName, properties);
  }, [posthog, eventName, properties]);

  return (
    <div onClick={handleClick} className={className}>
      {children}
    </div>
  );
}
`,

  wrapLayout: (content: string): string => {
    // Add PostHogProvider import
    const importStatement = "import { PostHogProvider } from './providers';\n";

    // Find the import section and add our import
    const importMatch = content.match(/^(import[\s\S]*?from\s+['"][^'"]+['"];\n*)+/m);
    let newContent = content;

    if (importMatch) {
      const lastImportIndex = importMatch.index! + importMatch[0].length;
      newContent =
        content.slice(0, lastImportIndex) + importStatement + content.slice(lastImportIndex);
    } else {
      newContent = importStatement + content;
    }

    // Check if ClerkProvider is already wrapping
    if (newContent.includes('<ClerkProvider>')) {
      // Wrap inside ClerkProvider
      newContent = newContent.replace(
        /(<ClerkProvider>)([\s\S]*?)(<\/ClerkProvider>)/,
        '$1\n          <PostHogProvider>$2</PostHogProvider>\n        $3'
      );
    } else {
      // Wrap body children with PostHogProvider
      newContent = newContent.replace(
        /(<body[^>]*>)([\s\S]*?)(<\/body>)/,
        '$1\n        <PostHogProvider>$2</PostHogProvider>\n      $3'
      );
    }

    return newContent;
  },
};
