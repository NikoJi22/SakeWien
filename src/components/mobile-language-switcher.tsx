"use client";

import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "./language-switcher";

export function MobileLanguageSwitcher() {
  const pathname = usePathname();
  const onOrderPage = pathname === "/order-online";
  const hiddenRoute = pathname.startsWith("/admin");
  if (hiddenRoute) return null;

  return (
    <div
      className={`md:hidden fixed left-1/2 -translate-x-1/2 z-50 ${
        onOrderPage ? "bottom-24" : "bottom-4"
      }`}
    >
      <div className="rounded-full bg-brand-card/90 backdrop-blur-sm shadow-[0_8px_24px_rgba(31,35,38,0.14)] border border-brand-line px-1 py-1">
        <LanguageSwitcher compact emphasis />
      </div>
    </div>
  );
}
