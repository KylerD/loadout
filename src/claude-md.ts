import fs from 'fs/promises';
import path from 'path';
import type { ProjectConfig, IntegrationId } from './types.js';

interface StackSection {
  id: IntegrationId | 'core';
  name: string;
  items: { name: string; url: string; description: string }[];
}

const stackSections: StackSection[] = [
  {
    id: 'core',
    name: 'Core',
    items: [
      { name: 'Next.js', url: 'https://nextjs.org/docs', description: 'React framework with App Router' },
      { name: 'TypeScript', url: 'https://www.typescriptlang.org/docs/', description: 'Type safety' },
      { name: 'Tailwind CSS', url: 'https://tailwindcss.com/docs', description: 'Utility-first CSS' },
      { name: 'shadcn/ui', url: 'https://ui.shadcn.com/docs', description: 'UI components' },
      { name: 'Zod', url: 'https://zod.dev/', description: 'Schema validation' },
    ],
  },
  {
    id: 'clerk',
    name: 'Authentication',
    items: [
      { name: 'Clerk', url: 'https://clerk.com/docs', description: 'Authentication and user management' },
    ],
  },
  {
    id: 'neon-drizzle',
    name: 'Database',
    items: [
      { name: 'Neon', url: 'https://neon.tech/docs', description: 'Serverless Postgres' },
      { name: 'Drizzle ORM', url: 'https://orm.drizzle.team/docs/overview', description: 'TypeScript ORM' },
    ],
  },
  {
    id: 'ai-sdk',
    name: 'AI',
    items: [
      { name: 'Vercel AI SDK', url: 'https://sdk.vercel.ai/docs', description: 'AI integration' },
    ],
  },
  {
    id: 'resend',
    name: 'Email',
    items: [
      { name: 'Resend', url: 'https://resend.com/docs', description: 'Email API' },
    ],
  },
  {
    id: 'firecrawl',
    name: 'Scraping',
    items: [
      { name: 'Firecrawl', url: 'https://docs.firecrawl.dev/', description: 'Web scraping' },
    ],
  },
  {
    id: 'inngest',
    name: 'Background Jobs',
    items: [
      { name: 'Inngest', url: 'https://www.inngest.com/docs', description: 'Background jobs and workflows' },
    ],
  },
  {
    id: 'uploadthing',
    name: 'File Uploads',
    items: [
      { name: 'UploadThing', url: 'https://docs.uploadthing.com/', description: 'File uploads' },
    ],
  },
  {
    id: 'stripe',
    name: 'Payments',
    items: [
      { name: 'Stripe', url: 'https://docs.stripe.com/', description: 'Payments and subscriptions' },
    ],
  },
  {
    id: 'posthog',
    name: 'Analytics',
    items: [
      { name: 'PostHog', url: 'https://posthog.com/docs', description: 'Product analytics' },
    ],
  },
  {
    id: 'sentry',
    name: 'Error Tracking',
    items: [
      { name: 'Sentry', url: 'https://docs.sentry.io/platforms/javascript/guides/nextjs/', description: 'Error monitoring' },
    ],
  },
];

export async function generateClaudeMd(
  projectPath: string,
  config: ProjectConfig
): Promise<void> {
  const sections = stackSections.filter(
    (section) => section.id === 'core' || config.integrations.includes(section.id as IntegrationId)
  );

  let content = `# ${config.name}

## Tech Stack

`;

  for (const section of sections) {
    content += `### ${section.name}\n`;
    for (const item of section.items) {
      content += `- [${item.name}](${item.url}) - ${item.description}\n`;
    }
    content += '\n';
  }

  // Add project structure section
  content += `## Project Structure

\`\`\`
├── app/              # Next.js App Router pages and API routes
├── components/       # React components (including shadcn/ui)
`;

  if (config.integrations.includes('resend')) {
    content += `│   └── emails/       # React Email templates\n`;
  }

  content += `├── lib/              # Configuration and service clients
│   ├── config.ts     # Centralized environment variables
│   └── *.client.ts   # Provider client configurations
├── services/         # Business logic services
│   └── *.service.ts
└── ...
\`\`\`

## Architecture

This project follows a **service-oriented architecture**:

- **\`lib/config.ts\`** - All environment variables exported with type safety
  \`\`\`typescript
  export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string;
  \`\`\`
- **\`lib/*.client.ts\`** - Provider client configurations (import from config)
- **\`services/*.service.ts\`** - Business logic with constructor-based DI
- **\`components/\`** - React components
- **\`app/api/\`** - API routes (only for external APIs)

## Development

\`\`\`bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
\`\`\`
`;

  if (config.integrations.includes('neon-drizzle')) {
    content += `
### Database Commands

\`\`\`bash
npm run db:generate  # Generate migrations from schema changes
npm run db:migrate   # Apply migrations to database
npm run db:studio    # Open Drizzle Studio to browse data
\`\`\`
`;
  }

  if (config.integrations.includes('inngest')) {
    content += `
### Background Jobs

\`\`\`bash
npm run inngest:dev  # Start Inngest dev server for local testing
\`\`\`
`;
  }

  content += `
## Environment Variables

Copy \`.env.example\` to \`.env.local\` and fill in your API keys.

See \`.env.example\` for all required variables and setup instructions.

**Important:** Import environment variables from \`@/lib/config\` instead of \`process.env\`:

\`\`\`typescript
// Good
import { STRIPE_SECRET_KEY } from '@/lib/config';

// Avoid
const key = process.env.STRIPE_SECRET_KEY;
\`\`\`
`;

  await fs.writeFile(path.join(projectPath, 'CLAUDE.md'), content);
}
