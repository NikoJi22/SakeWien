"use client";

import type { ReactNode } from "react";

export function AdminField({
  label,
  children,
  className = ""
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{label}</span>
      {children}
    </label>
  );
}

export const adminInputClass =
  "rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-gold/60";

export const adminTextareaClass = `${adminInputClass} min-h-[72px] resize-y`;
