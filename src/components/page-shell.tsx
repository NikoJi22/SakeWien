import type { ReactNode } from "react";

export function PageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`mx-auto w-full max-w-[min(100%,1520px)] px-4 pt-10 pb-14 sm:px-6 sm:pt-12 sm:pb-16 lg:px-8 lg:pb-20 ${className}`}
    >
      {children}
    </div>
  );
}
