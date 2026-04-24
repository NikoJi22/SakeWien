import type { MenuItem, OrderChoiceOption } from "@/lib/menu-types";

export type ItemSelectionGroup = {
  label: { de: string; en: string };
  required: boolean;
  options: OrderChoiceOption[];
};

export function getItemSelectionGroup(item: MenuItem): ItemSelectionGroup | null {
  if (Array.isArray(item.variants) && item.variants.length > 0) {
    return {
      label: { de: "Variante", en: "Variant" },
      required: true,
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
      options: item.orderChoiceGroup.options
    };
  }
  return null;
}

export function findItemSelectionOption(item: MenuItem, optionId: string | null | undefined): OrderChoiceOption | undefined {
  if (!optionId) return undefined;
  return getItemSelectionGroup(item)?.options.find((opt) => opt.id === optionId);
}
