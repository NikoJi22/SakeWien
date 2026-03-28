"use client";

import { usePathname } from "next/navigation";
import { InteriorNavbar } from "./interior-navbar";

export function ConditionalNav() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <InteriorNavbar />;
}
