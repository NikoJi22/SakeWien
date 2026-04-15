"use client";

import type { ReactNode } from "react";
import { menuSectionId } from "@/lib/menu-scroll";

type Props = {
  navId: string;
  title: string;
  children: ReactNode;
  /** Distinct visual frame for spotlight blocks */
  variant?: "amber" | "warm";
};

export function MenuHighlightSection({ navId, title, children, variant = "amber" }: Props) {
  const ring =
    variant === "warm"
      ? "border-brand-line bg-gradient-to-br from-brand-muted/55 via-brand-card to-brand-card shadow-[0_0_0_1px_rgba(70,95,107,0.07)]"
      : "border-brand-line-strong/80 bg-gradient-to-br from-brand-muted/75 via-brand-card to-brand-card shadow-[0_0_0_1px_rgba(70,95,107,0.09)]";

  return (
    <section id={menuSectionId(navId)} className="scroll-mt-[8.5rem] rounded-3xl border border-brand-line p-5 sm:p-7 lg:p-8">
      <div className={`rounded-2xl border p-4 sm:p-6 ${ring}`}>
        <h2 className="mb-6 font-serif text-2xl font-semibold tracking-wide text-brand-ink sm:text-[1.95rem]">{title}</h2>
        {children}
      </div>
    </section>
  );
}
