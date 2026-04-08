"use client";

import { Hero } from "@/components/hero";
import { SiteLogo } from "@/components/site-logo";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <section
        className="relative border-t border-brand-primary/12 bg-gradient-to-b from-brand-card/90 via-brand-canvas/80 to-brand-page"
        aria-label="SAKE"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" aria-hidden />
        <SiteLogo variant="heroBand" lightUiTone="subtleContrast" className="py-8 sm:py-10 md:py-12" />
      </section>
    </div>
  );
}
