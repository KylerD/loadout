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

Generated projects follow a **service-oriented architecture**:

```
├── app/           # Next.js App Router pages and API routes
├── components/    # React components (including shadcn/ui)
├── lib/           # Client instances and utilities
│   └── *.client.ts
├── services/      # Business logic services
│   └── *.service.ts
└── emails/        # Email templates (if Resend selected)
```

Services use **constructor-based dependency injection** with singleton exports for Next.js serverless compatibility.

## Available Integrations

| Integration | Packages | Purpose |
|-------------|----------|---------|
| **Clerk** | `@clerk/nextjs` | Authentication and user management |
| **Neon + Drizzle** | `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit` | Serverless Postgres with TypeScript ORM |
| **Vercel AI SDK** | `ai`, `@ai-sdk/openai` | AI integration with structured generation |
| **Resend** | `resend` | Email API |
| **Firecrawl** | `@mendable/firecrawl-js` | Web scraping |
| **Inngest** | `inngest` | Background jobs and workflows |
| **UploadThing** | `uploadthing`, `@uploadthing/react` | File uploads |
| **Stripe** | `stripe` | Payments and subscriptions |
| **PostHog** | `posthog-js` | Product analytics |
| **Sentry** | `@sentry/nextjs` | Error tracking |

All projects include `zod` for schema validation and `shadcn/ui` for components.

## Generated Files

Each integration generates a service and supporting files:

### Clerk
- `services/user.service.ts` - User operations (getCurrentUser, requireAuth, etc.)
- `components/auth-buttons.tsx` - SignInButton/SignUpButton components
- `proxy.ts` - Route protection (Next.js 16+)

### Neon + Drizzle
- `lib/db/client.ts` - Database client
- `lib/db/schema.ts` - Example schema
- `services/database.service.ts` - CRUD operations
- `drizzle.config.ts` - Drizzle Kit config

### Vercel AI SDK
- `services/ai.service.ts` - AI operations (generateObject, generateText, streamText)

### Resend
- `services/email.service.ts` - Email sending operations
- `emails/welcome.tsx` - Example email template
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
- `app/providers.tsx` - PostHogProvider
- `services/analytics.service.ts` - Analytics helpers and hooks
- `components/analytics.tsx` - TrackClick component

### Sentry
- `sentry.client.config.ts` - Client-side config
- `sentry.server.config.ts` - Server-side config
- `sentry.edge.config.ts` - Edge config
- `services/error.service.ts` - Error capture helpers
- `app/global-error.tsx` - Error boundary

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
