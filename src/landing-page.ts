import fs from 'fs/promises';
import path from 'path';
import type { ProjectConfig, IntegrationId } from './types.js';

interface Technology {
  name: string;
  href: string;
  description: string;
}

const coreTechnologies: Technology[] = [
  { name: 'Next.js', href: 'https://nextjs.org/docs', description: 'App Router & React 19' },
  { name: 'Tailwind', href: 'https://tailwindcss.com/docs', description: 'Utility-first CSS' },
  { name: 'shadcn/ui', href: 'https://ui.shadcn.com', description: 'Component primitives' },
  { name: 'Zod', href: 'https://zod.dev', description: 'Schema validation' },
  { name: 'Zustand', href: 'https://zustand.docs.pmnd.rs', description: 'State management' },
  { name: 'Luxon', href: 'https://moment.github.io/luxon', description: 'Date/time' },
];

const integrationTechnologies: Record<IntegrationId, Technology> = {
  clerk: { name: 'Clerk', href: 'https://clerk.com/docs', description: 'Authentication' },
  'neon-drizzle': { name: 'Neon + Drizzle', href: 'https://neon.tech/docs', description: 'Serverless Postgres' },
  'ai-sdk': { name: 'AI SDK', href: 'https://sdk.vercel.ai/docs', description: 'AI integration' },
  resend: { name: 'Resend', href: 'https://resend.com/docs', description: 'Email API' },
  postmark: { name: 'Postmark', href: 'https://postmarkapp.com/developer', description: 'Transactional email' },
  firecrawl: { name: 'Firecrawl', href: 'https://docs.firecrawl.dev', description: 'Web scraping' },
  inngest: { name: 'Inngest', href: 'https://www.inngest.com/docs', description: 'Background jobs' },
  uploadthing: { name: 'UploadThing', href: 'https://docs.uploadthing.com', description: 'File uploads' },
  stripe: { name: 'Stripe', href: 'https://docs.stripe.com', description: 'Payments' },
  posthog: { name: 'PostHog', href: 'https://posthog.com/docs', description: 'Analytics' },
  sentry: { name: 'Sentry', href: 'https://docs.sentry.io', description: 'Error tracking' },
};

export async function generateLandingPage(
  projectPath: string,
  config: ProjectConfig
): Promise<void> {
  const technologies = [
    ...coreTechnologies,
    ...config.integrations.map((id) => integrationTechnologies[id]),
  ];

  const techArrayString = technologies
    .map(
      (tech) =>
        `    { name: '${tech.name}', href: '${tech.href}', description: '${tech.description}' },`
    )
    .join('\n');

  const content = `import { ExternalLink } from 'lucide-react';

export default function Home() {
  const technologies = [
${techArrayString}
  ];

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 selection:bg-amber-200">
      <div className="max-w-2xl mx-auto px-6 py-24">
        <header className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-medium tracking-wide text-amber-700 bg-amber-100 rounded-full">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            Setup complete
          </div>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-4 text-stone-800">
            You&apos;re ready to build.
          </h1>
          <p className="text-stone-500 max-w-md mx-auto">
            Your project is configured and running. Delete this page and start creating.
          </p>
        </header>

        <section className="mb-16">
          <h2 className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-6 text-center">
            Your Stack
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {technologies.map((tech) => (
              <a
                key={tech.name}
                href={tech.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-lg border border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-stone-800 text-sm">{tech.name}</span>
                  <ExternalLink className="w-3 h-3 text-stone-300 group-hover:text-amber-500 transition-colors" />
                </div>
                <span className="text-xs text-stone-400">{tech.description}</span>
              </a>
            ))}
          </div>
        </section>

        <footer className="text-center pt-8 border-t border-stone-200">
          <p className="text-xs text-stone-400">
            Scaffolded with{' '}
            <a
              href="https://github.com/KylerD/loadout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-500 hover:text-amber-600 transition-colors"
            >
              create-loadout
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
`;

  await fs.writeFile(path.join(projectPath, 'app/page.tsx'), content);
}
