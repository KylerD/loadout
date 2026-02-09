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
      { name: 'Zustand', url: 'https://zustand.docs.pmnd.rs/', description: 'Client state management' },
      { name: 'Luxon', url: 'https://moment.github.io/luxon/', description: 'Date/time manipulation' },
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

  const hasDb = config.integrations.includes('neon-drizzle');
  const hasPostHog = config.integrations.includes('posthog');
  const hasSentry = config.integrations.includes('sentry');
  const hasClerk = config.integrations.includes('clerk');

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

  content += `## Development Commands

\`\`\`bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
\`\`\`
`;

  if (hasDb) {
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
## Architecture

### Directory Structure

\`\`\`
├── app/                    # Next.js App Router pages and API routes
├── components/             # React components (including shadcn/ui)
`;

  if (config.integrations.includes('resend')) {
    content += `│   └── emails/             # React Email templates
`;
  }

  if (hasPostHog || hasSentry) {
    content += `├── instrumentation-client.ts  # Client-side init
`;
  }
  if (hasSentry) {
    content += `├── instrumentation.ts         # Server-side Sentry registration
`;
  }

  if (hasDb) {
    content += `├── actions/                # Server actions (form submissions)
│   └── *.actions.ts
├── services/               # Business logic orchestration
│   └── *.service.ts
├── dao/                    # Data access objects (database queries)
│   └── *.dao.ts
├── mappers/                # Data transformation
│   └── *.mapper.ts
├── models/                 # Type definitions
│   ├── *.dto.ts            # Database types (InferSelectModel)
│   ├── *.view.ts           # View models for UI
│   ├── *.schema.ts         # Zod validation + ServiceRequest/Result
│   ├── *.state.ts          # Action state objects
│   └── *ServiceError.enum.ts  # Service error enums
`;
  } else {
    content += `├── services/               # Business logic services
│   └── *.service.ts
`;
  }

  content += `├── lib/
│   ├── config.ts           # Centralized environment variables
│   ├── stores/             # Zustand stores for client state
│   │   └── *.store.ts
`;

  if (hasDb) {
    content += `│   └── db/                 # Database client and schema
`;
  }

  content += `└── public/                 # Static assets
\`\`\`
`;

  if (hasDb) {
    content += `
### Layered Architecture

The application follows a strict 4-layer architecture:

\`\`\`
UI Components (app/, components/)
    ↓
Server Actions (actions/*.actions.ts)
    ↓
Services (services/*.service.ts)
    ↓
DAOs (dao/*.dao.ts)
    ↓
Database (Drizzle ORM)
\`\`\`

**Layer responsibilities:**

- **Actions** - Handle form submissions, validate with Zod, check auth, call services, revalidate cache
- **Services** - Orchestrate business logic, coordinate multiple DAOs
- **DAOs** - Encapsulate all database queries using Drizzle ORM
- **Mappers** - Transform between DTOs, service requests, and view models

### Model File Naming Conventions

Files in \`models/\` follow strict naming:

| Pattern | Purpose | Example |
|---------|---------|---------|
| \`*.dto.ts\` | Database types from Drizzle | \`UserDto\`, \`UserInsertDto\` |
| \`*.view.ts\` | View models for UI | \`UserView\` |
| \`*.schema.ts\` | Zod schemas + service types | \`UserCreateFormSchema\`, \`UserCreateServiceRequest\` |
| \`*.state.ts\` | Action state objects | \`UserCreateState\` |
| \`*ServiceError.enum.ts\` | Service error enums | \`UserServiceError\` |

### Action File Organization

One action file per domain entity: \`actions/{entity}.action.ts\`. Do NOT split by operation type.

\`\`\`
actions/
  project.action.ts   # createProject, updateProject, deleteProject, searchProjects
  task.action.ts      # createTask, updateTask, deleteTask, searchTasks
  comment.action.ts   # createComment, deleteComment
  settings.action.ts  # updateSettings
\`\`\`

Do NOT create separate files like \`project.create.action.ts\` or \`task.search.action.ts\`.

### Server Action Pattern

\`\`\`typescript
'use server';

export async function createEntity(
  state: EntityCreateState,
  formData: FormData
): Promise<EntityCreateState> {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: 'Not authenticated', data: null };
  }

  const rawData = Object.fromEntries(formData);
  const validated = EntityCreateSchema.safeParse(rawData);

  if (!validated.success) {
    return { success: false, error: z.prettifyError(validated.error), data: null };
  }

  try {
    const result = await entityService.createEntity(validated.data);
    revalidatePath('/entities');
    return { success: true, error: null, data: result };
  } catch (error) {
    return { success: false, error: 'Failed to create entity', data: null };
  }
}
\`\`\`

### DAO Pattern

\`\`\`typescript
export class EntityDAO {
  async create(dto: EntityInsertDto): Promise<EntityDto | undefined> {
    const [created] = await db.insert(entities).values(dto).returning();
    return created;
  }

  async getById(id: string): Promise<EntityDto | undefined> {
    return await db.query.entities.findFirst({
      where: eq(entities.id, id),
    });
  }
}

export const entityDAO = new EntityDAO();
\`\`\`

### Service Error Enums

Each service class has a corresponding error enum in \`models/{serviceName}ServiceError.enum.ts\`. Services throw errors using enum values, actions catch and translate to user-friendly messages.

\`\`\`typescript
// models/performanceServiceError.enum.ts
export enum PerformanceServiceError {
  NotFound = "PERFORMANCE_NOT_FOUND",
  NotOwned = "PERFORMANCE_NOT_OWNED",
  DuplicateTime = "PERFORMANCE_DUPLICATE_TIME",
}

// services/performance.service.ts
import { PerformanceServiceError } from "@/models/performanceServiceError.enum";

if (conflict) {
  throw new Error(PerformanceServiceError.DuplicateTime);
}

// actions/performance.action.ts
import { PerformanceServiceError } from "@/models/performanceServiceError.enum";

catch (error) {
  if (error instanceof Error) {
    switch (error.message) {
      case PerformanceServiceError.DuplicateTime:
        return { success: false, error: 'A performance already exists at this time', data: null };
      case PerformanceServiceError.NotFound:
        return { success: false, error: 'Performance not found', data: null };
      case PerformanceServiceError.NotOwned:
        return { success: false, error: 'You do not have permission to modify this performance', data: null };
    }
  }
  return { success: false, error: 'Failed to update performance', data: null };
}
\`\`\`
`;
  }

  content += `
## Client State Management (Zustand)

For complex multi-step forms or flows, use Zustand stores.

**Store location**: \`lib/stores/*.store.ts\`

### Store Pattern

\`\`\`typescript
import { createStore, useStore } from 'zustand';

interface FormState {
  title: string;
  description: string;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  reset: () => void;
}

const initialState = {
  title: '',
  description: '',
};

export const formStore = createStore<FormState>()((set) => ({
  ...initialState,
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  reset: () => set(initialState),
}));

export const useFormStore = <T>(selector: (state: FormState) => T): T => {
  return useStore(formStore, selector);
};
\`\`\`

### Usage in Components

\`\`\`tsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function TitleStep() {
  const title = useFormStore((state) => state.title);
  const setTitle = useFormStore((state) => state.setTitle);

  return (
    <div className="space-y-2">
      <Label htmlFor="title">Title</Label>
      <Input
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a title"
      />
    </div>
  );
}
\`\`\`

## Code Style

### No Comments

Do not add comments to the codebase. Code should be self-documenting through:
- Clear, descriptive variable and function names
- Proper TypeScript types
- Logical code structure
- Small, focused functions

### Closure Variable Naming

Always use verbose singular names in closures (\`.map()\`, \`.filter()\`, etc.):

\`\`\`typescript
// ✅ Correct
users.map((user) => user.email)
items.filter((item) => item.isActive)

// ❌ Wrong
users.map((u) => u.email)
items.filter((i) => i.isActive)
\`\`\`

## Utility Functions

Import from \`@/lib/utils\`:

\`\`\`typescript
import { cn, formatDate, formatRelative, debounce } from '@/lib/utils';

// Class name merging (shadcn/ui)
cn('text-sm', isActive && 'text-blue-500')

// Date formatting with Luxon
formatDate(new Date())                    // "Jan 15, 2024"
formatDate('2024-01-15', 'yyyy-MM-dd')   // "2024-01-15"
formatRelative(new Date())                // "2 hours ago"

// Debounce function calls
const debouncedSearch = debounce((query: string) => {
  // search logic
}, 300);
\`\`\`

## Environment Variables

Copy \`.env.example\` to \`.env.local\` and fill in your API keys.

**Important:** Import environment variables from \`@/lib/config\`:

\`\`\`typescript
// ✅ Good
import { STRIPE_SECRET_KEY } from '@/lib/config';

// ❌ Avoid
const key = process.env.STRIPE_SECRET_KEY;
\`\`\`
`;

  if (hasClerk) {
    content += `
## Authentication

**Provider:** Clerk

- Route protection via \`proxy.ts\` (Next.js 16+)
- Use \`currentUser()\` in Server Components and Actions for auth checks
- Client-side: Use Clerk hooks (\`useUser()\`, \`useAuth()\`, \`<SignedIn>\`, \`<SignedOut>\`)

\`\`\`typescript
// Server-side auth check
const user = await currentUser();
if (!user) {
  return redirect('/');
}
\`\`\`
`;
  }

  await fs.writeFile(path.join(projectPath, 'CLAUDE.md'), content);
}
