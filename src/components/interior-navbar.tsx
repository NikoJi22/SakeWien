"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/context/language-context";
import { useOrderCartDrawer } from "@/context/order-cart-drawer-context";
import { LanguageSwitcher } from "./language-switcher";

const ctaClass =
  "inline-flex shrink-0 items-center justify-center rounded-full border border-[#b8956a]/95 bg-black/25 px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#e8dcc8] transition hover:border-[#d4b896] hover:bg-white/[0.06] sm:px-3.5 sm:py-2 sm:text-[10px] sm:tracking-[0.18em]";

export function InteriorNavbar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const orderDrawer = useOrderCartDrawer();
  const [open, setOpen] = useState(false);
  const onOrderPage = pathname === "/order-online";

  const linkClass =
    "whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85 transition hover:text-white lg:tracking-[0.22em]";

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#060606]/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-4 py-4 sm:gap-3 sm:px-8 lg:gap-4 lg:px-10">
        <Link href="/" className="shrink-0 font-serif text-lg tracking-[0.32em] text-[#ebe3d6]">
          SAKE
        </Link>

        <nav className="hidden min-w-0 flex-1 justify-center gap-5 md:flex lg:gap-8">
          <Link href="/" className={linkClass}>
            {t.nav.home}
          </Link>
          <Link href="/menu" className={linkClass}>
            {t.nav.menu}
          </Link>
          <Link href="/about" className={linkClass}>
            {t.nav.about}
          </Link>
          <Link href="/contact" className={linkClass}>
            {t.nav.contact}
          </Link>
        </nav>

        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-3">
          {onOrderPage ? (
            <>
              <button type="button" className={`${ctaClass} lg:hidden`} onClick={() => orderDrawer.open()}>
                {t.nav.orderShort}
              </button>
              <a href="#order-checkout" className={`${ctaClass} hidden lg:inline-flex`}>
                {t.nav.orderShort}
              </a>
            </>
          ) : (
            <Link href="/order-online" className={ctaClass}>
              {t.nav.orderShort}
            </Link>
          )}
          <Link href="/reservation" className={ctaClass}>
            {t.nav.bookTable}
          </Link>
          <div className="hidden md:block">
            <LanguageSwitcher compact />
          </div>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/90 md:hidden"
            aria-label="Menu"
            onClick={() => setOpen(true)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] md:hidden" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0 bg-black/75" onClick={() => setOpen(false)} aria-label="Close" />
          <div className="absolute right-0 top-0 flex h-full w-[min(100%,320px)] flex-col border-l border-white/10 bg-[#0a0a0a] p-8 pt-16">
            <button type="button" className="absolute right-4 top-4 text-white/70" onClick={() => setOpen(false)} aria-label="Close">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <nav className="flex flex-col gap-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
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
            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-8">
              {onOrderPage ? (
                <button
                  type="button"
                  className={`${ctaClass} w-full justify-center py-2.5`}
                  onClick={() => {
                    setOpen(false);
                    orderDrawer.open();
                  }}
                >
                  {t.nav.orderShort}
                </button>
              ) : (
                <Link href="/order-online" className={`${ctaClass} w-full justify-center py-2.5`} onClick={() => setOpen(false)}>
                  {t.nav.orderShort}
                </Link>
              )}
              <Link href="/reservation" className={`${ctaClass} w-full justify-center py-2.5`} onClick={() => setOpen(false)}>
                {t.nav.bookTable}
              </Link>
            </div>
            <div className="mt-auto border-t border-white/10 pt-8">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
