export const stripeTemplates = {
  // Payment service with constructor-based DI
  paymentService: `import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '@/lib/config';

export interface CreateCheckoutOptions {
  priceId: string;
  customerId?: string;
  mode?: 'payment' | 'subscription';
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CreatePortalOptions {
  customerId: string;
  returnUrl: string;
}

export class PaymentService {
  private stripe: Stripe;

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    });
  }

  /**
   * Create a Stripe Checkout session
   */
  async createCheckoutSession(options: CreateCheckoutOptions): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create({
      mode: options.mode ?? 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: options.priceId,
          quantity: 1,
        },
      ],
      customer: options.customerId,
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      metadata: options.metadata,
    });
  }

  /**
   * Create a customer portal session
   */
  async createPortalSession(options: CreatePortalOptions): Promise<Stripe.BillingPortal.Session> {
    return this.stripe.billingPortal.sessions.create({
      customer: options.customerId,
      return_url: options.returnUrl,
    });
  }

  /**
   * Get a subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.cancel(subscriptionId);
  }

  /**
   * Get a customer by ID
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
    return this.stripe.customers.retrieve(customerId);
  }

  /**
   * Create a new customer
   */
  async createCustomer(email: string, metadata?: Record<string, string>): Promise<Stripe.Customer> {
    return this.stripe.customers.create({
      email,
      metadata,
    });
  }

  /**
   * Construct and validate a webhook event
   */
  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}

// Export singleton instance
export const paymentService = new PaymentService(STRIPE_SECRET_KEY);

// Re-export Stripe types for convenience
export type { Stripe };
`,

  checkoutRoute: `import { NextResponse } from 'next/server';
import { paymentService } from '@/services/payment.service';
import { APP_URL } from '@/lib/config';
import { z } from 'zod';

const checkoutSchema = z.object({
  priceId: z.string(),
  customerId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { priceId, customerId } = checkoutSchema.parse(body);

    const session = await paymentService.createCheckoutSession({
      priceId,
      customerId,
      successUrl: \`\${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}\`,
      cancelUrl: \`\${APP_URL}/pricing\`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout' },
      { status: 500 }
    );
  }
}
`,

  webhooksRoute: `import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { paymentService, type Stripe } from '@/services/payment.service';
import { STRIPE_WEBHOOK_SECRET } from '@/lib/config';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = paymentService.constructWebhookEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Checkout completed:', session.id);
      // TODO: Fulfill the order, update database, etc.
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription updated:', subscription.id, subscription.status);
      // TODO: Update user subscription status in database
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription cancelled:', subscription.id);
      // TODO: Handle subscription cancellation
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      console.log('Payment succeeded:', invoice.id);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      console.log('Payment failed:', invoice.id);
      // TODO: Notify user of failed payment
      break;
    }

    default:
      console.log('Unhandled event type:', event.type);
  }

  return NextResponse.json({ received: true });
}
`,

  portalRoute: `import { NextResponse } from 'next/server';
import { paymentService } from '@/services/payment.service';
import { APP_URL } from '@/lib/config';
import { z } from 'zod';

const portalSchema = z.object({
  customerId: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId } = portalSchema.parse(body);

    const session = await paymentService.createPortalSession({
      customerId,
      returnUrl: \`\${APP_URL}/account\`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
`,
};
