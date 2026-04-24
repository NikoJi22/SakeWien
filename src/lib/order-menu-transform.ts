import type { MenuCategory, MenuItem, OrderChoiceOption } from "@/lib/menu-types";

const PIECE_SUFFIX_DE_RE = /\s*\(\d+\s*Stk\.?\)\s*$/i;
const PIECE_SUFFIX_EN_RE = /\s*\(\d+\s*pcs?\.?\)\s*$/i;
const QUANTITY_SUFFIX_ID_RE = /-(\d{1,3})$/;

function cloneItem(item: MenuItem): MenuItem {
  return JSON.parse(JSON.stringify(item)) as MenuItem;
}

function extractQuantityFromId(id: string): number | null {
  const match = QUANTITY_SUFFIX_ID_RE.exec(id);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

function normalizeQuantityName(name: string, lang: "de" | "en"): string {
  return (lang === "de" ? name.replace(PIECE_SUFFIX_DE_RE, "") : name.replace(PIECE_SUFFIX_EN_RE, "")).trim();
}

function collapseQuantityVariants(items: MenuItem[]): MenuItem[] {
  const groups = new Map<string, MenuItem[]>();
  for (const item of items) {
    const qty = extractQuantityFromId(item.id);
    if (!qty) {
      groups.set(item.id, [item]);
      continue;
    }
    const baseId = item.id.replace(QUANTITY_SUFFIX_ID_RE, "");
    const list = groups.get(baseId) ?? [];
    list.push(item);
    groups.set(baseId, list);
  }

  const next: MenuItem[] = [];
  for (const [groupId, groupItems] of groups.entries()) {
    if (groupItems.length <= 1) {
      next.push(groupItems[0]!);
      continue;
    }

    const sorted = [...groupItems].sort((a, b) => (extractQuantityFromId(a.id) ?? 0) - (extractQuantityFromId(b.id) ?? 0));
    const base = cloneItem(sorted[0]!);
    base.id = groupId;
    base.name = {
      de: normalizeQuantityName(base.name.de, "de"),
      en: normalizeQuantityName(base.name.en, "en")
    };
    const options: OrderChoiceOption[] = sorted.map((item) => {
      const qty = extractQuantityFromId(item.id) ?? 0;
      return {
        id: `qty-${qty}`,
        name: {
          de: `${qty} Stk.`,
          en: `${qty} pcs`
        },
        priceEur: item.priceEur
      };
    });
    base.orderChoiceGroup = {
      label: { de: "Menge", en: "Quantity" },
      required: true,
      options
    };
    next.push(base);
  }

  return next;
}

function withWarmDishSideSelection(items: MenuItem[]): MenuItem[] {
  return items.map((item) => {
    const next = cloneItem(item);
    if (next.variants?.length) return next;
    if (next.orderChoiceGroup?.options?.length) {
      const group = next.orderChoiceGroup;
      const hasNoSide = group.options.some((opt) => opt.id === "side-none");
      const normalizedOptions = hasNoSide
        ? group.options
        : [
            {
              id: "side-none",
              name: { de: "Ohne Beilage", en: "Without side" },
              extraPriceEur: 0
            },
            ...group.options
          ];
      next.orderChoiceGroup = {
        ...group,
        required: true,
        priceMode: "surcharge",
        defaultOptionId: group.defaultOptionId ?? "side-none",
        options: normalizedOptions
      };
      return next;
    }
    next.orderChoiceGroup = {
      label: { de: "Beilage", en: "Side" },
      required: true,
      priceMode: "surcharge",
      defaultOptionId: "side-none",
      options: [
        { id: "side-none", name: { de: "Ohne Beilage", en: "Without side" }, extraPriceEur: 0 },
        { id: "side-rice", name: { de: "Jasminreis", en: "Jasmine rice" }, extraPriceEur: 2.5 },
        { id: "side-noodles", name: { de: "Gebratene Nudeln mit Gemüse", en: "Fried noodles with vegetables" }, extraPriceEur: 5.0 },
        { id: "side-egg-rice", name: { de: "Eierreis mit Gemüse", en: "Egg fried rice with vegetables" }, extraPriceEur: 5.0 }
      ]
    };
    return next;
  });
}

function splitUdonRamenCategory(category: MenuCategory): MenuCategory[] {
  if (category.id !== "udon-ramen") return [category];
  const ramenItems = category.items.filter((item) => item.id.startsWith("ramen-"));
  const udonItems = category.items.filter((item) => item.id.startsWith("udon-"));
  const build = (id: "ramen" | "udon", titleDe: string, titleEn: string, items: MenuItem[]): MenuCategory => ({
    id,
    title: { de: titleDe, en: titleEn },
    items
  });
  return [build("ramen", "Ramen", "Ramen", ramenItems), build("udon", "Udon", "Udon", udonItems)];
}

export function transformMenuForOrdering(categories: MenuCategory[]): MenuCategory[] {
  const expanded = categories.flatMap(splitUdonRamenCategory);
  return expanded
    .map((category) => {
      if (category.id === "maki-cat" || category.id === "sushi") {
        return { ...category, items: collapseQuantityVariants(category.items) };
      }
      if (category.id === "warm-dishes") {
        return { ...category, items: withWarmDishSideSelection(category.items) };
      }
      return category;
    })
    .filter((category) => category.items.length > 0)
    .filter((category, index, arr) => arr.findIndex((c) => c.id === category.id) === index);
}
