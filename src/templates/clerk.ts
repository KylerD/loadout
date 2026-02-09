export const clerkTemplates = {
  userService: `import { clerkClient, User } from '@clerk/nextjs/server';

export class UserService {
  async getUserById(userId: string): Promise<User> {
    const client = await clerkClient();
    return client.users.getUser(userId);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const client = await clerkClient();
    const users = await client.users.getUserList({
      emailAddress: [email],
    });
    return users.data[0] ?? null;
  }

  async updateUserMetadata(
    userId: string,
    metadata: {
      publicMetadata?: Record<string, unknown>;
      privateMetadata?: Record<string, unknown>;
    }
  ): Promise<User> {
    const client = await clerkClient();
    return client.users.updateUserMetadata(userId, metadata);
  }

  async deleteUser(userId: string): Promise<User> {
    const client = await clerkClient();
    return client.users.deleteUser(userId);
  }
}

export const userService = new UserService();
`,

  // proxy.ts for Next.js 16+
  proxy: `import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

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
    const importStatement = "import { ClerkProvider } from '@clerk/nextjs';\n";

    const importMatch = content.match(/^(import[\s\S]*?from\s+['"][^'"]+['"];\n*)+/m);
    let newContent = content;

    if (importMatch) {
      const lastImportIndex = importMatch.index! + importMatch[0].length;
      newContent =
        content.slice(0, lastImportIndex) + importStatement + content.slice(lastImportIndex);
    } else {
      newContent = importStatement + content;
    }

    newContent = newContent.replace(
      /(<body[^>]*>)([\s\S]*?)(<\/body>)/,
      '$1\n        <ClerkProvider>$2</ClerkProvider>\n      $3'
    );

    return newContent;
  },
};
