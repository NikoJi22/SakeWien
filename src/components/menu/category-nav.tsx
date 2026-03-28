"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { MenuCategory } from "@/lib/menu-types";
import { menuSectionId } from "@/lib/menu-scroll";
import type { Language } from "@/lib/translations";

const HEADER_FALLBACK_PX = 72;

export type CategoryNavLeadingItem = { id: string; label: string };

type CategoryNavProps = {
  categories: MenuCategory[];
  language: Language;
  className?: string;
  /** Extra tabs before category list (e.g. bestsellers / new anchors) */
  leadingItems?: CategoryNavLeadingItem[];
};

function measureSiteHeaderHeight(): number {
  if (typeof document === "undefined") return HEADER_FALLBACK_PX;
  const el = document.getElementById("site-header");
  if (!el) return HEADER_FALLBACK_PX;
  return Math.round(el.getBoundingClientRect().height);
}

export function CategoryNav({ categories, language, className = "", leadingItems = [] }: CategoryNavProps) {
  const visible = useMemo(() => categories.filter((c) => c.items.length > 0), [categories]);
  const ids = useMemo(() => [...leadingItems.map((l) => l.id), ...visible.map((c) => c.id)], [leadingItems, visible]);
  const [activeId, setActiveId] = useState(ids[0] ?? "");
  const [stickyTopPx, setStickyTopPx] = useState(HEADER_FALLBACK_PX);
  const [scrollSpyOffsetPx, setScrollSpyOffsetPx] = useState(HEADER_FALLBACK_PX + 44);
  const outerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setActiveId(ids[0] ?? "");
  }, [ids]);

  useLayoutEffect(() => {
    function updateHeaderMetrics() {
      const h = measureSiteHeaderHeight();
      setStickyTopPx((prev) => (prev === h ? prev : h));
      const navEl = outerRef.current;
      const barH = navEl ? Math.round(navEl.getBoundingClientRect().height) : 44;
      const nextOff = h + Math.min(barH, 56) - 4;
      setScrollSpyOffsetPx((prev) => (prev === nextOff ? prev : nextOff));
    }

    updateHeaderMetrics();
    window.addEventListener("resize", updateHeaderMetrics, { passive: true });

    const headerEl = document.getElementById("site-header");
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateHeaderMetrics) : null;
    if (headerEl && ro) ro.observe(headerEl);

    const navEl = outerRef.current;
    const roBar = typeof ResizeObserver !== "undefined" && navEl ? new ResizeObserver(updateHeaderMetrics) : null;
    if (navEl && roBar) roBar.observe(navEl);

    return () => {
      window.removeEventListener("resize", updateHeaderMetrics);
      ro?.disconnect();
      roBar?.disconnect();
    };
  }, [visible.length]);

  const syncActive = useCallback(() => {
    const threshold = scrollSpyOffsetPx;
    let current = ids[0] ?? "";
    for (const id of ids) {
      const el = document.getElementById(menuSectionId(id));
      if (!el) continue;
      const top = el.getBoundingClientRect().top;
      if (top <= threshold) current = id;
    }
    setActiveId((prev) => (prev === current ? prev : current));
  }, [ids, scrollSpyOffsetPx]);

  useEffect(() => {
    if (ids.length === 0) return;
    window.addEventListener("scroll", syncActive, { passive: true });
    syncActive();
    return () => window.removeEventListener("scroll", syncActive);
  }, [ids, syncActive]);

  const goTo = (id: string) => {
    setActiveId(id);
    document.getElementById(menuSectionId(id))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (visible.length === 0 && leadingItems.length === 0) return null;

  return (
    <nav
      ref={outerRef}
      aria-label={language === "de" ? "Kategorien" : "Categories"}
      className={`sticky z-30 border-b border-brand-line bg-brand-canvas shadow-[0_1px_0_rgba(22,20,18,0.04)] ${className}`}
      style={{ top: stickyTopPx }}
    >
      <div className="mx-auto min-w-0 max-w-[min(100%,1200px)] px-4 sm:px-8 lg:px-10">
        <div
          className={[
            "min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain py-2.5",
            "touch-pan-x [-webkit-overflow-scrolling:touch]",
            "[scrollbar-width:thin] [scrollbar-color:rgb(181,170,154)_transparent]",
            "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent",
            "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-brand-line-strong/70"
          ].join(" ")}
        >
          <div className="flex w-max max-w-none flex-nowrap items-stretch gap-2 pl-0.5 pr-3" role="tablist">
            {leadingItems.map((l) => {
              const active = activeId === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => goTo(l.id)}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "border-brand-accent bg-brand-accent text-white shadow-md shadow-brand-accent/15"
                      : "border-brand-line bg-brand-card text-brand-ink-secondary hover:border-brand-line-strong hover:bg-brand-muted hover:text-brand-ink"
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
            {visible.map((cat) => {
              const active = activeId === cat.id;
              const label = cat.title[language] || cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => goTo(cat.id)}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "border-brand-accent bg-brand-accent text-white shadow-md shadow-brand-accent/15"
                      : "border-brand-line bg-brand-card text-brand-ink-secondary hover:border-brand-line-strong hover:bg-brand-muted hover:text-brand-ink"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
