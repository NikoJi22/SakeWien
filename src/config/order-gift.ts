/**
 * Bonus gift when cart subtotal reaches threshold (EUR).
 * Edit values here only — no code changes needed.
 */
export const orderGiftConfig = {
  /** Minimum order value in euros (number, e.g. 45.5) */
  thresholdEur: 45,
  /** Shown to guests when subtotal >= thresholdEur */
  message: {
    en: "You unlocked a complimentary miso soup with your order.",
    de: "Sie erhalten eine kostenlose Misosuppe zu Ihrer Bestellung."
  }
} as const;
