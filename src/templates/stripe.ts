export const stripeTemplates = {
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

  async createPortalSession(options: CreatePortalOptions): Promise<Stripe.BillingPortal.Session> {
    return this.stripe.billingPortal.sessions.create({
      customer: options.customerId,
      return_url: options.returnUrl,
    });
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.cancel(subscriptionId);
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
    return this.stripe.customers.retrieve(customerId);
  }

  async createCustomer(email: string, metadata?: Record<string, string>): Promise<Stripe.Customer> {
    return this.stripe.customers.create({
      email,
      metadata,
    });
  }

  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}

export const paymentService = new PaymentService(STRIPE_SECRET_KEY);

export type { Stripe };
`,

  checkoutRoute: `import { NextResponse } from 'next/server';
import { paymentService } from '@/services/payment.service';
import { z } from 'zod';

const checkoutSchema = z.object({
  priceId: z.string(),
  customerId: z.string().optional(),
  successUrl: z.url(),
  cancelUrl: z.url(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { priceId, customerId, successUrl, cancelUrl } = checkoutSchema.parse(body);

    const session = await paymentService.createCheckoutSession({
      priceId,
      customerId,
      successUrl,
      cancelUrl,
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

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Checkout completed:', session.id);
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription updated:', subscription.id, subscription.status);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription cancelled:', subscription.id);
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
import { z } from 'zod';

const portalSchema = z.object({
  customerId: z.string(),
  returnUrl: z.url(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, returnUrl } = portalSchema.parse(body);

    const session = await paymentService.createPortalSession({
      customerId,
      returnUrl,
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
