import type { MenuItem, OrderChoiceOption } from "@/lib/menu-types";

export type ItemSelectionGroup = {
  label: { de: string; en: string };
  required: boolean;
  priceMode: "absolute" | "surcharge";
  defaultOptionId?: string;
  options: OrderChoiceOption[];
};

export function getItemSelectionGroup(item: MenuItem): ItemSelectionGroup | null {
  if (Array.isArray(item.variants) && item.variants.length > 0) {
    return {
      label: { de: "Variante", en: "Variant" },
      required: true,
      priceMode: "absolute",
      options: item.variants.map((variant) => ({
        id: variant.id,
        name: variant.label,
        priceEur: variant.priceEur
      }))
    };
  }
  if (item.orderChoiceGroup?.options?.length) {
    return {
      label: item.orderChoiceGroup.label,
      required: !!item.orderChoiceGroup.required,
      priceMode: item.orderChoiceGroup.priceMode ?? "absolute",
      defaultOptionId: item.orderChoiceGroup.defaultOptionId,
      options: item.orderChoiceGroup.options
    };
  }
  return null;
}

export function findItemSelectionOption(item: MenuItem, optionId: string | null | undefined): OrderChoiceOption | undefined {
  if (!optionId) return undefined;
  return getItemSelectionGroup(item)?.options.find((opt) => opt.id === optionId);
}
