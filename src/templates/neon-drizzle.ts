export const neonDrizzleTemplates = {
  drizzleConfig: `import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
`,

  // Database client
  dbClient: `import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Create the Neon SQL client
const sql = neon(process.env.DATABASE_URL!);

// Create and export the Drizzle instance
export const db = drizzle(sql, { schema });

// Export the raw SQL client for custom queries
export { sql };
`,

  schema: `import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  externalId: text('external_id').unique(), // For linking to auth provider (e.g., Clerk)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
`,

  // Database service with constructor-based DI
  dbService: `import { eq } from 'drizzle-orm';
import { type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { db } from '@/lib/db/client';
import { users, type User, type NewUser } from '@/lib/db/schema';
import type * as schema from '@/lib/db/schema';

export class DatabaseService {
  constructor(private database: NeonHttpDatabase<typeof schema>) {}

  // User operations
  async getUserById(id: string): Promise<User | null> {
    const result = await this.database.select().from(users).where(eq(users.id, id));
    return result[0] ?? null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.database.select().from(users).where(eq(users.email, email));
    return result[0] ?? null;
  }

  async getUserByExternalId(externalId: string): Promise<User | null> {
    const result = await this.database.select().from(users).where(eq(users.externalId, externalId));
    return result[0] ?? null;
  }

  async createUser(data: NewUser): Promise<User> {
    const result = await this.database.insert(users).values(data).returning();
    return result[0];
  }

  async updateUser(id: string, data: Partial<Omit<NewUser, 'id'>>): Promise<User | null> {
    const result = await this.database
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0] ?? null;
  }

  async deleteUser(id: string): Promise<void> {
    await this.database.delete(users).where(eq(users.id, id));
  }

  async upsertUserByExternalId(
    externalId: string,
    data: Omit<NewUser, 'externalId'>
  ): Promise<User> {
    const existing = await this.getUserByExternalId(externalId);

    if (existing) {
      const updated = await this.updateUser(existing.id, data);
      return updated!;
    }

    return this.createUser({ ...data, externalId });
  }
}

// Export singleton instance
export const databaseService = new DatabaseService(db);
`,

  // Re-export for convenience
  dbIndex: `// Re-export database client and schema
export { db, sql } from './client';
export * from './schema';
`,
};
