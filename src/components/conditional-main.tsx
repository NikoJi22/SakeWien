"use client";

import { usePathname } from "next/navigation";

/**
 * Startseite: kein min-h-screen auf <main> — der Hero füllt die Höhe selbst (min-h-screen),
 * sonst bleibt ein Streifen „Leerraum“ unter dem Hero (100vh erzwungen, Inhalt kürzer).
 */
export function ConditionalMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  return (
    <main className={isHome ? "w-full min-w-0" : "min-h-screen w-full min-w-0"}>{children}</main>
  );
}
