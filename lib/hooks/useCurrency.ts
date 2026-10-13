"use client";

import { useState, useEffect, useCallback } from "react";
import type { Currency } from "@/lib/services/billing.service";

const STORAGE_KEY = "omnipulse_currency_preference";

export function useCurrency() {
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [isDetected, setIsDetected] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Currency | null;
      if (saved === "USD" || saved === "NGN") {
        setCurrencyState(saved);
        setIsDetected(true);
        return;
      }

      // Geo / Timezone heuristic detection
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const locale = typeof navigator !== "undefined" ? navigator.language : "";

      const isNigerian =
        timeZone.includes("Lagos") ||
        timeZone.includes("Nigeria") ||
        locale.toLowerCase().includes("-ng") ||
        locale.toLowerCase() === "ng";

      if (isNigerian) {
        setCurrencyState("NGN");
      } else {
        setCurrencyState("USD");
      }
    } catch {
      setCurrencyState("USD");
    } finally {
      setIsDetected(true);
    }
  }, []);

  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem(STORAGE_KEY, newCurrency);
    } catch {
      // storage unavailable
    }
  }, []);

  const symbol = currency === "NGN" ? "₦" : "$";

  return {
    currency,
    setCurrency,
    symbol,
    isDetected,
    isNGN: currency === "NGN",
    isUSD: currency === "USD",
  };
}
