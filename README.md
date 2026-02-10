<div align="center">

```txt
  _                 _          _
 | |   ___  __ _ __| |___ _  _| |_
 | |__/ _ \/ _` / _` / _ \ || |  _|
 |____\___/\__,_\__,_\___/\_,_|\__|

```

**Stop copy-pasting boilerplate. Start building.**

**An opinionated Next.js scaffold with the integrations you probably need.**

[![npm version](https://img.shields.io/npm/v/create-loadout?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/create-loadout)
[![npm downloads](https://img.shields.io/npm/dm/create-loadout?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/create-loadout)
[![GitHub stars](https://img.shields.io/github/stars/KylerD/loadout?style=for-the-badge&logo=github&color=181717)](https://github.com/KylerD/loadout)
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
├── dao/                    # Data access layer (Drizzle ORM)
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

|     | Integration        | What You Get                               |
| :-: | ------------------ | ------------------------------------------ |
| 🔐  | **Clerk**          | Authentication + user service              |
| 🗄️  | **Neon + Drizzle** | Serverless Postgres with full CRUD example |
| 🤖  | **AI SDK**         | OpenAI / Anthropic / Google                |
| 📧  | **Resend**         | Email service + React email templates      |
| 📬  | **Postmark**       | Transactional email with top deliverability |
| 🔥  | **Firecrawl**      | Web scraping service                       |
| ⏰  | **Inngest**        | Background jobs                            |
| 📁  | **UploadThing**    | File uploads                               |
| 💳  | **Stripe**         | Checkout, webhooks, customer portal        |
| 📊  | **PostHog**        | Product analytics                          |
| 🐛  | **Sentry**         | Error tracking                             |

**Always included:** TypeScript, Tailwind, shadcn/ui, Zod, Zustand, Luxon

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

That's it. Fill in `.env.local` and you're live.

---

## Architecture

Generated projects follow a **layered architecture**:

```
UI Components (app/, components/)
        ↓
Server Actions (actions/*.actions.ts)
        ↓
Services (services/*.service.ts)
        ↓
DAOs (dao/*.dao.ts + Drizzle ORM)
        ↓
Neon (Serverless Postgres)
```

Services use constructor-based dependency injection with singleton exports — optimized for Next.js serverless.

---

## Development

```bash
git clone https://github.com/KylerD/loadout.git
cd loadout
npm install
npm run dev

# Build and test locally
npm run build
npm link
create-loadout
```

---

## License

MIT
