"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/context/language-context";
import { useOrderCartDrawer } from "@/context/order-cart-drawer-context";
import { LanguageSwitcher } from "./language-switcher";

const ctaPrimaryClass =
  "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-brand-accent bg-brand-accent px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-white shadow-sm transition hover:border-brand-accent-hover hover:bg-brand-accent-hover active:scale-[0.98] sm:px-3.5 sm:py-2 sm:text-[10px] sm:tracking-[0.18em]";

const ctaSecondaryClass =
  "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-neutral-400 bg-white px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-neutral-900 shadow-sm transition hover:border-brand-accent hover:bg-neutral-50 active:scale-[0.98] sm:px-3.5 sm:py-2 sm:text-[10px] sm:tracking-[0.18em]";

const drawerCtaPrimaryClass =
  "inline-flex w-full items-center justify-center rounded-full border-2 border-brand-accent bg-brand-accent px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-md transition hover:bg-brand-accent-hover";

const drawerCtaSecondaryClass =
  "inline-flex w-full items-center justify-center rounded-full border-2 border-neutral-400 bg-white px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-900 shadow-sm transition hover:border-brand-accent hover:bg-neutral-50";

function routeActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function InteriorNavbar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const orderDrawer = useOrderCartDrawer();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const onOrderPage = pathname === "/order-online";

  useEffect(() => setMounted(true), []);

  function deskLinkClass(href: string) {
    const active = routeActive(pathname, href);
    return [
      "whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em] transition lg:tracking-[0.22em]",
      active
        ? "text-brand-accent underline decoration-2 decoration-brand-accent underline-offset-[5px]"
        : "text-neutral-900 hover:text-brand-accent hover:underline hover:decoration-brand-accent/50 hover:underline-offset-4"
    ].join(" ");
  }

  const menuLayer =
    open && mounted ? (
      <div className="mobile-menu-fullscreen-overlay md:hidden" role="dialog" aria-modal="true">
        <button
          type="button"
          className="mobile-menu-fullscreen-overlay__dismiss"
          onClick={() => setOpen(false)}
          aria-label="Close"
        />
        <div className="mobile-menu-fullscreen-overlay__panel pointer-events-auto absolute right-0 top-0 z-[1] flex h-full w-full max-w-[320px] flex-col border-l border-[#eeeeee] p-8 pt-16">
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full p-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <nav className="flex flex-col gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-900">
            <Link
              href="/"
              className={routeActive(pathname, "/") ? "text-brand-accent" : "hover:text-brand-accent"}
              onClick={() => setOpen(false)}
            >
              {t.nav.home}
            </Link>
            <Link
              href="/menu"
              className={routeActive(pathname, "/menu") ? "text-brand-accent" : "hover:text-brand-accent"}
              onClick={() => setOpen(false)}
            >
              {t.nav.menu}
            </Link>
            <Link
              href="/about"
              className={routeActive(pathname, "/about") ? "text-brand-accent" : "hover:text-brand-accent"}
              onClick={() => setOpen(false)}
            >
              {t.nav.about}
            </Link>
            <Link
              href="/contact"
              className={routeActive(pathname, "/contact") ? "text-brand-accent" : "hover:text-brand-accent"}
              onClick={() => setOpen(false)}
            >
              {t.nav.contact}
            </Link>
          </nav>
          <div className="mt-8 flex flex-col gap-3 border-t border-[#eeeeee] pt-8">
            {onOrderPage ? (
              <button
                type="button"
                className={drawerCtaPrimaryClass}
                onClick={() => {
                  setOpen(false);
                  orderDrawer.open();
                }}
              >
                {t.nav.orderShort}
              </button>
            ) : (
              <Link href="/order-online" className={drawerCtaPrimaryClass} onClick={() => setOpen(false)}>
                {t.nav.orderShort}
              </Link>
            )}
            <Link href="/reservation" className={drawerCtaSecondaryClass} onClick={() => setOpen(false)}>
              {t.nav.bookTable}
            </Link>
          </div>
          <div className="mt-auto flex justify-center border-t border-[#eeeeee] pt-8">
            <LanguageSwitcher variant="drawer" emphasis />
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <header
        id="site-header"
        className="sticky top-0 z-50 border-b border-neutral-200/90 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
      >
        <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-4 py-4 sm:gap-3 sm:px-8 lg:gap-4 lg:px-10">
          <Link href="/" className="shrink-0 font-serif text-lg font-semibold tracking-[0.32em] text-neutral-950">
            SAKE
          </Link>

          <nav className="hidden min-w-0 flex-1 justify-center gap-5 md:flex lg:gap-8">
            <Link href="/" className={deskLinkClass("/")}>
              {t.nav.home}
            </Link>
            <Link href="/menu" className={deskLinkClass("/menu")}>
              {t.nav.menu}
            </Link>
            <Link href="/about" className={deskLinkClass("/about")}>
              {t.nav.about}
            </Link>
            <Link href="/contact" className={deskLinkClass("/contact")}>
              {t.nav.contact}
            </Link>
          </nav>

          <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-3">
            {onOrderPage ? (
              <>
                <button type="button" className={`${ctaPrimaryClass} lg:hidden`} onClick={() => orderDrawer.open()}>
                  {t.nav.orderShort}
                </button>
                <a href="#order-checkout" className={`${ctaPrimaryClass} hidden lg:inline-flex`}>
                  {t.nav.orderShort}
                </a>
              </>
            ) : (
              <Link href="/order-online" className={ctaPrimaryClass}>
                {t.nav.orderShort}
              </Link>
            )}
            <Link href="/reservation" className={ctaSecondaryClass}>
              {t.nav.bookTable}
            </Link>
            <div className="hidden md:block">
              <LanguageSwitcher compact emphasis />
            </div>
            <button
              type="button"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-950 transition hover:bg-neutral-200 active:scale-95 active:bg-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 md:hidden ${
                open ? "bg-neutral-200" : ""
              }`}
              aria-expanded={open}
              aria-label="Menu"
              onClick={() => setOpen(true)}
            >
              <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth={2.35} viewBox="0 0 24 24">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      {mounted && menuLayer ? createPortal(menuLayer, document.body) : null}
    </>
  );
}
