"use client";

import { CartProvider } from "@/context/cart-context";
import { OrderPageContent } from "@/components/order/order-page-content";

export default function OrderOnlinePage() {
  return (
    <CartProvider>
      <OrderPageContent />
    </CartProvider>
  );
}
