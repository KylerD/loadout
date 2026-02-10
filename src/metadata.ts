import type { IntegrationId, AIProviderChoice } from './types.js';
import { getIntegration } from './integrations/index.js';
import { ALL_INTEGRATION_IDS, AI_PROVIDERS } from './validate.js';

export interface IntegrationInfo {
  id: IntegrationId;
  name: string;
  description: string;
  packages: string[];
  envVars: { key: string; description: string; example: string }[];
  mutuallyExclusiveWith?: IntegrationId[];
  requiresOption?: { field: string; values: string[] };
}

const EMAIL_PROVIDERS: IntegrationId[] = ['resend', 'postmark'];

export function listIntegrations(): IntegrationInfo[] {
  return ALL_INTEGRATION_IDS.map((id) => {
    // Use a dummy config to get integration metadata
    const config = { name: 'dummy', integrations: [id], aiProvider: 'openai' as AIProviderChoice };
    const integration = getIntegration(id, config);

    const info: IntegrationInfo = {
      id: integration.id,
      name: integration.name,
      description: integration.description,
      packages: integration.packages,
      envVars: integration.envVars.map((v) => ({
        key: v.key,
        description: v.description,
        example: v.example,
      })),
    };

    if (EMAIL_PROVIDERS.includes(id)) {
      info.mutuallyExclusiveWith = EMAIL_PROVIDERS.filter((e) => e !== id);
    }

    if (id === 'ai-sdk') {
      info.requiresOption = { field: 'aiProvider', values: [...AI_PROVIDERS] };
    }

    return info;
  });
}
