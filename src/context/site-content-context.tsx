"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { SiteContentConfig } from "@/lib/menu-types";
import { defaultSiteContent } from "@/lib/site-content-default";

type SiteContentContextValue = {
  siteContent: SiteContentConfig;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [siteContent, setSiteContent] = useState<SiteContentConfig>(defaultSiteContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/site-content", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load site content");
      const data = (await res.json()) as SiteContentConfig;
      setSiteContent(data && typeof data === "object" ? data : defaultSiteContent);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load site content");
      setSiteContent(defaultSiteContent);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ siteContent, loading, error, refresh }),
    [siteContent, loading, error, refresh]
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error("useSiteContent must be used within SiteContentProvider");
  return ctx;
}
