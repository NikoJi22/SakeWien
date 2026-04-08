/**
 * Einheitliche Button- und Chip-Styles (Farben aus tailwind `brand.*`).
 * Primary: Gold #C9A46C / Hover #B8925C · Secondary: Rahmen #465F6B, Hover-Fläche #F3F6F7
 */

/** Nur goldene CTAs: exakte Markenfarben, keine Layout-Utilities */
export const brandBtnPrimary =
  "border-2 border-[#C9A46C] bg-[#C9A46C] text-[#FFFFFF] shadow-sm transition duration-200 hover:border-[#B8925C] hover:bg-[#B8925C] hover:shadow-md hover:shadow-[#C9A46C]/22 disabled:cursor-not-allowed disabled:opacity-40";

export const brandBtnSecondary =
  "border-2 border-brand-primary bg-brand-card text-brand-ink shadow-sm transition duration-200 hover:border-brand-primary hover:bg-brand-surface-hover hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-40";

/** Filter- / Tab-Chips aktiv */
export const brandChipActive =
  "border border-brand-primary bg-brand-primary text-white shadow-sm shadow-brand-primary/15";

/** Filter- / Tab-Chips inaktiv */
export const brandChipInactive =
  "border border-brand-line bg-brand-canvas text-brand-primary transition-colors duration-200 hover:border-brand-line hover:bg-brand-surface-hover hover:text-brand-primary";
