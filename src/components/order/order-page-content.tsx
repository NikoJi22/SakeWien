"use client";

import { menuCategories } from "@/lib/menu-data";
import { useLanguage } from "@/context/language-context";
import { PageHeader } from "@/components/page-header";
import { OrderMenuItem } from "./order-menu-item";
import { OrderCheckout } from "./order-checkout";
import { OrderMobileBar } from "./order-mobile-bar";
import { OrderCartDrawer } from "./order-cart-drawer";

export function OrderPageContent() {
  const { language, t } = useLanguage();

  return (
    <div className="pb-28 lg:pb-12">
      <PageHeader title={t.page.orderTitle} subtitle={t.page.orderText} />

      <div className="mx-auto flex w-full max-w-[min(100%,1200px)] flex-col gap-10 px-4 py-10 sm:px-8 sm:py-12 lg:grid lg:grid-cols-[1fr_min(400px,36%)] lg:items-start lg:gap-12 lg:py-14">
        <div className="min-w-0 space-y-14">
          {menuCategories
            .filter((category) => category.items.length > 0)
            .map((category) => (
              <section key={category.id} id={category.id} className="scroll-mt-28">
                <h2 className="mb-6 border-b border-white/[0.06] pb-3 font-serif text-xl font-light uppercase tracking-[0.14em] text-gold sm:text-2xl">
                  {category.title[language]}
                </h2>
                <div className="space-y-4">
                  {category.items.map((item) => (
                    <OrderMenuItem key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ))}
        </div>

        {/* Desktop: sticky column with bounded height — whole order panel scrolls inside (not the page column). */}
        <aside className="hidden min-h-0 lg:sticky lg:top-28 lg:block lg:max-h-[calc(100vh-7rem)] lg:w-full lg:overflow-y-auto lg:overscroll-contain lg:self-start">
          <OrderCheckout variant="sidebar" />
        </aside>
      </div>

      <OrderCartDrawer />
      <OrderMobileBar />
    </div>
  );
}
