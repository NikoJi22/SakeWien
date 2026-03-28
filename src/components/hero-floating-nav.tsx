"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/context/language-context";
import { LanguageSwitcher } from "./language-switcher";

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

const ctaPrimaryClass =
  "whitespace-nowrap rounded-full border-2 border-brand-accent bg-brand-accent px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white shadow-md shadow-neutral-900/15 transition hover:border-brand-accent-hover hover:bg-brand-accent-hover hover:shadow-lg active:scale-[0.98] sm:px-4 sm:py-2 sm:text-[10px] sm:tracking-[0.2em]";

const ctaSecondaryClass =
  "whitespace-nowrap rounded-full border-2 border-neutral-400 bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-900 shadow-sm transition hover:border-brand-accent hover:bg-neutral-50 hover:text-brand-accent active:scale-[0.98] sm:px-4 sm:py-2 sm:text-[10px] sm:tracking-[0.2em]";

const drawerCtaPrimaryClass =
  "inline-flex w-full items-center justify-center whitespace-nowrap rounded-full border-2 border-brand-accent bg-brand-accent px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-md transition hover:bg-brand-accent-hover";

const drawerCtaSecondaryClass =
  "inline-flex w-full items-center justify-center whitespace-nowrap rounded-full border-2 border-neutral-400 bg-white px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900 shadow-sm transition hover:border-brand-accent hover:bg-neutral-50";

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
        ? "text-brand-accent underline decoration-2 decoration-brand-accent underline-offset-[6px] hover:text-brand-accent-hover"
        : "text-neutral-950 hover:text-brand-accent hover:underline hover:decoration-brand-accent/60 hover:underline-offset-4"
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
            className="absolute right-4 top-4 rounded-full p-2 text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950 active:bg-neutral-200"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Link href="/" className="font-serif text-xl font-semibold tracking-[0.35em] text-neutral-950" onClick={() => setOpen(false)}>
            SAKE
          </Link>
          <nav className="flex flex-col gap-4 text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-900">
            <Link href="/" className={pathname === "/" ? "text-brand-accent" : "hover:text-brand-accent"} onClick={() => setOpen(false)}>
              {t.nav.home}
            </Link>
            <Link
              href="/menu"
              className={pathname === "/menu" ? "text-brand-accent" : "hover:text-brand-accent"}
              onClick={() => setOpen(false)}
            >
              {t.nav.menu}
            </Link>
            <Link
              href="/about"
              className={pathname === "/about" ? "text-brand-accent" : "hover:text-brand-accent"}
              onClick={() => setOpen(false)}
            >
              {t.nav.about}
            </Link>
            <Link
              href="/contact"
              className={pathname === "/contact" ? "text-brand-accent" : "hover:text-brand-accent"}
              onClick={() => setOpen(false)}
            >
              {t.nav.contact}
            </Link>
          </nav>
          <div className="mt-auto flex flex-col gap-3 border-t border-[#eeeeee] pt-6 md:border-[#eeeeee]">
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
          <div className="border-t border-[#eeeeee] pt-6 md:border-[#eeeeee]">
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
        className="pointer-events-auto inline-flex w-max max-w-[calc(100vw-2rem)] flex-nowrap items-center gap-1.5 rounded-full border border-neutral-300/90 bg-white px-2 py-1.5 shadow-[0_4px_28px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.04)] sm:gap-2.5 sm:px-4 sm:py-2 md:gap-3 md:px-6 md:py-2.5"
        aria-label="Main"
      >
        <button
          type="button"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-950 transition hover:bg-neutral-200/95 hover:shadow-sm active:scale-95 active:bg-neutral-300/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 ${
            open ? "bg-neutral-200 shadow-inner" : ""
          }`}
          aria-expanded={open}
          aria-label="Menu"
          onClick={() => setOpen(true)}
        >
          <MenuIcon className="h-[22px] w-[22px]" />
        </button>

        <Link
          href="/"
          className="shrink-0 font-serif text-base font-semibold tracking-[0.36em] text-neutral-950 transition hover:text-brand-accent sm:text-lg"
        >
          SAKE
        </Link>

        <div className="hidden shrink-0 items-center gap-3 sm:flex md:gap-5">
          <Link href="/menu" className={navLinkClass("/menu")}>
            {t.nav.menu}
          </Link>
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
