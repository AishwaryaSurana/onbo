/**
 * Subscriptions (PLAN.md §1, §3.9). Target: RevenueCat. This pass is an OFFLINE STUB
 * that returns hardcoded offerings and grants an entitlement on "purchase".
 *
 * Paywall rules baked in here: annual + free trial is the default/highlighted plan,
 * real prices are visible, and there is a restore path.
 */
import type { Entitlement } from '@/store/sessionStore';

export interface Plan {
  id: string;
  title: string;
  priceLabel: string;
  /** Secondary line, e.g. per-month equivalent or credit count. */
  subLabel: string;
  trialLabel?: string;
  highlighted?: boolean;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    id: 'annual',
    title: 'Yearly',
    priceLabel: '$59.99 / year',
    subLabel: '≈ $5.00 / month · 1,200 credits',
    trialLabel: '7-day free trial, then $59.99/yr',
    highlighted: true,
    badge: 'BEST VALUE · 58% OFF',
  },
  {
    id: 'monthly',
    title: 'Monthly',
    priceLabel: '$11.99 / month',
    subLabel: '300 credits / month',
  },
];

export interface BillingService {
  getOfferings(): Plan[];
  getDefaultPlanId(): string;
  purchase(planId: string): Promise<{ entitlement: Entitlement }>;
  restore(): Promise<{ entitlement: Entitlement }>;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

class StubBilling implements BillingService {
  getOfferings() {
    return PLANS;
  }
  getDefaultPlanId() {
    return PLANS.find((p) => p.highlighted)?.id ?? PLANS[0].id;
  }
  async purchase(planId: string) {
    await wait(900);
    // Annual carries a trial in this stub; monthly bills immediately.
    return { entitlement: planId === 'annual' ? ('trial' as const) : ('paid' as const) };
  }
  async restore() {
    await wait(700);
    return { entitlement: 'none' as const };
  }
}

export const billing: BillingService = new StubBilling();
