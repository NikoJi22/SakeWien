"use client";

import Image from "next/image";
import Link from "next/link";

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Props = {
  href: string;
  label: string;
  imageSrc: string;
  imageAlt: string;
};

export function HeroSideCard({ href, label, imageSrc, imageAlt }: Props) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[128px] flex-1 basis-0 overflow-hidden rounded-[1.75rem] border border-white/[0.08] sm:min-h-[148px] lg:min-h-0"
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
        sizes="(max-width: 1024px) 100vw, 30vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent transition group-hover:from-black/80" />
      <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-black/85 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/95 backdrop-blur-sm transition group-hover:bg-black">
        {label}
        <ArrowIcon />
      </span>
    </Link>
  );
}
