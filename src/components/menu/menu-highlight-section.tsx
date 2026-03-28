"use client";

import type { ReactNode } from "react";
import { menuSectionId } from "@/lib/menu-scroll";

type Props = {
  navId: string;
  title: string;
  children: ReactNode;
  /** Distinct visual frame for spotlight blocks */
  variant?: "amber" | "emerald";
};

export function MenuHighlightSection({ navId, title, children, variant = "amber" }: Props) {
  const ring =
    variant === "emerald"
      ? "border-emerald-400/35 bg-gradient-to-br from-emerald-50/90 via-brand-card to-brand-card shadow-[0_0_0_1px_rgba(16,185,129,0.12)]"
      : "border-amber-400/35 bg-gradient-to-br from-amber-50/90 via-brand-card to-brand-card shadow-[0_0_0_1px_rgba(245,158,11,0.12)]";

  return (
    <section id={menuSectionId(navId)} className="scroll-mt-[8.5rem] rounded-3xl border border-brand-line p-5 sm:p-7 lg:p-8">
      <div className={`rounded-2xl border p-4 sm:p-6 ${ring}`}>
        <h2 className="mb-6 font-serif text-xl font-semibold tracking-wide text-brand-ink sm:text-2xl">{title}</h2>
        {children}
      </div>
    </section>
  );
}
