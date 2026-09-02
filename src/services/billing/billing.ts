/**
 * Subscriptions (PLAN.md §1). Target: RevenueCat. This pass is an OFFLINE STUB that
 * returns hardcoded offerings and grants an entitlement on "purchase".
 */
import type { Entitlement } from '@/store/sessionStore';

export interface Plan {
  id: string;
  title: string;
  /** Big price, e.g. "$5". */
  priceLabel: string;
  /** Period suffix, e.g. "/week". */
  pricePeriod: string;
  /** Credits line under the title. */
  subLabel: string;
  badge?: string;
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  { id: 'yearly_lite', title: 'Yearly Lite', priceLabel: '$3', pricePeriod: '/week', subLabel: '300 monthly credits' },
  {
    id: 'yearly_pro',
    title: 'Yearly Pro',
    priceLabel: '$5',
    pricePeriod: '/week',
    subLabel: '1,200 monthly credits',
    badge: '25% DISCOUNT',
    highlighted: true,
  },
  { id: 'weekly_lite', title: 'Weekly Lite', priceLabel: '$8', pricePeriod: '/week', subLabel: '200 weekly credits' },
  { id: 'weekly_pro', title: 'Weekly Pro', priceLabel: '$12', pricePeriod: '/week', subLabel: '400 weekly credits' },
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
    return { entitlement: planId.startsWith('yearly') ? ('trial' as const) : ('paid' as const) };
  }
  async restore() {
    await wait(700);
    return { entitlement: 'none' as const };
  }
}

export const billing: BillingService = new StubBilling();
