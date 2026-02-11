import fs from 'fs/promises';
import path from 'path';
import type { ProjectConfig, IntegrationId } from './types.js';

const integrationNames: Record<IntegrationId, string> = {
  clerk: 'Clerk',
  'neon-drizzle': 'Neon + Drizzle',
  'ai-sdk': 'Vercel AI SDK',
  resend: 'Resend',
  postmark: 'Postmark',
  firecrawl: 'Firecrawl',
  inngest: 'Inngest',
  uploadthing: 'UploadThing',
  stripe: 'Stripe',
  posthog: 'PostHog',
  sentry: 'Sentry',
};

export async function generateReadme(
  projectPath: string,
  config: ProjectConfig
): Promise<void> {
  let content = `# ${config.name}

A Next.js application scaffolded with [create-loadout](https://github.com/your-org/create-loadout).

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy the environment file and configure your API keys:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Zod](https://zod.dev/) - Schema validation
`;

  if (config.integrations.length > 0) {
    content += `\n### Integrations\n\n`;
    for (const id of config.integrations) {
      content += `- ${integrationNames[id]}\n`;
    }
  }

  content += `
## Scripts

\`\`\`bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
\`\`\`
`;

  if (config.integrations.includes('neon-drizzle')) {
    content += `
### Database

\`\`\`bash
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
\`\`\`
`;
  }

  if (config.integrations.includes('inngest')) {
    content += `
### Background Jobs

\`\`\`bash
npm run inngest:dev  # Start Inngest dev server
\`\`\`
`;
  }

  content += `
## Project Structure

\`\`\`
├── app/           # Next.js App Router
├── components/    # React components
├── lib/           # Utilities and clients
├── services/      # Business logic
`;

  if (config.integrations.includes('resend') || config.integrations.includes('postmark')) {
    content += `├── emails/        # Email templates\n`;
  }

  content += `└── public/        # Static assets
\`\`\`

## Environment Variables

See \`.env.example\` for all required environment variables.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [CLAUDE.md](./CLAUDE.md) - AI assistant context file
`;

  await fs.writeFile(path.join(projectPath, 'README.md'), content);
}

export async function generateGitignore(projectPath: string): Promise<void> {
  const content = `# Dependencies
node_modules/
.pnp/
.pnp.js

# Build
.next/
out/
build/
dist/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Testing
coverage/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Claude Code
.claude/

# OS
.DS_Store
Thumbs.db

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Drizzle
drizzle/

# Sentry
.sentryclirc
`;

  await fs.writeFile(path.join(projectPath, '.gitignore'), content);
}
