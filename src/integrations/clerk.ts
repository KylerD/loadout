import fs from 'fs/promises';
import path from 'path';
import type { Integration } from '../types.js';
import { clerkTemplates } from '../templates/clerk.js';

export const clerkIntegration: Integration = {
  id: 'clerk',
  name: 'Clerk',
  description: 'Authentication and user management',
  packages: ['@clerk/nextjs'],
  envVars: [
    {
      key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      description: 'Clerk publishable key',
      example: 'pk_test_...',
      isPublic: true,
    },
    {
      key: 'CLERK_SECRET_KEY',
      description: 'Clerk secret key',
      example: 'sk_test_...',
    },
    {
      key: 'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
      description: 'Sign in URL',
      example: '/sign-in',
      isPublic: true,
    },
    {
      key: 'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
      description: 'Sign up URL',
      example: '/sign-up',
      isPublic: true,
    },
  ],
  setup: async (projectPath: string) => {
    // Create services directory
    await fs.mkdir(path.join(projectPath, 'services'), { recursive: true });

    // Create user service
    await fs.writeFile(
      path.join(projectPath, 'services/user.service.ts'),
      clerkTemplates.userService
    );

    // Create proxy.ts (Next.js 16+)
    await fs.writeFile(
      path.join(projectPath, 'proxy.ts'),
      clerkTemplates.proxy
    );

    // Create auth components
    await fs.mkdir(path.join(projectPath, 'components'), { recursive: true });
    await fs.writeFile(
      path.join(projectPath, 'components/auth-buttons.tsx'),
      clerkTemplates.authComponents
    );

    // Update layout.tsx to include ClerkProvider
    const layoutPath = path.join(projectPath, 'app/layout.tsx');
    const layoutContent = await fs.readFile(layoutPath, 'utf-8');
    const updatedLayout = clerkTemplates.wrapLayout(layoutContent);
    await fs.writeFile(layoutPath, updatedLayout);
  },
};
