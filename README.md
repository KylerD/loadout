<div align="center">

```
  _    ___   _   ___   ___  _   _ _____
 | |  / _ \ /_\ |   \ / _ \| | | |_   _|
 | |_| (_) / _ \| |) | (_) | |_| | | |
 |____\___/_/ \_\___/ \___/ \___/  |_|
```

**Stop copy-pasting boilerplate. Start building.**

**One command to scaffold a production-ready Next.js app with the integrations you actually need.**

[![npm version](https://img.shields.io/npm/v/create-loadout?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/create-loadout)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

```bash
npx create-loadout
```

Works on Mac, Windows, and Linux.

</div>

---

## Why I Built This

Every new SaaS project starts the same way. Create the Next.js app. Add Tailwind. Set up shadcn. Copy your auth config from the last project. Wire up the database. Add Stripe. Configure error tracking. Set up analytics.

It's the same 2-4 hours every time. And every time, you're copy-pasting from old projects, fixing the inevitable drift, and wondering if you remembered everything.

**Loadout gives you a fully-wired Next.js app in under a minute.**

You pick your integrations. It scaffolds everything — services, API routes, typed env vars, even a `CLAUDE.md` so your AI assistant knows how the project is structured.

No more boilerplate archaeology. Just start building.

---

## What You Get

```
your-app/
├── app/                    # Next.js App Router
├── components/             # React components + shadcn/ui
├── actions/                # Server actions
├── services/               # Business logic (DI-ready)
├── dao/                    # Data access layer
├── models/                 # DTOs, views, schemas, state
├── lib/
│   ├── config.ts           # Type-safe env vars
│   └── db/                 # Database client + schema
├── CLAUDE.md               # AI assistant context
├── .env.example            # Documented env template
└── .env.local              # Your secrets (gitignored)
```

**Every integration follows the same pattern:**
- Services for business logic
- Type-safe configuration
- Ready-to-use API routes where needed
- Zero magic — just clean, readable code

---

## Available Integrations

| | Integration | What You Get |
|:--:|-------------|--------------|
| 🔐 | **Clerk** | Auth, user service, route protection via `proxy.ts` |
| 🗄️ | **Neon + Drizzle** | Serverless Postgres with full CRUD example (todos) |
| 🤖 | **AI SDK** | OpenAI / Anthropic / Google with `generateObject` patterns |
| 📧 | **Resend** | Email service + React email templates |
| 🔥 | **Firecrawl** | Web scraping service + API route |
| ⏰ | **Inngest** | Background jobs with typed functions |
| 📁 | **UploadThing** | File uploads with React components |
| 💳 | **Stripe** | Checkout, webhooks, customer portal |
| 📊 | **PostHog** | Analytics via `instrumentation-client.ts` |
| 🐛 | **Sentry** | Error tracking (server + client + edge) |

**Always included:** TypeScript, Tailwind, shadcn/ui, Zod v4, Zustand, ESLint

---

## How It Works

### 1. Run the CLI

```bash
npx create-loadout
```

### 2. Answer the Prompts

- Project name
- Which integrations you need
- AI provider (if using AI SDK)

### 3. Start Building

```bash
cd your-app
npm install
npm run dev
```

That's it. Your `.env.example` has setup URLs for each service. Fill in `.env.local` and you're live.

---

## Architecture

Generated projects follow a **layered architecture** that scales:

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

**Why this matters:**
- **Testable** — Services can be unit tested without UI
- **Swappable** — Change your database without touching business logic
- **AI-friendly** — Clear boundaries help AI assistants understand your code

Services use constructor-based dependency injection with singleton exports — optimized for Next.js serverless.

---

## Modern Defaults

Loadout stays current with Next.js best practices:

| Pattern | What We Use |
|---------|-------------|
| Route protection | `proxy.ts` (Next.js 16+) |
| Client-side init | `instrumentation-client.ts` (Next.js 15.3+) |
| Server instrumentation | `instrumentation.ts` (Next.js 15+) |
| Validation | Zod v4 (`z.email()` not `z.string().email()`) |
| Auth UI | Clerk modal mode (SignInButton/SignUpButton) |
| AI patterns | `generateObject` with Zod schemas |

No deprecated patterns. No legacy workarounds.

---

## Development

```bash
# Clone
git clone https://github.com/KylerD/loadout.git
cd loadout

# Install
npm install

# Run in dev mode
npm run dev

# Build
npm run build

# Test locally
npm link
create-loadout
```

---

## License

MIT

