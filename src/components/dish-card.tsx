"use client";

import Image from "next/image";
import { labelMenuItem, type MenuItem } from "@/lib/menu-data";
import { useLanguage } from "@/context/language-context";

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${className}`}>{children}</span>;
}

export function DishCard({ item }: { item: MenuItem }) {
  const { language, t } = useLanguage();
  const L = labelMenuItem(item, language);

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a]/95 shadow-[0_16px_48px_rgba(0,0,0,0.45)] transition-shadow duration-300 hover:border-white/[0.12] hover:shadow-[0_20px_56px_rgba(0,0,0,0.5)]">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={item.image}
          alt={L.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          {item.isNew && <Badge className="border border-emerald-300/40 bg-emerald-900/65 text-emerald-100">{t.order.newBadge}</Badge>}
          {item.isBestseller && (
            <Badge className="border border-amber-300/40 bg-amber-900/60 text-amber-100">{t.order.bestsellerBadge}</Badge>
          )}
        </div>
      </div>
      <div className="space-y-2.5 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-lg font-light tracking-[0.02em] text-[#ebe3d6]">{L.name}</h3>
          <span className="shrink-0 pt-0.5 font-medium text-gold">{L.price}</span>
        </div>
        <p className="text-sm leading-relaxed text-white/62">{L.description}</p>
      </div>
    </article>
  );
}
