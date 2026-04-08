"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { MenuCategory } from "@/lib/menu-types";
import { menuSectionId } from "@/lib/menu-scroll";
import type { Language } from "@/lib/translations";
import { brandChipActive, brandChipInactive } from "@/lib/brand-actions";

const HEADER_FALLBACK_PX = 56;
/** Horizontal movement (px) before treating pointer interaction as drag-scroll instead of click. */
const DRAG_THRESHOLD_PX = 8;

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const suppressClickRef = useRef(false);
  /** Cleanup document listeners if pointer session ends or component unmounts */
  const dragDocCleanupRef = useRef<(() => void) | null>(null);
  const [stripGrabbing, setStripGrabbing] = useState(false);

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

  useEffect(() => {
    return () => {
      dragDocCleanupRef.current?.();
      dragDocCleanupRef.current = null;
    };
  }, []);

  const goTo = (id: string) => {
    setActiveId(id);
    document.getElementById(menuSectionId(id))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /**
   * Avoid setPointerCapture on pointerdown: it retargets pointerup away from the tab button,
   * so the browser never synthesizes a click. Only after horizontal movement exceeds the
   * threshold do we capture and scroll. Document listeners track the gesture reliably.
   * Touch is unchanged (native pan + tap).
   */
  const onStripPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    if (e.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;

    dragDocCleanupRef.current?.();
    dragDocCleanupRef.current = null;

    const pointerId = e.pointerId;
    const startX = e.clientX;
    const startScrollLeft = el.scrollLeft;
    let dragging = false;

    const moveOpts: AddEventListenerOptions = { passive: false };
    const cleanup = () => {
      document.removeEventListener("pointermove", onMove, moveOpts);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      if (dragDocCleanupRef.current === cleanup) {
        dragDocCleanupRef.current = null;
      }
    };

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const dx = ev.clientX - startX;
      if (!dragging && Math.abs(dx) >= DRAG_THRESHOLD_PX) {
        dragging = true;
        setStripGrabbing(true);
        try {
          el.setPointerCapture(pointerId);
        } catch {
          /* */
        }
      }
      if (dragging) {
        el.scrollLeft = startScrollLeft - dx;
        ev.preventDefault();
      }
    };

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      if (dragging) {
        suppressClickRef.current = true;
      }
      setStripGrabbing(false);
      try {
        el.releasePointerCapture(pointerId);
      } catch {
        /* */
      }
      cleanup();
    };

    document.addEventListener("pointermove", onMove, moveOpts);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    dragDocCleanupRef.current = cleanup;
  }, []);

  const onStripLostPointerCapture = useCallback(() => {
    setStripGrabbing(false);
  }, []);

  const onStripClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClickRef.current = false;
    }
  }, []);

  if (visible.length === 0 && leadingItems.length === 0) return null;

  return (
    <nav
      ref={outerRef}
      aria-label={language === "de" ? "Kategorien" : "Categories"}
      className={`sticky z-30 border-b border-brand-line bg-brand-canvas shadow-[0_1px_0_rgba(70,95,107,0.04)] ${className}`}
      style={{ top: stickyTopPx }}
    >
      <div className="mx-auto min-w-0 w-full max-w-[min(100%,1520px)] px-4 sm:px-6 lg:px-8">
        <div
          ref={scrollRef}
          onPointerDown={onStripPointerDown}
          onLostPointerCapture={onStripLostPointerCapture}
          onClickCapture={onStripClickCapture}
          className={[
            "min-w-0 cursor-grab overflow-x-auto overflow-y-hidden overscroll-x-contain py-2.5 select-none",
            stripGrabbing ? "cursor-grabbing" : "",
            "touch-pan-x [-webkit-overflow-scrolling:touch]",
            "[scrollbar-width:thin] [scrollbar-color:#CED8DC_transparent]",
            "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent",
            "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-brand-line-strong/50",
            "[&::-webkit-scrollbar-thumb]:hover:bg-brand-line-strong/70"
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
                  className={`shrink-0 cursor-grab whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors duration-200 ease-out active:cursor-grabbing ${
                    active ? brandChipActive : brandChipInactive
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
            {visible.map((cat) => {
              const active = activeId === cat.id;
              const rawTitle = cat.title[language] || cat.id;
              const label = rawTitle.includes("\n") ? rawTitle.split("\n")[0].trim() : rawTitle;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => goTo(cat.id)}
                  className={`shrink-0 cursor-grab whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors duration-200 ease-out active:cursor-grabbing ${
                    active ? brandChipActive : brandChipInactive
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
