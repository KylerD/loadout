export type AIProvider = 'openai' | 'anthropic' | 'google';

const providerConfigs: Record<AIProvider, {
  package: string;
  import: string;
  createFn: string;
  providerType: string;
  configVar: string;
  defaultModel: string;
}> = {
  openai: {
    package: '@ai-sdk/openai',
    import: "import { createOpenAI, type OpenAIProvider } from '@ai-sdk/openai';",
    createFn: 'createOpenAI',
    providerType: 'OpenAIProvider',
    configVar: 'OPENAI_API_KEY',
    defaultModel: 'gpt-4o-mini',
  },
  anthropic: {
    package: '@ai-sdk/anthropic',
    import: "import { createAnthropic, type AnthropicProvider } from '@ai-sdk/anthropic';",
    createFn: 'createAnthropic',
    providerType: 'AnthropicProvider',
    configVar: 'ANTHROPIC_API_KEY',
    defaultModel: 'claude-sonnet-4-20250514',
  },
  google: {
    package: '@ai-sdk/google',
    import: "import { createGoogleGenerativeAI, type GoogleGenerativeAIProvider } from '@ai-sdk/google';",
    createFn: 'createGoogleGenerativeAI',
    providerType: 'GoogleGenerativeAIProvider',
    configVar: 'GOOGLE_API_KEY',
    defaultModel: 'gemini-2.0-flash',
  },
};

export function getAiServiceTemplate(provider: AIProvider): string {
  const config = providerConfigs[provider];

  return `import { generateObject, generateText } from 'ai';
${config.import}
import { z } from 'zod';
import { ${config.configVar} } from '@/lib/config';

export class AIService {
  private provider: ${config.providerType};

  constructor(apiKey: string) {
    this.provider = ${config.createFn}({ apiKey });
  }

  /**
   * Generate a structured object from a prompt using a Zod schema
   */
  async generateObject<T extends z.ZodType>(
    prompt: string,
    schema: T,
    options?: { system?: string; model?: string }
  ): Promise<z.infer<T>> {
    const { object } = await generateObject({
      model: this.provider(options?.model ?? '${config.defaultModel}'),
      schema,
      prompt,
      system: options?.system,
    });
    return object;
  }

  /**
   * Generate a text completion
   */
  async generateText(
    prompt: string,
    options?: { system?: string; model?: string }
  ): Promise<string> {
    const { text } = await generateText({
      model: this.provider(options?.model ?? '${config.defaultModel}'),
      prompt,
      system: options?.system,
    });
    return text;
  }
}

// Export singleton instance
export const aiService = new AIService(${config.configVar});
`;
}

export function getAiPackages(provider: AIProvider): string[] {
  return ['ai', providerConfigs[provider].package];
}

export function getAiEnvVar(provider: AIProvider): { key: string; example: string; description: string } {
  const vars: Record<AIProvider, { key: string; example: string; description: string }> = {
    openai: { key: 'OPENAI_API_KEY', example: 'sk-...', description: 'OpenAI API key' },
    anthropic: { key: 'ANTHROPIC_API_KEY', example: 'sk-ant-...', description: 'Anthropic API key' },
    google: { key: 'GOOGLE_API_KEY', example: 'AI...', description: 'Google AI API key' },
  };
  return vars[provider];
}

export function getAiConfigVar(provider: AIProvider): { name: string; envKey: string } {
  const vars: Record<AIProvider, { name: string; envKey: string }> = {
    openai: { name: 'OPENAI_API_KEY', envKey: 'OPENAI_API_KEY' },
    anthropic: { name: 'ANTHROPIC_API_KEY', envKey: 'ANTHROPIC_API_KEY' },
    google: { name: 'GOOGLE_API_KEY', envKey: 'GOOGLE_API_KEY' },
  };
  return vars[provider];
}
