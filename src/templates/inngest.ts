export const inngestTemplates = {
  inngestClient: `import { Inngest } from 'inngest';

export const inngest = new Inngest({ id: 'my-app' });
`,

  jobsService: `import { type Inngest } from 'inngest';
import { inngest } from '@/lib/inngest.client';

export class JobsService {
  constructor(private client: Inngest) {}

  async sendHelloWorld(name?: string): Promise<void> {
    await this.client.send({
      name: 'app/hello.world',
      data: { name },
    });
  }

  async syncUser(userId: string, email: string): Promise<void> {
    await this.client.send({
      name: 'app/user.sync',
      data: { userId, email },
    });
  }

  async sendEvent<T extends Record<string, unknown>>(
    eventName: string,
    data: T
  ): Promise<void> {
    await this.client.send({
      name: eventName,
      data,
    });
  }
}

export const jobsService = new JobsService(inngest);
`,

  inngestFunctions: `import { inngest } from './inngest.client';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'app/hello.world' },
  async ({ event, step }) => {
    const greeting = await step.run('create-greeting', async () => {
      return \`Hello, \${event.data.name ?? 'World'}!\`;
    });

    await step.sleep('wait-a-moment', '1s');

    return { message: greeting };
  }
);

export const syncUser = inngest.createFunction(
  { id: 'sync-user' },
  { event: 'app/user.sync' },
  async ({ event, step }) => {
    const { userId, email } = event.data;

    const userData = await step.run('fetch-user-data', async () => {
      console.log('Syncing user:', userId, email);
      return { synced: true };
    });

    return userData;
  }
);

export const dailyCleanup = inngest.createFunction(
  { id: 'daily-cleanup' },
  { cron: '0 0 * * *' },
  async ({ step }) => {
    await step.run('cleanup', async () => {
      console.log('Running daily cleanup');
    });

    return { success: true };
  }
);
`,

  inngestRoute: `import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest.client';
import { helloWorld, syncUser, dailyCleanup } from '@/lib/inngest.functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld, syncUser, dailyCleanup],
});
`,
};
