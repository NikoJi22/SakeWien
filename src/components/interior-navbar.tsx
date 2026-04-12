"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/context/language-context";
import { useOrderCartDrawer } from "@/context/order-cart-drawer-context";
import { LanguageSwitcher } from "./language-switcher";
import { SiteLogo } from "./site-logo";
import { brandBtnPrimary, brandBtnSecondary } from "@/lib/brand-actions";

const ctaPrimaryClass = `inline-flex shrink-0 items-center justify-center rounded-full ${brandBtnPrimary} px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.14em] active:scale-[0.98] sm:px-3.5 sm:py-2 sm:text-[10px] sm:tracking-[0.18em]`;

const ctaSecondaryClass = `inline-flex shrink-0 items-center justify-center rounded-full ${brandBtnSecondary} bg-transparent px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.14em] active:scale-[0.98] sm:px-3.5 sm:py-2 sm:text-[10px] sm:tracking-[0.18em]`;

const drawerCtaPrimaryClass = `inline-flex w-full items-center justify-center rounded-full ${brandBtnPrimary} px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] shadow-md hover:shadow-lg`;

const drawerCtaSecondaryClass = `inline-flex w-full items-center justify-center rounded-full ${brandBtnSecondary} px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em]`;

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
        ? "text-brand-primary underline decoration-2 decoration-brand-primary underline-offset-[5px]"
        : "text-brand-ink hover:text-brand-primary hover:underline hover:decoration-brand-primary/45 hover:underline-offset-4"
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
        <div className="mobile-menu-fullscreen-overlay__panel pointer-events-auto absolute right-0 top-0 z-[1] flex h-full w-full max-w-[320px] flex-col border-l border-brand-primary/12 p-8 pt-16">
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full p-2 text-brand-primary transition hover:bg-brand-surface-hover hover:text-brand-primary-dark"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <nav className="flex flex-col gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-ink">
            <Link
              href="/"
              className={routeActive(pathname, "/") ? "text-brand-primary" : "hover:text-brand-primary"}
              onClick={() => setOpen(false)}
            >
              {t.nav.home}
            </Link>
            {pathname !== "/" && (
              <Link
                href="/order-online"
                className={routeActive(pathname, "/order-online") ? "text-brand-primary" : "hover:text-brand-primary"}
                onClick={() => setOpen(false)}
              >
                {t.nav.orderShort}
              </Link>
            )}
            <Link
              href="/about"
              className={routeActive(pathname, "/about") ? "text-brand-primary" : "hover:text-brand-primary"}
              onClick={() => setOpen(false)}
            >
              {t.nav.about}
            </Link>
            <Link
              href="/contact"
              className={routeActive(pathname, "/contact") ? "text-brand-primary" : "hover:text-brand-primary"}
              onClick={() => setOpen(false)}
            >
              {t.nav.contact}
            </Link>
          </nav>
          <div className="mt-8 flex flex-col gap-3 border-t border-brand-primary/12 pt-8">
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
          <div className="mt-auto flex justify-center border-t border-brand-primary/12 pt-8">
            <LanguageSwitcher variant="drawer" emphasis />
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <header
        id="site-header"
        className="sticky top-0 z-50 border-b border-brand-line bg-brand-card shadow-[0_1px_0_rgba(31,35,38,0.04)]"
      >
        <div         className="mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-2 sm:gap-3 sm:px-5 sm:py-2.5 lg:gap-5 lg:px-8 lg:py-2.5">
          <SiteLogo variant="header" className="shrink-0" />

          <nav className="hidden min-w-0 flex-1 justify-center gap-5 md:flex lg:gap-8">
            <Link href="/" className={deskLinkClass("/")}>
              {t.nav.home}
            </Link>
            {pathname !== "/" && (
              <Link href="/order-online" className={deskLinkClass("/order-online")}>
                {t.nav.orderShort}
              </Link>
            )}
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
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-primary transition hover:bg-brand-surface-hover hover:text-brand-primary-dark active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 md:hidden ${
                open ? "bg-brand-surface-hover text-brand-primary-dark" : ""
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
