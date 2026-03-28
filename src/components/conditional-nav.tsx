"use client";

import { usePathname } from "next/navigation";
import { InteriorNavbar } from "./interior-navbar";

export function ConditionalNav() {
  const pathname = usePathname();
  if (pathname === "/" || pathname?.startsWith("/admin")) return null;
  return <InteriorNavbar />;
}
