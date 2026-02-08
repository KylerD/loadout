export const clerkTemplates = {
  // User service with proper DI
  userService: `import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export class UserService {
  /**
   * Get the current authenticated user
   * Returns null if not authenticated
   */
  async getCurrentUser() {
    return currentUser();
  }

  /**
   * Get the current auth state
   * Returns userId, sessionId, orgId etc.
   */
  async getAuth() {
    return auth();
  }

  /**
   * Get the current user ID or throw if not authenticated
   */
  async requireUserId(): Promise<string> {
    const { userId } = await auth();
    if (!userId) {
      redirect('/sign-in');
    }
    return userId;
  }

  /**
   * Get the current user or throw if not authenticated
   */
  async requireUser() {
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }
    return user;
  }

  /**
   * Check if the current user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const { userId } = await auth();
    return !!userId;
  }

  /**
   * Get the current organization ID if in an org context
   */
  async getOrgId(): Promise<string | null> {
    const { orgId } = await auth();
    return orgId;
  }

  /**
   * Get user by ID using Clerk Backend API
   */
  async getUserById(userId: string) {
    const client = await clerkClient();
    return client.users.getUser(userId);
  }

  /**
   * Update user metadata
   */
  async updateUserMetadata(
    userId: string,
    metadata: { publicMetadata?: Record<string, unknown>; privateMetadata?: Record<string, unknown> }
  ) {
    const client = await clerkClient();
    return client.users.updateUserMetadata(userId, metadata);
  }
}

// Export singleton instance
export const userService = new UserService();
`,

  // proxy.ts for Next.js 16+
  proxy: `import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/privacy',
  '/terms',
]);

// Webhook routes that bypass auth (add your webhook endpoints here)
const isWebhookRoute = createRouteMatcher([
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req) && !isWebhookRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
`,

  // Auth components using native Clerk buttons
  authComponents: `'use client';

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function AuthButtons() {
  return (
    <div className="flex items-center gap-4">
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="ghost">Sign In</Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button>Sign Up</Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </div>
  );
}
`,

  wrapLayout: (content: string): string => {
    // Add ClerkProvider import
    const importStatement = "import { ClerkProvider } from '@clerk/nextjs';\n";

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

    // Wrap body children with ClerkProvider
    newContent = newContent.replace(
      /(<body[^>]*>)([\s\S]*?)(<\/body>)/,
      '$1\n        <ClerkProvider>$2</ClerkProvider>\n      $3'
    );

    return newContent;
  },
};
