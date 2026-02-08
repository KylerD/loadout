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
    // Create payment service
    await fs.mkdir(path.join(projectPath, 'services'), { recursive: true });
    await fs.writeFile(
      path.join(projectPath, 'services/payment.service.ts'),
      stripeTemplates.paymentService
    );

    // Create API routes
    await fs.mkdir(path.join(projectPath, 'app/api/stripe/checkout'), {
      recursive: true,
    });
    await fs.mkdir(path.join(projectPath, 'app/api/stripe/webhooks'), {
      recursive: true,
    });
    await fs.mkdir(path.join(projectPath, 'app/api/stripe/portal'), {
      recursive: true,
    });

    await fs.writeFile(
      path.join(projectPath, 'app/api/stripe/checkout/route.ts'),
      stripeTemplates.checkoutRoute
    );
    await fs.writeFile(
      path.join(projectPath, 'app/api/stripe/webhooks/route.ts'),
      stripeTemplates.webhooksRoute
    );
    await fs.writeFile(
      path.join(projectPath, 'app/api/stripe/portal/route.ts'),
      stripeTemplates.portalRoute
    );
  },
};
