import fs from 'fs/promises';
import path from 'path';
import type { Integration } from '../types.js';
import { aiSdkTemplates } from '../templates/ai-sdk.js';

export const aiSdkIntegration: Integration = {
  id: 'ai-sdk',
  name: 'Vercel AI SDK',
  description: 'AI integration with structured generation',
  packages: ['ai', '@ai-sdk/openai'],
  envVars: [
    {
      key: 'OPENAI_API_KEY',
      description: 'OpenAI API key',
      example: 'sk-...',
    },
  ],
  setup: async (projectPath: string) => {
    // Create AI service
    await fs.mkdir(path.join(projectPath, 'services'), { recursive: true });
    await fs.writeFile(
      path.join(projectPath, 'services/ai.service.ts'),
      aiSdkTemplates.aiService
    );
  },
};
