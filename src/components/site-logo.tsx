import Image from "next/image";
import Link from "next/link";

/**
 * SAKE Kunstlogo — nur Darstellung/Größe/Integration, keine inhaltliche Veränderung.
 * `imageSrc` z. B. `/sake-logo.png` (transparent oder mit dunklem Grund — siehe lightUiTone).
 */
type LogoVariant = "header" | "hero" | "footer" | "heroWatermark" | "aboutFeature" | "heroBand";

type SiteLogoProps = {
  className?: string;
  variant?: LogoVariant;
  onNavigate?: () => void;
  /** Standard: `/sake-logo.png` unter `public/` */
  imageSrc?: string;
  /**
   * - `original` — Pixel 1:1
   * - `subtleContrast` — leicht mehr Kontrast auf hellem Grund
   * - `markGold` — Integration auf hellem UI: Screen-Blend (kein Vollflächen-Recolor)
   * - `markWhite` — Wasserzeichen auf Fotos (Screen, dezent)
   */
  lightUiTone?: "original" | "subtleContrast" | "markGold" | "markWhite";
};

/** Kein Kasten, kein Badge, kein Hintergrund — nur das Bild. */
const shell: Record<LogoVariant, string> = {
  header:
    "inline-flex items-center justify-start bg-transparent py-0.5 pl-0 pr-2 sm:py-1 sm:pr-4 md:pr-5",
  hero: "inline-flex items-center justify-start bg-transparent py-1 pr-2 sm:pr-3",
  footer: "inline-flex items-center justify-center bg-transparent py-2",
  heroWatermark: "pointer-events-none flex w-full justify-center bg-transparent px-2 select-none",
  aboutFeature: "flex justify-center bg-transparent py-2",
  heroBand: "flex w-full justify-center bg-transparent px-5 sm:px-10 md:px-12"
};

const imgSize: Record<LogoVariant, string> = {
  header:
    "h-9 w-auto max-w-[min(200px,46vw)] sm:h-10 sm:max-w-[min(220px,40vw)] md:h-11 md:max-w-[min(240px,36vw)] lg:h-12",
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
  imageSrc = "/sake-logo.png",
  lightUiTone = "subtleContrast"
}: SiteLogoProps) {
  const isLink = variant !== "heroWatermark";
  const usesToneProp = toneVariants.includes(variant);
  const tone = usesToneProp ? lightUiTone : "original";
  const objectAlign =
    variant === "header" || variant === "hero" ? "object-left" : "object-center";

  const softShadow =
    variant === "header" || variant === "hero"
      ? tone === "markGold" || tone === "markWhite"
        ? ""
        : "drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      : "";

  const img = (
    <Image
      src={imageSrc}
      alt=""
      width={1024}
      height={1024}
      className={`${imgSize[variant]} bg-transparent object-contain ${objectAlign} ${toneClass[tone]} ${softShadow}`}
      priority={variant === "header" || variant === "hero"}
      sizes={
        variant === "header"
          ? "(max-width: 768px) 46vw, 240px"
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
