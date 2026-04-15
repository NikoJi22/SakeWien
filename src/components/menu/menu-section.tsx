"use client";

import type { ReactNode } from "react";
import { menuSectionId } from "@/lib/menu-scroll";

type MenuSectionProps = {
  categoryId: string;
  title: string;
  children: ReactNode;
  scrollMarginClassName?: string;
};

export function MenuSection({
  categoryId,
  title,
  children,
  scrollMarginClassName = "scroll-mt-[8.5rem]"
}: MenuSectionProps) {
  return (
    <section id={menuSectionId(categoryId)} className={scrollMarginClassName}>
      <h2 className="mb-8 whitespace-pre-line border-b border-brand-primary/18 pb-3 font-serif text-[1.95rem] font-semibold tracking-wide text-brand-ink sm:text-[2.1rem]">
        {title}
      </h2>
      {children}
    </section>
  );
}
