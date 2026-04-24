import type { MenuCategory, MenuItem, ReusableOptionGroup } from "@/lib/menu-types";

export function resolveReusableOptionGroupsForDish(
  item: MenuItem,
  categoryId: string,
  groups: ReusableOptionGroup[]
): ReusableOptionGroup[] {
  const disabled = new Set(item.disabledCategoryOptionGroupIds ?? []);
  const added = new Set(item.optionGroupIds ?? []);
  return groups.filter((g) => {
    if (disabled.has(g.id)) return false;
    if (added.has(g.id)) return true;
    if (g.linkedDishIds?.includes(item.id)) return true;
    if (g.linkedCategoryIds?.includes(categoryId)) return true;
    return false;
  });
}

export function optionSelectionExtraEur(
  groups: ReusableOptionGroup[],
  selections: Record<string, string[]>
): number {
  let total = 0;
  for (const g of groups) {
    const selected = selections[g.id] ?? [];
    for (const optionId of selected) {
      const opt = g.options.find((o) => o.id === optionId);
      total += typeof opt?.extraPriceEur === "number" ? opt.extraPriceEur : 0;
    }
  }
  return total;
}

export function validateOptionGroupSelections(
  groups: ReusableOptionGroup[],
  selections: Record<string, string[]>
): boolean {
  for (const g of groups) {
    const selected = selections[g.id] ?? [];
    const count = selected.length;
    const min = Math.max(0, g.minSelections ?? (g.required ? 1 : 0));
    const max = Math.max(min, g.maxSelections ?? (g.selectionType === "single" ? 1 : g.options.length));
    if (count < min || count > max) return false;
    if (g.selectionType === "single" && count > 1) return false;
  }
  return true;
}

export function findCategoryByItemId(categories: MenuCategory[], itemId: string): MenuCategory | undefined {
  return categories.find((c) => c.items.some((i) => i.id === itemId));
}
