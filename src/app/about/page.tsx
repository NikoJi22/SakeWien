"use client";

import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { SiteLogo } from "@/components/site-logo";
import { useLanguage } from "@/context/language-context";
import { brandBtnSecondary } from "@/lib/brand-actions";

const STORY_IMAGE =
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=85";
const QUALITY_IMAGE =
  "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=1600&q=85";

export default function AboutPage() {
  const { t } = useLanguage();
  const a = t.about;

  return (
    <div>
      <PageHeader title={a.title} subtitle={a.intro} />

      <PageShell className="pb-10 sm:pb-12 lg:pb-14">
        <div className="mb-10 flex justify-center sm:mb-12">
          <SiteLogo variant="aboutFeature" lightUiTone="subtleContrast" className="w-full max-w-lg" />
        </div>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-brand-line bg-brand-card shadow-[0_1px_3px_rgba(31,35,38,0.05)]">
            <Image src={STORY_IMAGE} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(31,35,38,0.2)] via-transparent to-transparent" />
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-brand-accent">SAKE</p>
            <h2 className="font-serif text-2xl font-light tracking-[0.06em] text-brand-ink sm:text-3xl">{a.storyTitle}</h2>
            <p className="text-sm leading-relaxed text-brand-body sm:text-base">{a.storyBody}</p>
          </div>
        </div>
      </PageShell>

      <PageShell className="border-t border-brand-primary/12 py-10 sm:py-12 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <article className="flex flex-col overflow-hidden rounded-2xl border border-brand-line bg-brand-card shadow-[0_1px_3px_rgba(31,35,38,0.05)]">
            <div className="relative aspect-[16/10] w-full">
              <Image src={QUALITY_IMAGE} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
            <div className="space-y-3 p-7 sm:p-8">
              <h2 className="font-serif text-xl font-light tracking-[0.06em] text-brand-ink sm:text-2xl">{a.qualityTitle}</h2>
              <p className="text-sm leading-relaxed text-brand-body sm:text-base">{a.qualityBody}</p>
            </div>
          </article>
          <article className="flex flex-col justify-center rounded-2xl border border-brand-line bg-brand-card p-7 shadow-[0_1px_3px_rgba(31,35,38,0.05)] sm:p-9">
            <h2 className="font-serif text-xl font-light tracking-[0.06em] text-brand-ink sm:text-2xl">{a.serviceTitle}</h2>
            <p className="mt-4 text-sm leading-relaxed text-brand-body sm:text-base">{a.serviceBody}</p>
          </article>
        </div>
      </PageShell>

      <PageShell className="border-t border-brand-primary/12 pb-16 pt-4 sm:pb-20">
        <div className="flex flex-col items-start justify-between gap-8 rounded-2xl border border-brand-line bg-brand-canvas/80 px-7 py-9 shadow-[0_1px_3px_rgba(31,35,38,0.04)] sm:flex-row sm:items-center sm:px-10 sm:py-10">
          <div className="max-w-xl space-y-3">
            <h2 className="font-serif text-xl font-light tracking-[0.06em] text-brand-ink sm:text-2xl">{a.locationTitle}</h2>
            <p className="text-sm leading-relaxed text-brand-body sm:text-base">{a.locationBody}</p>
          </div>
          <Link
            href="/contact"
            className={`inline-flex shrink-0 items-center justify-center rounded-full px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] ${brandBtnSecondary} sm:text-[11px]`}
          >
            {a.ctaLabel}
          </Link>
        </div>
      </PageShell>
    </div>
  );
}
