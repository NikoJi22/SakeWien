import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { SITE_LOGO_MARK_PATH } from "@/lib/site-logo-asset";
import "./globals.css";
import { LanguageProvider } from "@/context/language-context";
import { GiftConfigProvider } from "@/context/gift-config-context";
import { MenuDataProvider } from "@/context/menu-data-context";
import { OrderCartDrawerProvider } from "@/context/order-cart-drawer-context";
import { SiteContentProvider } from "@/context/site-content-context";
import { ConditionalNav } from "@/components/conditional-nav";
import { ConditionalMain } from "@/components/conditional-main";
import { ConditionalFooter } from "@/components/conditional-footer";
import { MobileLanguageSwitcher } from "@/components/mobile-language-switcher";

const fontSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-serif",
  display: "swap"
});

const fontSans = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Sake Vienna",
  description: "Modern Japanese restaurant website for Sake in Vienna.",
  icons: {
    icon: SITE_LOGO_MARK_PATH,
    apple: SITE_LOGO_MARK_PATH
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontSerif.variable} ${fontSans.variable}`}>
      <body className="font-sans">
        <LanguageProvider>
          <OrderCartDrawerProvider>
            <MenuDataProvider>
              <GiftConfigProvider>
                <SiteContentProvider>
                  <ConditionalNav />
                  <ConditionalMain>{children}</ConditionalMain>
                  <ConditionalFooter />
                  <MobileLanguageSwitcher />
                </SiteContentProvider>
              </GiftConfigProvider>
            </MenuDataProvider>
          </OrderCartDrawerProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
