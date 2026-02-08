export const inngestTemplates = {
  // Inngest client
  inngestClient: `import { Inngest } from 'inngest';

// Create a client to send and receive events
export const inngest = new Inngest({ id: 'my-app' });
`,

  // Jobs service with constructor-based DI
  jobsService: `import { type Inngest } from 'inngest';
import { inngest } from '@/lib/inngest.client';

export class JobsService {
  constructor(private client: Inngest) {}

  /**
   * Send a hello world event
   */
  async sendHelloWorld(name?: string) {
    await this.client.send({
      name: 'app/hello.world',
      data: { name },
    });
  }

  /**
   * Trigger a user sync job
   */
  async syncUser(userId: string, email: string) {
    await this.client.send({
      name: 'app/user.sync',
      data: { userId, email },
    });
  }

  /**
   * Send a generic event
   */
  async sendEvent<T extends Record<string, unknown>>(
    eventName: string,
    data: T
  ) {
    await this.client.send({
      name: eventName,
      data,
    });
  }
}

// Export singleton instance
export const jobsService = new JobsService(inngest);
`,

  // Inngest functions
  inngestFunctions: `import { inngest } from './inngest.client';

/**
 * Hello World function - triggered by 'app/hello.world' event
 */
export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'app/hello.world' },
  async ({ event, step }) => {
    // Use step.run for reliable execution with retries
    const greeting = await step.run('create-greeting', async () => {
      return \`Hello, \${event.data.name ?? 'World'}!\`;
    });

    // Use step.sleep for reliable delays
    await step.sleep('wait-a-moment', '1s');

    return { message: greeting };
  }
);

/**
 * User sync function - triggered by 'app/user.sync' event
 */
export const syncUser = inngest.createFunction(
  { id: 'sync-user' },
  { event: 'app/user.sync' },
  async ({ event, step }) => {
    const { userId, email } = event.data;

    // Step 1: Fetch user data
    const userData = await step.run('fetch-user-data', async () => {
      // Add your user sync logic here
      console.log('Syncing user:', userId, email);
      return { synced: true };
    });

    return userData;
  }
);

/**
 * Scheduled task - runs daily at midnight
 */
export const dailyCleanup = inngest.createFunction(
  { id: 'daily-cleanup' },
  { cron: '0 0 * * *' },
  async ({ step }) => {
    await step.run('cleanup', async () => {
      // Add your cleanup logic here
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
