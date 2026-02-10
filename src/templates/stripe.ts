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
};
