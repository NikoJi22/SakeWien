import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/language-context";
import { OrderCartDrawerProvider } from "@/context/order-cart-drawer-context";
import { ConditionalNav } from "@/components/conditional-nav";
import { ConditionalFooter } from "@/components/conditional-footer";

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
  description: "Modern Japanese restaurant website for Sake in Vienna."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontSerif.variable} ${fontSans.variable}`}>
      <body className="font-sans">
        <LanguageProvider>
          <OrderCartDrawerProvider>
            <ConditionalNav />
            <main className="min-h-screen">{children}</main>
            <ConditionalFooter />
          </OrderCartDrawerProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
