import fs from 'fs/promises';
import path from 'path';
import type { Integration } from '../types.js';
import { stripeTemplates } from '../templates/stripe.js';

export const stripeIntegration: Integration = {
  id: 'stripe',
  name: 'Stripe',
  description: 'Payments and subscriptions',
  packages: ['stripe'],
  envVars: [
    {
      key: 'STRIPE_SECRET_KEY',
      description: 'Stripe secret key',
      example: 'sk_test_...',
    },
    {
      key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      description: 'Stripe publishable key',
      example: 'pk_test_...',
      isPublic: true,
    },
    {
      key: 'STRIPE_WEBHOOK_SECRET',
      description: 'Stripe webhook secret',
      example: 'whsec_...',
    },
  ],
  setup: async (projectPath: string) => {
    await fs.mkdir(path.join(projectPath, 'services'), { recursive: true });
    await fs.writeFile(
      path.join(projectPath, 'services/payment.service.ts'),
      stripeTemplates.paymentService
    );
  },
};
