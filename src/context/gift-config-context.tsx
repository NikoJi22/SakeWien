"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { orderGiftConfig } from "@/config/order-gift";
import type { GiftConfig } from "@/lib/menu-types";

type GiftConfigContextValue = {
  config: GiftConfig;
  loading: boolean;
  refresh: () => Promise<void>;
};

const GiftConfigContext = createContext<GiftConfigContextValue | null>(null);

const fallback: GiftConfig = {
  thresholdEur: orderGiftConfig.thresholdEur,
  message: { en: orderGiftConfig.message.en, de: orderGiftConfig.message.de }
};

export function GiftConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<GiftConfig>(fallback);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gift", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as GiftConfig;
        setConfig(data);
      } else {
        setConfig(fallback);
      }
    } catch {
      setConfig(fallback);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    function onGiftUpdated() {
      void refresh();
    }
    window.addEventListener("sake-gift-updated", onGiftUpdated);
    return () => window.removeEventListener("sake-gift-updated", onGiftUpdated);
  }, [refresh]);

  const value = useMemo(() => ({ config, loading, refresh }), [config, loading, refresh]);

  return <GiftConfigContext.Provider value={value}>{children}</GiftConfigContext.Provider>;
}

export function useGiftConfig() {
  const ctx = useContext(GiftConfigContext);
  if (!ctx) {
    return { config: fallback, loading: false, refresh: async () => {} };
  }
  return ctx;
}
