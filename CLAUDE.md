# create-loadout

A CLI tool that scaffolds Next.js projects with optional SaaS integrations.

## Architecture

```
src/
├── index.ts              # Entry point (shebang)
├── cli.ts                # Main orchestration flow
├── prompts.ts            # Interactive prompts using @inquirer/prompts
├── create-next.ts        # Wraps create-next-app
├── setup-shadcn.ts       # Initializes shadcn/ui
├── types.ts              # Shared TypeScript types
├── env.ts                # Generates .env.example and .env.local
├── claude-md.ts          # Generates CLAUDE.md for projects
├── generate-readme.ts    # Generates README.md and .gitignore
├── integrations/
│   ├── index.ts          # Registry and installer
│   └── [name].ts         # Per-integration setup logic
└── templates/
    └── [name].ts         # Template strings for each integration
```

## Key Patterns

### Service-Oriented Architecture
Generated projects follow this structure:
- `lib/*.client.ts` - Provider client configurations (only when needed)
- `services/*.service.ts` - Business logic with constructor-based DI
- Singleton exports at bottom for Next.js serverless compatibility

```typescript
export class SomeService {
  constructor(private dependency: Dependency) {}
  // methods...
}
export const someService = new SomeService(dependency);
```

### Integration Structure
Each integration has two files:
1. `src/integrations/[name].ts` - Setup logic (packages, env vars, file creation)
2. `src/templates/[name].ts` - Template strings for generated files

### No src/ Folder
Generated projects use Next.js default structure (no `--src-dir` flag).

### Modern Best Practices
- **Next.js 16+**: Uses `proxy.ts` not `middleware.ts`
- **Clerk**: Uses SignInButton/SignUpButton (modal mode), not custom pages
- **Zod**: Uses v4 syntax (`z.email()` not `z.string().email()`)
- **AI SDK**: Focuses on `generateObject` with Zod, not chat
- **Sentry**: PII scrubbing via `beforeSend`, `sendDefaultPii: false`
- **API Routes**: Only for actual external APIs, not internal operations

## Available Integrations

| ID | Service | Key Files |
|----|---------|-----------|
| `clerk` | Authentication | `services/user.service.ts`, `proxy.ts` |
| `neon-drizzle` | Database | `lib/db/client.ts`, `services/database.service.ts` |
| `ai-sdk` | AI | `services/ai.service.ts` |
| `resend` | Email | `services/email.service.ts`, `emails/` |
| `firecrawl` | Scraping | `services/scrape.service.ts` |
| `inngest` | Background Jobs | `lib/inngest.client.ts`, `services/jobs.service.ts` |
| `uploadthing` | File Uploads | `lib/uploadthing.client.ts`, `services/file.service.ts` |
| `stripe` | Payments | `services/payment.service.ts`, webhook routes |
| `posthog` | Analytics | `app/providers.tsx`, `services/analytics.service.ts` |
| `sentry` | Error Tracking | `sentry.*.config.ts`, `services/error.service.ts` |

## Adding New Integrations

1. Create `src/integrations/[name].ts`:
```typescript
export const newIntegration: Integration = {
  id: 'name',
  name: 'Display Name',
  description: 'What it does',
  packages: ['package-name'],
  devPackages: ['dev-package'], // optional
  envVars: [{ key: 'VAR_NAME', description: '...', example: '...' }],
  setup: async (projectPath: string) => {
    // Create files using templates
  },
};
```

2. Create `src/templates/[name].ts` with template strings

3. Register in `src/integrations/index.ts`

4. Add prompt in `src/prompts.ts`

5. Add env section in `src/env.ts`

6. Update `src/claude-md.ts` stack sections

## Development

```bash
npm install     # Install dependencies
npm run dev     # Run with tsx (development)
npm run build   # Compile TypeScript
npm link        # Test locally as `create-loadout`
```

## Key Dependencies

- `@inquirer/prompts` - Interactive CLI prompts
- `chalk` - Terminal styling
- `ora` - Spinners
- `execa` - Shell command execution
