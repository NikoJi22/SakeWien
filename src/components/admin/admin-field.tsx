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
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

export const adminInputClass =
  "rounded-lg border border-[#ccc] bg-white px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-[#888] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]";

export const adminSelectClass =
  "rounded-lg border border-[#ccc] bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#888] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]";

export const adminTextareaClass = `${adminInputClass} min-h-[72px] resize-y`;
