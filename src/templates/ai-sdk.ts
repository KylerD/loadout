export const aiSdkTemplates = {
  // AI service - focuses on structured generation with Zod
  aiService: `import { generateObject, generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const defaultModel = openai('gpt-4o');
const fastModel = openai('gpt-4o-mini');

export class AIService {
  /**
   * Generate a structured object from a prompt using a Zod schema
   * This is the most common use case for AI in applications
   *
   * @example
   * const result = await aiService.generateObject(
   *   'Analyze the sentiment of: "I love this product!"',
   *   z.object({
   *     sentiment: z.enum(['positive', 'negative', 'neutral']),
   *     confidence: z.number(),
   *   })
   * );
   */
  async generateObject<T extends z.ZodType>(
    prompt: string,
    schema: T,
    options?: { system?: string; fast?: boolean }
  ): Promise<z.infer<T>> {
    const result = await generateObject({
      model: options?.fast ? fastModel : defaultModel,
      prompt,
      schema,
      system: options?.system,
    });
    return result.object;
  }

  /**
   * Generate a text completion
   */
  async generateText(prompt: string, options?: { system?: string; fast?: boolean }) {
    const result = await generateText({
      model: options?.fast ? fastModel : defaultModel,
      prompt,
      system: options?.system,
    });
    return result.text;
  }

  /**
   * Generate a streaming text response
   * Use with server actions or API routes when streaming is needed
   */
  streamText(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    options?: { system?: string }
  ) {
    return streamText({
      model: defaultModel,
      messages,
      system: options?.system,
    });
  }
}

// Export singleton instance
export const aiService = new AIService();
`,
};
