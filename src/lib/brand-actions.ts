/**
 * Einheitliche Button- und Chip-Styles (Farben aus tailwind `brand.*`).
 * Primary/Secondary im bestehenden Blau-Grau-Farbsystem.
 */

/** Primäre CTAs im bestehenden Blau-Grau-Ton, keine Layout-Utilities */
export const brandBtnPrimary =
  "border-2 border-brand-primary bg-brand-primary text-[#FFFFFF] shadow-sm transition duration-200 hover:border-brand-primary-dark hover:bg-brand-primary-dark hover:shadow-md hover:shadow-brand-primary/22 disabled:cursor-not-allowed disabled:opacity-40";

export const brandBtnSecondary =
  "border-2 border-brand-primary bg-brand-card text-brand-ink shadow-sm transition duration-200 hover:border-brand-primary hover:bg-brand-surface-hover hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-40";

/** Filter- / Tab-Chips aktiv */
export const brandChipActive =
  "border border-brand-primary bg-brand-primary text-white shadow-sm shadow-brand-primary/15";

/** Filter- / Tab-Chips inaktiv */
export const brandChipInactive =
  "border border-brand-line bg-brand-canvas text-brand-primary transition-colors duration-200 hover:border-brand-line hover:bg-brand-surface-hover hover:text-brand-primary";
