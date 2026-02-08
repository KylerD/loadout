# create-loadout

A custom Next.js scaffolding CLI that wraps `create-next-app` and extends it with optional integrations for common SaaS building blocks.

## Usage

```bash
npx create-loadout
```

Or with npm:

```bash
npm create loadout
```

## What it does

1. Runs `create-next-app` with recommended defaults:
   - TypeScript
   - Tailwind CSS
   - ESLint
   - App Router

2. Sets up shadcn/ui with common components

3. Prompts for optional integrations (10 total)

4. Installs selected packages and generates ready-to-use boilerplate

5. Creates `CLAUDE.md`, `README.md`, `.gitignore`, and `.env.example`

## Architecture

Generated projects follow a **layered architecture** with clear separation of concerns:

```
UI Components (app/, components/)
    ↓
Server Actions (actions/*.actions.ts)
    ↓
Services (services/*.service.ts)
    ↓
DAOs (dao/*.dao.ts)
    ↓
Database (Drizzle ORM)
```

### Directory Structure

```
├── app/                    # Next.js App Router pages and API routes
├── components/             # React components (including shadcn/ui)
│   └── emails/             # Email templates (if Resend selected)
├── actions/                # Server actions (form submissions)
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
│   └── *.state.ts          # Action state objects
├── lib/
│   ├── config.ts           # Centralized environment variables
│   └── db/                 # Database client and schema
└── ...
```

Services use **constructor-based dependency injection** with singleton exports for Next.js serverless compatibility.

All environment variables are centralized in `lib/config.ts` for type-safe access:
```typescript
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string;
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL as string;
```

## Available Integrations

| Integration | Packages | Purpose |
|-------------|----------|---------|
| **Clerk** | `@clerk/nextjs` | Authentication and user management |
| **Neon + Drizzle** | `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit` | Serverless Postgres with TypeScript ORM |
| **Vercel AI SDK** | `ai`, `@ai-sdk/openai` or `anthropic` or `google` | AI integration with structured generation |
| **Resend** | `resend` | Email API |
| **Firecrawl** | `@mendable/firecrawl-js` | Web scraping |
| **Inngest** | `inngest` | Background jobs and workflows |
| **UploadThing** | `uploadthing`, `@uploadthing/react` | File uploads |
| **Stripe** | `stripe` | Payments and subscriptions |
| **PostHog** | `posthog-js` | Product analytics |
| **Sentry** | `@sentry/nextjs` | Error tracking |

All projects include `zod` for schema validation, `zustand` for client state management, and `shadcn/ui` for components.

## Generated Files

Each integration generates appropriate files following the layered architecture:

### Clerk
- `services/user.service.ts` - Server-side user lookups (getUserById, etc.)
- `components/auth-buttons.tsx` - SignInButton/SignUpButton components
- `proxy.ts` - Route protection (Next.js 16+)
- Client-side: Use Clerk hooks (`useUser()`, `useAuth()`) directly

### Neon + Drizzle

Generates a complete Todo example demonstrating the full architecture:

- `lib/db/schema.ts` - Database schema with `todos` table
- `lib/db/client.ts` - Database client
- `models/todo.dto.ts` - Database types (`TodoDto`, `TodoInsertDto`)
- `models/todo.view.ts` - View model for UI
- `models/todoCreate.schema.ts` - Zod schema + service types
- `models/todoCreate.state.ts` - Action state
- `dao/todo.dao.ts` - Database queries
- `mappers/todo.mapper.ts` - DTO ↔ View transformations
- `services/todo.service.ts` - Business logic
- `actions/todo.actions.ts` - Server actions
- `drizzle.config.ts` - Drizzle Kit config

### Vercel AI SDK
- `services/ai.service.ts` - AI operations (generateObject, generateText)

### Resend
- `services/email.service.ts` - Email sending operations
- `components/emails/welcome.tsx` - Example email template
- `app/api/email/send/route.ts` - Send endpoint

### Firecrawl
- `services/scrape.service.ts` - Scraping operations (scrapeUrl, crawlSite)
- `app/api/scrape/route.ts` - Scrape endpoint

### Inngest
- `lib/inngest.client.ts` - Inngest client
- `lib/inngest.functions.ts` - Example functions
- `services/jobs.service.ts` - Job triggering operations
- `app/api/inngest/route.ts` - Inngest handler

### UploadThing
- `lib/uploadthing.client.ts` - React helpers
- `services/file.service.ts` - File operations
- `app/api/uploadthing/core.ts` - FileRouter
- `app/api/uploadthing/route.ts` - Route handler
- `components/upload-button.tsx` - Upload components

### Stripe
- `services/payment.service.ts` - Payment operations (checkout, portal, webhooks)
- `app/api/stripe/checkout/route.ts` - Checkout endpoint
- `app/api/stripe/webhooks/route.ts` - Webhook handler
- `app/api/stripe/portal/route.ts` - Customer portal

### PostHog
- `instrumentation-client.ts` - Lightweight init (Next.js 15.3+)
- Client-side: Use `posthog` directly (`import posthog from 'posthog-js'`)

### Sentry
- `instrumentation.ts` - Server/edge registration (Next.js 15+)
- `instrumentation-client.ts` - Client-side init (Next.js 15.3+)
- `sentry.server.config.ts` - Server-side config
- `sentry.edge.config.ts` - Edge config
- `app/global-error.tsx` - Error boundary
- Use `Sentry` directly (`import * as Sentry from '@sentry/nextjs'`)

## Environment Variables

The CLI generates:

- `.env.example` - Documented template with all variables and setup URLs
- `.env.local` - Empty file for your actual values (gitignored)

## Development

```bash
# Clone the repo
git clone https://github.com/your-org/create-loadout.git
cd create-loadout

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Test locally
npm link
create-loadout
```

## License

MIT
