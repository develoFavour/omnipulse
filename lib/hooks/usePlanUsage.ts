"use client";

import { useState, useCallback, useMemo } from "react";
import { useDashboard } from "@/lib/api/hooks/useDashboard";
import type { PlanTier } from "@/lib/services/billing.service";

export interface QuotaMetric {
  current: number;
  limit: number; // -1 if unlimited
  isUnlimited: boolean;
  isAtLimit: boolean;
  isNearLimit: boolean; // >= 80%
  percent: number;
  remaining: number;
}

export interface UpgradeModalConfig {
  title?: string;
  description?: string;
  featureName?: string;
  recommendedTier?: PlanTier;
}

export function usePlanUsage() {
  const { stats, isLoading, refetch } = useDashboard();
  const rawUsage = stats?.plan_usage;

  const tier: PlanTier = useMemo(() => {
    const raw = (rawUsage?.plan_tier || "starter").toLowerCase();
    if (raw === "agency") return "agency";
    if (raw === "growth") return "growth";
    return "starter";
  }, [rawUsage?.plan_tier]);

  const isStarter = tier === "starter";
  const isGrowth = tier === "growth";
  const isAgency = tier === "agency";

  // Compute Contacts Quota
  const contacts: QuotaMetric = useMemo(() => {
    const current = rawUsage?.contacts_stored ?? stats?.total_audience ?? 0;
    const limit = rawUsage?.contacts_limit ?? (isStarter ? 500 : isGrowth ? 5000 : 25000);
    const isUnlimited = limit === -1;
    const percent = isUnlimited ? 0 : Math.min(100, Math.round((current / limit) * 100));
    const isAtLimit = !isUnlimited && current >= limit;
    const isNearLimit = !isUnlimited && !isAtLimit && percent >= 80;
    const remaining = isUnlimited ? Infinity : Math.max(0, limit - current);

    return { current, limit, isUnlimited, isAtLimit, isNearLimit, percent, remaining };
  }, [rawUsage, stats?.total_audience, isStarter, isGrowth]);

  // Compute Messages Quota (Monthly)
  const messages: QuotaMetric = useMemo(() => {
    const current = rawUsage?.messages_sent_this_month ?? 0;
    const limit = rawUsage?.monthly_message_limit ?? (isStarter ? 1000 : isGrowth ? 25000 : 100000);
    const isUnlimited = limit === -1;
    const percent = isUnlimited ? 0 : Math.min(100, Math.round((current / limit) * 100));
    const isAtLimit = !isUnlimited && current >= limit;
    const isNearLimit = !isUnlimited && !isAtLimit && percent >= 80;
    const remaining = isUnlimited ? Infinity : Math.max(0, limit - current);

    return { current, limit, isUnlimited, isAtLimit, isNearLimit, percent, remaining };
  }, [rawUsage, isStarter, isGrowth]);

  // Compute Channels Quota
  const channels: QuotaMetric = useMemo(() => {
    const current = rawUsage?.channels_connected ?? stats?.active_channels ?? 0;
    const limit = rawUsage?.channels_limit ?? (isStarter ? 2 : -1);
    const isUnlimited = limit === -1;
    const percent = isUnlimited ? 0 : Math.min(100, Math.round((current / limit) * 100));
    const isAtLimit = !isUnlimited && current >= limit;
    const isNearLimit = !isUnlimited && !isAtLimit && percent >= 80;
    const remaining = isUnlimited ? Infinity : Math.max(0, limit - current);

    return { current, limit, isUnlimited, isAtLimit, isNearLimit, percent, remaining };
  }, [rawUsage, stats?.active_channels, isStarter]);

  // Modal State
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<UpgradeModalConfig>({});

  const openUpgradeModal = useCallback((config?: UpgradeModalConfig) => {
    setModalConfig(config || {});
    setUpgradeModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setUpgradeModalOpen(false);
  }, []);

  return {
    tier,
    isStarter,
    isGrowth,
    isAgency,
    isLoading,
    refetch,
    // Metrics
    contacts,
    messages,
    channels,
    // Feature entitlements
    canStreamCsv: !isStarter,
    hasUnlimitedChannels: !isStarter,
    hasGranularRoles: isAgency,
    hasPriorityWorkers: isAgency,
    hasWebhookIngestion: !isStarter,
    // Modal management
    upgradeModalOpen,
    setUpgradeModalOpen,
    modalConfig,
    openUpgradeModal,
    closeUpgradeModal,
  };
}
