import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export type PlanTier = "starter" | "growth" | "agency";
export type BillingProvider = "free" | "stripe" | "paystack";
export type BillingCycle = "monthly" | "yearly";
export type Currency = "USD" | "NGN";

export interface PlanConfig {
  tier: PlanTier;
  name: string;
  usd_monthly: number;
  usd_yearly: number;
  ngn_monthly: number;
  ngn_yearly: number;
  message_limit: number;
  contact_limit: number;
  channel_limit: number;
  workspace_limit?: number;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  provider: BillingProvider;
  customer_id?: string;
  subscription_id?: string;
  plan_tier: PlanTier;
  billing_cycle: BillingCycle;
  currency: Currency;
  amount: number;
  status: "active" | "past_due" | "canceled" | "trialing";
  current_period_start: string;
  current_period_end?: string;
  monthly_message_limit: number;
  contacts_limit: number;
  channels_limit: number;
  created_at: string;
  updated_at: string;
}

export interface BillingDetailsResponse {
  subscription: Subscription;
  plans: Record<PlanTier, PlanConfig>;
}

export interface CheckoutRequest {
  plan_tier: PlanTier;
  billing_cycle: BillingCycle;
  currency: Currency;
  success_url?: string;
  cancel_url?: string;
}

export interface CheckoutResponse {
  checkout_url: string;
  reference?: string;
  provider: string;
}

export interface PortalResponse {
  portal_url: string;
}

class BillingService {
  private unwrap<T>(data: any): T {
    if (data && typeof data === "object" && "data" in data) {
      return data.data as T;
    }
    return data as T;
  }

  /** Retrieves active subscription and available plans */
  async getSubscription(): Promise<BillingDetailsResponse> {
    const response = await apiClient.get<any>(ENDPOINTS.BILLING.SUBSCRIPTION);
    return this.unwrap<BillingDetailsResponse>(response.data);
  }

  /** Initiates checkout session with Stripe or Paystack */
  async createCheckout(req: CheckoutRequest): Promise<CheckoutResponse> {
    const response = await apiClient.post<any>(ENDPOINTS.BILLING.CHECKOUT, req);
    return this.unwrap<CheckoutResponse>(response.data);
  }

  /** Creates Stripe customer portal session for card & invoice management */
  async createPortal(): Promise<PortalResponse> {
    const response = await apiClient.post<any>(ENDPOINTS.BILLING.PORTAL, {});
    return this.unwrap<PortalResponse>(response.data);
  }
}

export const billingService = new BillingService();
