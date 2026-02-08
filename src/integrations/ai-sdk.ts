import fs from 'fs/promises';
import path from 'path';
import type { Integration, AIProviderChoice } from '../types.js';
import { getAiServiceTemplate, getAiPackages, getAiEnvVar } from '../templates/ai-sdk.js';

export function createAiSdkIntegration(provider: AIProviderChoice = 'openai'): Integration {
  const envVar = getAiEnvVar(provider);

  return {
    id: 'ai-sdk',
    name: 'Vercel AI SDK',
    description: 'AI integration with structured generation',
    packages: getAiPackages(provider),
    envVars: [envVar],
    setup: async (projectPath: string) => {
      // Create AI service
      await fs.mkdir(path.join(projectPath, 'services'), { recursive: true });
      await fs.writeFile(
        path.join(projectPath, 'services/ai.service.ts'),
        getAiServiceTemplate(provider)
      );
    },
  };
}

// Default export for backwards compatibility
export const aiSdkIntegration = createAiSdkIntegration('openai');
