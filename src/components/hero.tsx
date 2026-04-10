"use client";

import Image from "next/image";
import { useLanguage } from "@/context/language-context";
import { useSiteContent } from "@/context/site-content-context";
import { HeroFloatingNav } from "./hero-floating-nav";
import { HeroSideCard } from "./hero-side-card";
import { HeroSocial } from "./hero-social";

export function Hero() {
  const { t, language } = useLanguage();
  const { siteContent } = useSiteContent();
  const sideImages = [
    {
      href: "/order-online",
      key: "order",
      imageSrc: siteContent.cards.order.image,
      imageAlt: "Order online card image",
      label: siteContent.cards.order.label[language] || t.hero.cardOrder
    },
    {
      href: "/reservation",
      key: "book-table",
      imageSrc: siteContent.cards.reservation.image,
      imageAlt: "Reservation card image",
      label: siteContent.cards.reservation.label[language] || t.hero.cardReservation
    },
    {
      href: "/about",
      key: "about-us",
      imageSrc: siteContent.cards.about.image,
      imageAlt: "About us card image",
      label: siteContent.cards.about.label[language] || t.hero.cardAboutUs
    }
  ] as const;

  return (
    <section className="relative flex min-h-screen w-full max-w-none flex-col bg-brand-page px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-4">
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          className="noise-overlay pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-35 sm:rounded-[1.5rem] lg:rounded-[1.75rem]"
          aria-hidden
        />

        {/* Füllt die Section-Höhe (min-h-screen), kein künstlicher Streifen unter dem Hero:
            Desktop: eine Zeile 9+3, volle Höhe; Mobil: großes Bild flexibel, Karten darunter. */}
        <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
          <div className="relative grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(280px,1fr)_auto] gap-2 sm:grid-rows-[minmax(300px,1fr)_auto] sm:gap-3 lg:grid-cols-12 lg:grid-rows-1 lg:items-stretch lg:gap-3 xl:gap-4">
            <div className="relative min-h-0 overflow-hidden rounded-[1.25rem] border border-white/[0.08] shadow-sm sm:rounded-[1.75rem] lg:col-span-9">
              <Image
                src={siteContent.hero.mainImage}
                alt="Sashimi and sushi platter"
                fill
                className="object-cover object-center"
                priority
                sizes="(max-width: 1024px) 100vw, 75vw"
              />
              <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[rgba(31,35,38,0.28)] via-[rgba(70,95,107,0.1)] to-[rgba(70,95,107,0.14)]" />
              <div className="absolute inset-0 z-[2] bg-gradient-to-r from-[rgba(70,95,107,0.18)] via-transparent to-transparent" />

              <div className="absolute left-0 right-0 top-3 z-30 flex justify-center px-3 sm:top-6 sm:px-8 md:top-8 md:px-10">
                <HeroFloatingNav />
              </div>

              <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col justify-end gap-8 p-6 sm:p-10 md:flex-row md:items-end md:justify-between md:p-12">
                <h1 className="max-w-[90%] font-serif text-[clamp(2.5rem,8vw,5.5rem)] font-light leading-[0.95] tracking-[0.06em] text-[#ebe3d6] sm:max-w-xl">
                  {(siteContent.hero.title[language] || t.hero.title).toUpperCase()}
                </h1>
                <div className="shrink-0 self-end md:self-auto">
                  <HeroSocial />
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col gap-2 sm:gap-2.5 lg:col-span-3 lg:h-full lg:min-h-0">
              {sideImages.map((item) => (
                <HeroSideCard
                  key={item.key}
                  href={item.href}
                  imageSrc={item.imageSrc}
                  imageAlt={item.imageAlt}
                  label={item.label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
