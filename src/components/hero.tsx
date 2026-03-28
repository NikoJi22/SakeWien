"use client";

import Image from "next/image";
import { useLanguage } from "@/context/language-context";
import { HeroFloatingNav } from "./hero-floating-nav";
import { HeroSideCard } from "./hero-side-card";
import { HeroSocial } from "./hero-social";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=2200&q=85";

const SIDE_IMAGES = [
  {
    href: "/menu",
    key: "menu",
    imageSrc: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Chef with sushi platter",
    labelKey: "cardMenu"
  },
  {
    href: "/menu/new",
    key: "new-dishes",
    imageSrc:
      "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Sashimi platter",
    labelKey: "cardNewDishes"
  },
  {
    href: "/about",
    key: "about-us",
    imageSrc: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Restaurant interior",
    labelKey: "cardAboutUs"
  }
] as const;

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative mx-auto w-full max-w-[min(100%,2000px)] px-2 pb-4 pt-3 sm:px-4 sm:pb-6 sm:pt-4 lg:px-6 lg:pb-8 lg:pt-6">
      <div
        className="noise-overlay pointer-events-none absolute inset-1 rounded-[1.5rem] opacity-40 sm:inset-2 sm:rounded-[2rem] lg:inset-3 lg:rounded-[2.25rem]"
        aria-hidden
      />

      <div className="relative flex min-h-[min(94vh,920px)] flex-col gap-3 sm:gap-4 lg:min-h-[min(92vh,900px)] lg:flex-row lg:items-stretch lg:gap-4 xl:gap-5">
        {/* Main hero ~70% */}
        <div className="relative min-h-[440px] flex-[1.08] overflow-hidden rounded-[1.75rem] border border-white/[0.07] sm:min-h-[500px] sm:rounded-[2rem] lg:min-h-0">
          <Image
            src={HERO_IMAGE}
            alt="Sashimi and sushi platter"
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 1024px) 100vw, 72vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/55 via-neutral-900/15 to-neutral-900/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/35 via-transparent to-transparent" />

          <div className="absolute left-0 right-0 top-3 z-20 flex justify-center px-3 sm:top-6 sm:px-8 md:top-8 md:px-10">
            <HeroFloatingNav />
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col justify-end gap-8 p-6 sm:p-10 md:flex-row md:items-end md:justify-between md:p-12">
            <h1 className="max-w-[90%] font-serif text-[clamp(2.5rem,8vw,5.5rem)] font-light leading-[0.95] tracking-[0.06em] text-[#ebe3d6] sm:max-w-xl">
              {t.hero.title.toUpperCase()}
            </h1>
            <div className="shrink-0 self-end md:self-auto">
              <HeroSocial />
            </div>
          </div>
        </div>

        {/* Side column ~30% */}
        <div className="flex min-h-[400px] flex-[0.36] flex-col gap-2.5 sm:min-h-[440px] sm:gap-3 lg:min-h-0 lg:max-w-none lg:flex-[0.34]">
          {SIDE_IMAGES.map((item) => (
            <HeroSideCard
              key={item.key}
              href={item.href}
              imageSrc={item.imageSrc}
              imageAlt={item.imageAlt}
              label={t.hero[item.labelKey]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
