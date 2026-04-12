import Image from "next/image";
import Link from "next/link";
import { SITE_LOGO_MARK_PATH } from "@/lib/site-logo-asset";

/**
 * SAKE Markenlogo: statische PNG mit Alpha aus `public/` (kein Cloudinary, keine Transformation).
 */
type LogoVariant = "header" | "heroNav" | "hero" | "footer" | "heroWatermark" | "aboutFeature" | "heroBand";

type SiteLogoProps = {
  className?: string;
  variant?: LogoVariant;
  onNavigate?: () => void;
  /** Standard: `SITE_LOGO_MARK_PATH` aus `@/lib/site-logo-asset` */
  imageSrc?: string;
  /**
   * - `original` — PNG/Alpha 1:1, keine Filter (empfohlen für transparentes Logo)
   * - `subtleContrast` — leicht Kontrast/Sättigung (kann Anti-Alias-Ränder verändern)
   * - `markGold` / `markWhite` — nur Klassen-Hooks; kein Screen-Blend mehr
   */
  lightUiTone?: "original" | "subtleContrast" | "markGold" | "markWhite";
};

/** Kein Kasten, kein Badge, kein Hintergrund — nur das Bild. */
const shell: Record<LogoVariant, string> = {
  /** Unterseiten: kompakteres Logo in der festen Leiste */
  header:
    "inline-flex items-center justify-start bg-transparent py-1 pl-0 pr-2 sm:py-1 sm:pr-4 md:pr-5",
  /** Startseite (Hero-Pille): größeres Logo als im Interior-Header */
  heroNav: "inline-flex shrink-0 items-center justify-start bg-transparent py-0 pr-1.5 sm:pr-2",
  hero: "inline-flex items-center justify-start bg-transparent py-1 pr-2 sm:pr-3",
  footer: "inline-flex items-center justify-center bg-transparent py-2",
  heroWatermark: "pointer-events-none flex w-full justify-center bg-transparent px-2 select-none",
  aboutFeature: "flex justify-center bg-transparent py-2",
  heroBand: "flex w-full justify-center bg-transparent px-5 sm:px-10 md:px-12"
};

const imgSize: Record<LogoVariant, string> = {
  header:
    "h-10 w-auto max-w-[min(200px,48vw)] sm:h-11 sm:max-w-[min(220px,42vw)] md:h-12 md:max-w-[min(240px,36vw)] lg:h-[3.25rem] lg:max-w-[min(260px,32vw)]",
  heroNav:
    "h-12 w-auto max-w-[min(260px,58vw)] sm:h-14 sm:max-w-[min(300px,50vw)] md:h-16 md:max-w-[min(340px,44vw)] lg:h-[4.25rem] lg:max-w-[min(380px,40vw)]",
  hero: "h-[3.35rem] w-auto max-w-[min(320px,52vw)] sm:h-[4.1rem] sm:max-w-[min(380px,46vw)] md:h-[4.85rem] md:max-w-[min(420px,40vw)]",
  footer: "h-20 w-auto max-w-[min(320px,85vw)] sm:h-24 md:h-28",
  heroWatermark:
    "h-[min(56vw,380px)] w-auto max-w-[94%] opacity-[0.15] sm:h-[min(48vw,440px)] sm:opacity-[0.16] md:h-[min(42vw,480px)]",
  aboutFeature: "h-32 w-auto max-w-full sm:h-40 md:h-44",
  heroBand: "h-44 w-auto max-w-[min(92vw,28rem)] sm:h-52 md:h-60 lg:h-[17rem]"
};

const toneClass: Record<NonNullable<SiteLogoProps["lightUiTone"]>, string> = {
  original: "",
  subtleContrast: "contrast-[1.12] saturate-[1.06] [image-rendering:auto]",
  markGold: "sake-logo-on-light bg-transparent [image-rendering:auto]",
  markWhite: "sake-logo-hero-watermark bg-transparent [image-rendering:auto]"
};

const toneVariants: LogoVariant[] = [
  "header",
  "heroNav",
  "hero",
  "footer",
  "heroBand",
  "heroWatermark",
  "aboutFeature"
];

export function SiteLogo({
  className = "",
  variant = "header",
  onNavigate,
  imageSrc = SITE_LOGO_MARK_PATH,
  lightUiTone = "original"
}: SiteLogoProps) {
  const isLink = variant !== "heroWatermark";
  const usesToneProp = toneVariants.includes(variant);
  const tone = usesToneProp ? lightUiTone : "original";
  const objectAlign =
    variant === "header" || variant === "heroNav" || variant === "hero" ? "object-left" : "object-center";

  const img = (
    <Image
      src={imageSrc}
      alt=""
      width={1024}
      height={504}
      unoptimized
      placeholder="empty"
      className={`${imgSize[variant]} isolate bg-transparent [background:none] object-contain mix-blend-normal ${objectAlign} ${toneClass[tone]}`}
      style={{ backgroundColor: "transparent" }}
      priority={variant === "header" || variant === "heroNav" || variant === "hero"}
      sizes={
        variant === "header"
          ? "(max-width: 768px) 48vw, 260px"
          : variant === "heroNav"
            ? "(max-width: 768px) 58vw, 380px"
            : variant === "hero"
              ? "(max-width: 768px) 52vw, 420px"
              : variant === "heroWatermark" || variant === "aboutFeature" || variant === "heroBand"
                ? "(max-width: 768px) 92vw, 520px"
                : "200px"
      }
    />
  );

  if (!isLink) {
    return (
      <div className={`${shell[variant]} ${className}`} aria-hidden>
        {img}
      </div>
    );
  }

  return (
    <Link
      href="/"
      onClick={onNavigate}
      className={`${shell[variant]} ${className}`}
      aria-label="SAKE Vienna"
    >
      {img}
    </Link>
  );
}
