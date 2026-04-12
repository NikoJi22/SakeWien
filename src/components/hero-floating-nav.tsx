"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/context/language-context";
import { LanguageSwitcher } from "./language-switcher";
import { SiteLogo } from "./site-logo";
import { brandBtnPrimary, brandBtnSecondary } from "@/lib/brand-actions";

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.35}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

const ctaPrimaryClass = `whitespace-nowrap rounded-full ${brandBtnPrimary} px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] shadow-md active:scale-[0.98] sm:px-4 sm:py-2 sm:text-[10px] sm:tracking-[0.2em]`;

const ctaSecondaryClass = `whitespace-nowrap rounded-full ${brandBtnSecondary} bg-transparent px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] active:scale-[0.98] sm:px-4 sm:py-2 sm:text-[10px] sm:tracking-[0.2em]`;

const drawerCtaPrimaryClass = `inline-flex w-full items-center justify-center whitespace-nowrap rounded-full ${brandBtnPrimary} px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] shadow-md hover:shadow-lg`;

const drawerCtaSecondaryClass = `inline-flex w-full items-center justify-center whitespace-nowrap rounded-full ${brandBtnSecondary} px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em]`;

export function HeroFloatingNav() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function navLinkClass(href: string) {
    const active = pathname === href;
    return [
      "shrink-0 rounded-md px-0.5 text-[9px] font-bold uppercase tracking-[0.22em] transition sm:text-[10px] sm:tracking-[0.26em]",
      active
        ? "text-brand-primary underline decoration-2 decoration-brand-primary underline-offset-[6px] hover:text-brand-primary-dark"
        : "text-brand-ink hover:text-brand-primary hover:underline hover:decoration-brand-primary/45 hover:underline-offset-4"
    ].join(" ");
  }

  const menuLayer =
    open && mounted ? (
      <div className="hero-nav-overlay-root" role="dialog" aria-modal="true" aria-label="Navigation">
        <button
          type="button"
          className="hero-nav-overlay-backdrop"
          onClick={() => setOpen(false)}
          aria-label="Close"
        />
        <div className="hero-nav-overlay-panel">
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full p-2 text-brand-primary transition hover:bg-brand-surface-hover hover:text-brand-primary-dark active:bg-brand-surface-hover"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <nav className="flex flex-col gap-4 text-[11px] font-bold uppercase tracking-[0.25em] text-brand-ink">
            <Link href="/" className={pathname === "/" ? "text-brand-primary" : "hover:text-brand-primary"} onClick={() => setOpen(false)}>
              {t.nav.home}
            </Link>
            {pathname !== "/" && (
              <Link
                href="/order-online"
                className={pathname === "/order-online" ? "text-brand-primary" : "hover:text-brand-primary"}
                onClick={() => setOpen(false)}
              >
                {t.nav.orderShort}
              </Link>
            )}
            <Link
              href="/about"
              className={pathname === "/about" ? "text-brand-primary" : "hover:text-brand-primary"}
              onClick={() => setOpen(false)}
            >
              {t.nav.about}
            </Link>
            <Link
              href="/contact"
              className={pathname === "/contact" ? "text-brand-primary" : "hover:text-brand-primary"}
              onClick={() => setOpen(false)}
            >
              {t.nav.contact}
            </Link>
          </nav>
          <div className="mt-auto flex flex-col gap-3 border-t border-brand-primary/12 pt-6 md:border-brand-primary/12">
            <Link href="/order-online" className={`${drawerCtaPrimaryClass} md:hidden`} onClick={() => setOpen(false)}>
              {t.nav.orderShort}
            </Link>
            <Link href="/reservation" className={`${drawerCtaSecondaryClass} md:hidden`} onClick={() => setOpen(false)}>
              {t.nav.reserveTableNav}
            </Link>
            <Link
              href="/order-online"
              className={`${ctaPrimaryClass} hidden w-full justify-center py-2.5 md:inline-flex`}
              onClick={() => setOpen(false)}
            >
              {t.nav.orderShort}
            </Link>
            <Link
              href="/reservation"
              className={`${ctaSecondaryClass} hidden w-full justify-center py-2.5 md:inline-flex`}
              onClick={() => setOpen(false)}
            >
              {t.nav.reserveTableNav}
            </Link>
          </div>
          <div className="border-t border-brand-primary/12 pt-6 md:border-brand-primary/12">
            <div className="flex justify-center md:hidden">
              <LanguageSwitcher variant="drawer" emphasis />
            </div>
            <div className="hidden md:flex md:justify-center">
              <LanguageSwitcher emphasis />
            </div>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <nav
        className="pointer-events-auto inline-flex w-max max-w-[calc(100vw-1.25rem)] flex-nowrap items-center gap-1.5 rounded-full border border-brand-line bg-brand-card/95 px-2 py-2 shadow-[0_4px_28px_rgba(31,35,38,0.08),0_0_0_1px_rgba(216,225,229,0.6)] sm:gap-2.5 sm:px-4 sm:py-2.5 md:gap-3 md:px-6 md:py-3"
        aria-label="Main"
      >
        <SiteLogo variant="heroNav" />
        <button
          type="button"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-brand-primary transition hover:bg-brand-surface-hover hover:text-brand-primary-dark hover:shadow-sm active:scale-95 active:bg-brand-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
            open ? "bg-brand-surface-hover text-brand-primary-dark shadow-inner" : ""
          }`}
          aria-expanded={open}
          aria-label="Menu"
          onClick={() => setOpen(true)}
        >
          <MenuIcon className="h-[22px] w-[22px] text-current" />
        </button>

        <div className="hidden shrink-0 items-center gap-3 sm:flex md:gap-5">
          {pathname !== "/" && (
            <Link href="/order-online" className={navLinkClass("/order-online")}>
              {t.nav.orderShort}
            </Link>
          )}
          <Link href="/about" className={navLinkClass("/about")}>
            {t.nav.about}
          </Link>
          <Link href="/contact" className={`${navLinkClass("/contact")} hidden lg:inline`}>
            {t.nav.contact}
          </Link>
        </div>

        <Link href="/order-online" className={`${ctaPrimaryClass} shrink-0`}>
          {t.nav.orderShort}
        </Link>
        <Link href="/reservation" className={`${ctaSecondaryClass} shrink-0`}>
          {t.nav.reserveTableNav}
        </Link>

        <div className="hidden shrink-0 sm:block">
          <LanguageSwitcher compact emphasis />
        </div>
      </nav>

      {mounted && menuLayer ? createPortal(menuLayer, document.body) : null}
    </>
  );
}
