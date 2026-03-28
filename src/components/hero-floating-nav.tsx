"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/context/language-context";
import { LanguageSwitcher } from "./language-switcher";

function MenuIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

const ctaClass =
  "whitespace-nowrap rounded-full border border-[#b8956a]/95 bg-black/25 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#e8dcc8] transition hover:border-[#d4b896] hover:bg-white/[0.06] sm:px-4 sm:py-2 sm:text-[10px] sm:tracking-[0.22em]";

/** Solid CTA for mobile drawer only (no translucent bg/border). */
const drawerCtaClass =
  "inline-flex w-full items-center justify-center whitespace-nowrap rounded-full border border-[#b8956a] bg-[#0d0d0d] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e8dcc8] transition hover:border-[#d4b896] hover:bg-[#1a1a1a]";

const navLinkClass =
  "shrink-0 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/88 transition hover:text-white sm:text-[10px] sm:tracking-[0.26em]";

export function HeroFloatingNav() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
            className="absolute right-4 top-4 text-[#a8a8a8] transition hover:text-white md:text-white/70"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Link href="/" className="font-serif text-xl tracking-[0.35em] text-[#e8dcc8]" onClick={() => setOpen(false)}>
            SAKE
          </Link>
          <nav className="flex flex-col gap-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#f0f0f0] md:text-white/90">
            <Link href="/" onClick={() => setOpen(false)}>
              {t.nav.home}
            </Link>
            <Link href="/menu" onClick={() => setOpen(false)}>
              {t.nav.menu}
            </Link>
            <Link href="/about" onClick={() => setOpen(false)}>
              {t.nav.about}
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)}>
              {t.nav.contact}
            </Link>
          </nav>
          <div className="mt-auto flex flex-col gap-3 border-t border-[#262626] pt-6 md:border-white/10">
            <Link href="/order-online" className={`${drawerCtaClass} md:hidden`} onClick={() => setOpen(false)}>
              {t.nav.orderShort}
            </Link>
            <Link href="/reservation" className={`${drawerCtaClass} md:hidden`} onClick={() => setOpen(false)}>
              {t.nav.reserveTableNav}
            </Link>
            <Link
              href="/order-online"
              className={`${ctaClass} hidden w-full justify-center py-2.5 md:inline-flex`}
              onClick={() => setOpen(false)}
            >
              {t.nav.orderShort}
            </Link>
            <Link
              href="/reservation"
              className={`${ctaClass} hidden w-full justify-center py-2.5 md:inline-flex`}
              onClick={() => setOpen(false)}
            >
              {t.nav.reserveTableNav}
            </Link>
          </div>
          <div className="border-t border-[#262626] pt-6 md:border-white/10">
            <div className="flex justify-center md:hidden">
              <LanguageSwitcher variant="drawer" />
            </div>
            <div className="hidden md:flex md:justify-center">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <nav className="pointer-events-auto inline-flex w-max max-w-[calc(100vw-2rem)] flex-nowrap items-center gap-2 rounded-full border border-white/[0.12] bg-black/45 px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:gap-3 sm:px-5 sm:py-2.5 md:gap-4 md:px-7">
        <button
          type="button"
          className="shrink-0 text-white/90 transition hover:text-white"
          aria-expanded={open}
          aria-label="Menu"
          onClick={() => setOpen(true)}
        >
          <MenuIcon />
        </button>

        <Link href="/" className="shrink-0 font-serif text-base font-light tracking-[0.38em] text-[#ebe3d6] sm:text-lg">
          SAKE
        </Link>

        <div className="hidden shrink-0 items-center gap-4 sm:flex md:gap-5">
          <Link href="/menu" className={navLinkClass}>
            {t.nav.menu}
          </Link>
          <Link href="/about" className={navLinkClass}>
            {t.nav.about}
          </Link>
          <Link href="/contact" className={`${navLinkClass} hidden lg:inline`}>
            {t.nav.contact}
          </Link>
        </div>

        <Link href="/order-online" className={`${ctaClass} shrink-0`}>
          {t.nav.orderShort}
        </Link>
        <Link href="/reservation" className={`${ctaClass} shrink-0`}>
          {t.nav.reserveTableNav}
        </Link>

        <div className="hidden shrink-0 sm:block">
          <LanguageSwitcher compact />
        </div>
      </nav>

      {mounted && menuLayer ? createPortal(menuLayer, document.body) : null}
    </>
  );
}
