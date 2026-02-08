export const neonDrizzleTemplates = {
  drizzleConfig: `import { defineConfig } from 'drizzle-kit';
import { DATABASE_URL } from './lib/config';

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: DATABASE_URL,
  },
});
`,

  dbClient: `import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { DATABASE_URL } from '@/lib/config';

const sql = neon(DATABASE_URL);

export const db = drizzle({ client: sql, schema });

export { sql };
`,

  schema: `import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const todos = pgTable('todos', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  completed: boolean('completed').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
`,

  dbIndex: `export { db, sql } from './client';
export * from './schema';
`,

  // models/todo.dto.ts
  todoDto: `import { todos } from '@/lib/db/schema';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type TodoInsertDto = InferInsertModel<typeof todos>;
export type TodoDto = InferSelectModel<typeof todos>;
`,

  // models/todo.view.ts
  todoView: `export type TodoView = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: Date;
};
`,

  // models/todoCreate.schema.ts
  todoCreateSchema: `import { z } from 'zod';

export const TodoCreateFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export type TodoCreateFormPayload = z.infer<typeof TodoCreateFormSchema>;

export type TodoCreateServiceRequest = TodoCreateFormPayload;

export type TodoCreateServiceResult = {
  todoId: string;
};
`,

  // models/todoCreate.state.ts
  todoCreateState: `export type TodoCreateState = {
  success: boolean;
  error: string | null;
  data: { todoId: string } | null;
};

export const initialTodoCreateState: TodoCreateState = {
  success: false,
  error: null,
  data: null,
};
`,

  // models/todoUpdate.schema.ts
  todoUpdateSchema: `import { z } from 'zod';

export const TodoUpdateFormSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  completed: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export type TodoUpdateFormPayload = z.infer<typeof TodoUpdateFormSchema>;

export type TodoUpdateServiceRequest = {
  id: string;
  title?: string;
  description?: string;
  completed?: boolean;
};

export type TodoUpdateServiceResult = {
  todoId: string;
};
`,

  // models/todoUpdate.state.ts
  todoUpdateState: `export type TodoUpdateState = {
  success: boolean;
  error: string | null;
  data: { todoId: string } | null;
};

export const initialTodoUpdateState: TodoUpdateState = {
  success: false,
  error: null,
  data: null,
};
`,

  // dao/todo.dao.ts
  todoDao: `import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { todos } from '@/lib/db/schema';
import type { TodoDto, TodoInsertDto } from '@/models/todo.dto';

export class TodoDAO {
  async create(dto: TodoInsertDto): Promise<TodoDto | undefined> {
    const [created] = await db.insert(todos).values(dto).returning();
    return created;
  }

  async getById(id: string): Promise<TodoDto | undefined> {
    return await db.query.todos.findFirst({
      where: eq(todos.id, id),
    });
  }

  async getAll(): Promise<TodoDto[]> {
    return await db.query.todos.findMany({
      orderBy: (todos, { desc }) => [desc(todos.createdAt)],
    });
  }

  async update(id: string, dto: Partial<TodoInsertDto>): Promise<TodoDto | undefined> {
    const [updated] = await db
      .update(todos)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(todos.id, id))
      .returning();
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.delete(todos).where(eq(todos.id, id));
  }
}

export const todoDAO = new TodoDAO();
`,

  // mappers/todo.mapper.ts
  todoMapper: `import type { TodoDto, TodoInsertDto } from '@/models/todo.dto';
import type { TodoView } from '@/models/todo.view';
import type { TodoCreateServiceRequest } from '@/models/todoCreate.schema';

export class TodoMapper {
  toInsertDto(request: TodoCreateServiceRequest): TodoInsertDto {
    return {
      title: request.title,
      description: request.description ?? null,
    };
  }

  toView(dto: TodoDto): TodoView {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      completed: dto.completed,
      createdAt: dto.createdAt,
    };
  }

  toViewList(dtos: TodoDto[]): TodoView[] {
    return dtos.map((dto) => this.toView(dto));
  }
}

export const todoMapper = new TodoMapper();
`,

  // services/todo.service.ts
  todoService: `import { todoDAO, type TodoDAO } from '@/dao/todo.dao';
import { todoMapper, type TodoMapper } from '@/mappers/todo.mapper';
import type { TodoView } from '@/models/todo.view';
import type { TodoCreateServiceRequest, TodoCreateServiceResult } from '@/models/todoCreate.schema';
import type { TodoUpdateServiceRequest, TodoUpdateServiceResult } from '@/models/todoUpdate.schema';

export class TodoService {
  constructor(
    private dao: TodoDAO,
    private mapper: TodoMapper
  ) {}

  async createTodo(request: TodoCreateServiceRequest): Promise<TodoCreateServiceResult> {
    const insertDto = this.mapper.toInsertDto(request);
    const created = await this.dao.create(insertDto);

    if (!created) {
      throw new Error('Failed to create todo');
    }

    return { todoId: created.id };
  }

  async getTodoById(id: string): Promise<TodoView | null> {
    const todo = await this.dao.getById(id);
    return todo ? this.mapper.toView(todo) : null;
  }

  async getAllTodos(): Promise<TodoView[]> {
    const todos = await this.dao.getAll();
    return this.mapper.toViewList(todos);
  }

  async updateTodo(request: TodoUpdateServiceRequest): Promise<TodoUpdateServiceResult> {
    const updated = await this.dao.update(request.id, {
      title: request.title,
      description: request.description,
      completed: request.completed,
    });

    if (!updated) {
      throw new Error('Todo not found');
    }

    return { todoId: updated.id };
  }

  async toggleTodo(id: string): Promise<TodoView> {
    const existing = await this.dao.getById(id);

    if (!existing) {
      throw new Error('Todo not found');
    }

    const updated = await this.dao.update(id, {
      completed: !existing.completed,
    });

    return this.mapper.toView(updated!);
  }

  async deleteTodo(id: string): Promise<void> {
    await this.dao.delete(id);
  }
}

export const todoService = new TodoService(todoDAO, todoMapper);
`,

  // actions/todo.actions.ts
  todoActions: `'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { todoService } from '@/services/todo.service';
import { TodoCreateFormSchema } from '@/models/todoCreate.schema';
import { TodoUpdateFormSchema } from '@/models/todoUpdate.schema';
import type { TodoCreateState } from '@/models/todoCreate.state';
import type { TodoUpdateState } from '@/models/todoUpdate.state';

export async function createTodo(
  state: TodoCreateState,
  formData: FormData
): Promise<TodoCreateState> {
  const rawData = Object.fromEntries(formData);
  const validated = TodoCreateFormSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      error: z.prettifyError(validated.error),
      data: null,
    };
  }

  try {
    const result = await todoService.createTodo(validated.data);

    revalidatePath('/todos');

    return {
      success: true,
      error: null,
      data: result,
    };
  } catch (error) {
    console.error('Error creating todo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create todo',
      data: null,
    };
  }
}

export async function updateTodo(
  state: TodoUpdateState,
  formData: FormData
): Promise<TodoUpdateState> {
  const rawData = Object.fromEntries(formData);
  const validated = TodoUpdateFormSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      error: z.prettifyError(validated.error),
      data: null,
    };
  }

  try {
    const result = await todoService.updateTodo(validated.data);

    revalidatePath('/todos');

    return {
      success: true,
      error: null,
      data: result,
    };
  } catch (error) {
    console.error('Error updating todo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update todo',
      data: null,
    };
  }
}

export async function toggleTodo(id: string): Promise<void> {
  await todoService.toggleTodo(id);
  revalidatePath('/todos');
}

export async function deleteTodo(id: string): Promise<void> {
  await todoService.deleteTodo(id);
  revalidatePath('/todos');
}
`,
};
