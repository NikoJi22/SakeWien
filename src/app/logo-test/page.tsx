import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logo-Alpha-Test",
  robots: { index: false, follow: false }
};

/** Nur natives img — gleiche URL wie Produktion; Root-Layout umschließt weiterhin (Fonts/Provider). */
export default function LogoTestPage() {
  /* eslint-disable-next-line @next/next/no-img-element -- Diagnose: absichtlich ohne next/image */
  return <img src="/sake-logo-mark.png?v=20260412" alt="logo" />;
}
