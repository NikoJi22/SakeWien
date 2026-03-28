"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type OrderCartDrawerContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const OrderCartDrawerContext = createContext<OrderCartDrawerContextType | null>(null);

export function OrderCartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);
  const open = useCallback(() => setOpen(true), []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouch = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouch;
    };
  }, [isOpen]);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return <OrderCartDrawerContext.Provider value={value}>{children}</OrderCartDrawerContext.Provider>;
}

export function useOrderCartDrawer(): OrderCartDrawerContextType {
  const ctx = useContext(OrderCartDrawerContext);
  if (!ctx) {
    return {
      isOpen: false,
      open: () => {},
      close: () => {}
    };
  }
  return ctx;
}
