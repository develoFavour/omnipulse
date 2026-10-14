"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCurrency } from "@/lib/hooks/useCurrency";
import { billingService, type PlanTier, type BillingCycle } from "@/lib/services/billing.service";
import { cn } from "@/lib/utils";
import { Zap, Check, Sparkles, Loader2, Globe, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  featureName?: string;
  recommendedTier?: PlanTier;
}

export function UpgradeModal({
  open,
  onOpenChange,
  title = "Unlock Higher Quotas & Scale MessageRail",
  description,
  featureName,
  recommendedTier = "growth",
}: UpgradeModalProps) {
  const { currency, setCurrency, symbol, isNGN } = useCurrency();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);

  const handleUpgrade = async (tier: PlanTier) => {
    setLoadingTier(tier);
    try {
      const res = await billingService.createCheckout({
        plan_tier: tier,
        billing_cycle: cycle,
        currency,
      });
      if (res?.checkout_url) {
        toast.loading(`Redirecting to ${isNGN ? "Paystack" : "Stripe"} checkout...`);
        window.location.href = res.checkout_url;
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "Failed to initiate checkout");
      setLoadingTier(null);
    }
  };

  const growthPrice = isNGN
    ? cycle === "monthly" ? "₦6,500/mo" : "₦65,000/yr"
    : cycle === "monthly" ? "$14/mo" : "$140/yr";

  const agencyPrice = isNGN
    ? cycle === "monthly" ? "₦17,500/mo" : "₦175,000/yr"
    : cycle === "monthly" ? "$34/mo" : "$340/yr";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-[#163300] to-[#255203] p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#9fe870]/20 text-[#9fe870]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#9fe870]">
              Early Believer Pricing
            </span>
          </div>
          <DialogTitle className="text-xl font-extrabold text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-emerald-100/80 mt-1 leading-relaxed">
            {description || (
              featureName
                ? `${featureName} is available on Growth and Agency tiers. Upgrade now with localized, impulse-buy pricing.`
                : "Expand your broadcasting power, unlock unlimited channels, and stream CSV exports."
            )}
          </DialogDescription>

          {/* Currency & Frequency Toggle Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-emerald-800/60">
            {/* Currency */}
            <div className="flex items-center rounded-lg bg-black/20 p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                  !isNGN
                    ? "bg-[#9fe870] text-[#163300]"
                    : "text-white/70 hover:text-white"
                )}
              >
                <Globe className="h-3 w-3" />
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency("NGN")}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                  isNGN
                    ? "bg-[#9fe870] text-[#163300]"
                    : "text-white/70 hover:text-white"
                )}
              >
                <span>🇳🇬</span>
                NGN (₦)
              </button>
            </div>

            {/* Cycle */}
            <div className="flex items-center rounded-lg bg-black/20 p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => setCycle("monthly")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                  cycle === "monthly"
                    ? "bg-white text-gray-900"
                    : "text-white/70 hover:text-white"
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setCycle("yearly")}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                  cycle === "yearly"
                    ? "bg-white text-gray-900"
                    : "text-white/70 hover:text-white"
                )}
              >
                <span>Annual</span>
                <span className="text-[10px] font-bold text-[#9fe870] bg-[#163300] px-1 rounded">
                  2 mo. free
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50">
          {/* Growth Plan Card */}
          <div
            className={cn(
              "relative flex flex-col justify-between rounded-xl border p-4 bg-white transition-all shadow-sm",
              recommendedTier === "growth"
                ? "border-[#163300] ring-2 ring-[#9fe870]/50"
                : "border-gray-200"
            )}
          >
            {recommendedTier === "growth" && (
              <span className="absolute -top-2.5 left-4 rounded-full bg-[#163300] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#9fe870]">
                Best Value
              </span>
            )}
            <div>
              <p className="text-sm font-bold text-gray-900">Growth Plan</p>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {growthPrice}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                For growing brands & agencies
              </p>

              <ul className="mt-3.5 space-y-2 border-t border-gray-100 pt-3">
                <li className="flex items-center gap-2 text-xs text-gray-700">
                  <Check className="h-3.5 w-3.5 text-[#163300] shrink-0" />
                  <span><strong>5,000</strong> Audience Contacts</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-700">
                  <Check className="h-3.5 w-3.5 text-[#163300] shrink-0" />
                  <span><strong>25,000</strong> Broadcasts / mo</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-700">
                  <Check className="h-3.5 w-3.5 text-[#163300] shrink-0" />
                  <span><strong>Unlimited</strong> Channels</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-700">
                  <Check className="h-3.5 w-3.5 text-[#163300] shrink-0" />
                  <span><strong>3 Workspaces</strong> Included</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-700">
                  <Check className="h-3.5 w-3.5 text-[#163300] shrink-0" />
                  <span>Streaming CSV Exports</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade("growth")}
              disabled={loadingTier !== null}
              className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#163300] py-2 text-xs font-bold text-[#9fe870] hover:bg-[#163300]/90 transition-all active:scale-98 shadow-sm"
            >
              {loadingTier === "growth" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Zap className="h-3.5 w-3.5 fill-current" />
              )}
              Upgrade to Growth ({isNGN ? "Paystack" : "Stripe"})
            </button>
          </div>

          {/* Agency Plan Card */}
          <div
            className={cn(
              "relative flex flex-col justify-between rounded-xl border p-4 bg-white transition-all shadow-sm",
              recommendedTier === "agency"
                ? "border-[#163300] ring-2 ring-[#9fe870]/50"
                : "border-gray-200"
            )}
          >
            {recommendedTier === "agency" && (
              <span className="absolute -top-2.5 left-4 rounded-full bg-[#163300] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#9fe870]">
                Scale & Teams
              </span>
            )}
            <div>
              <p className="text-sm font-bold text-gray-900">Agency Scale</p>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {agencyPrice}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                For high-volume operations & teams
              </p>

              <ul className="mt-3.5 space-y-2 border-t border-gray-100 pt-3">
                <li className="flex items-center gap-2 text-xs text-gray-700">
                  <Check className="h-3.5 w-3.5 text-[#163300] shrink-0" />
                  <span><strong>25,000</strong> Audience Contacts</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-700">
                  <Check className="h-3.5 w-3.5 text-[#163300] shrink-0" />
                  <span><strong>100,000</strong> Broadcasts / mo</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-700">
                  <Check className="h-3.5 w-3.5 text-[#163300] shrink-0" />
                  <span><strong>Unlimited</strong> Workspaces</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-700">
                  <Check className="h-3.5 w-3.5 text-[#163300] shrink-0" />
                  <span>Granular Team Roles & RBAC</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-700">
                  <Check className="h-3.5 w-3.5 text-[#163300] shrink-0" />
                  <span>Priority Worker Pools</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade("agency")}
              disabled={loadingTier !== null}
              className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white py-2 text-xs font-bold text-gray-900 hover:bg-gray-50 transition-all active:scale-98"
            >
              {loadingTier === "agency" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Zap className="h-3.5 w-3.5 fill-current text-[#163300]" />
              )}
              Upgrade to Agency ({isNGN ? "Paystack" : "Stripe"})
            </button>
          </div>
        </div>

        {/* Security / Guarantee Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Secure Checkout via {isNGN ? "Paystack (Cards, Bank Transfer, USSD)" : "Stripe (All Cards & Digital Wallets)"}</span>
          </div>
          <span>Cancel anytime</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
