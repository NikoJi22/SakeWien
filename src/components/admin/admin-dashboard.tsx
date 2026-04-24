"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import type { GiftConfig, MenuCategory, MenuItem, MenuItemVariant, SiteContentConfig } from "@/lib/menu-types";
import type { ReusableOptionGroup } from "@/lib/menu-types";
import { ALLERGEN_CODES_ORDER, normalizeAllergenCodes } from "@/lib/allergen-codes";
import { LUNCH_STARTER_CHOICE } from "@/lib/menu-data";
import { LUNCH_CATEGORY_ID } from "@/lib/order-config";
import { DEFAULT_DISH_PLACEHOLDER_IMAGE } from "@/lib/dish-image";
import { normalizeGiftConfig } from "@/lib/gift-config";
import { defaultSiteContent } from "@/lib/site-content-default";
import { normalizeSiteContentConfig } from "@/lib/site-content";
import { AdminField, adminInputClass, adminSelectClass, adminTextareaClass } from "./admin-field";
import { DishImageField } from "./dish-image-field";
import { AdminOptionGroups } from "./admin-option-groups";

const LS_NEW_DISH_AT_TOP = "sake-vienna-admin-new-dish-at-top";
const DRAG_PAYLOAD_TYPE = "application/x-sake-menu-item";
const CATEGORY_DRAG_PAYLOAD_TYPE = "application/x-sake-menu-category";
const AUTOSAVE_DELAY_MS = 8000;
const ALWAYS_VISIBLE_ADMIN_CATEGORY_IDS = ["lunch", "maki-cat", "sushi", "warm-dishes"] as const;
const ALWAYS_VISIBLE_ADMIN_CATEGORY_SET = new Set<string>(ALWAYS_VISIBLE_ADMIN_CATEGORY_IDS);

function cloneMenu(c: MenuCategory[]): MenuCategory[] {
  return JSON.parse(JSON.stringify(c)) as MenuCategory[];
}

/** Shallow-copy one category (for title edits — avoids full-menu JSON clone per keystroke). */
function replaceCategoryAt(
  prev: MenuCategory[],
  catIndex: number,
  mapCat: (c: MenuCategory) => MenuCategory
): MenuCategory[] {
  const cat = prev[catIndex];
  if (!cat) return prev;
  const mapped = mapCat(cat);
  if (mapped === cat) return prev;
  const next = [...prev];
  next[catIndex] = mapped;
  return next;
}

/** Shallow-copy path to one dish (avoids full-menu `cloneMenu` on every field change). */
function replaceItemAt(
  prev: MenuCategory[],
  catIndex: number,
  itemIndex: number,
  mapItem: (item: MenuItem) => MenuItem
): MenuCategory[] {
  const cat = prev[catIndex];
  if (!cat) return prev;
  const item = cat.items[itemIndex];
  if (!item) return prev;
  const newItem = mapItem(item);
  if (newItem === item) return prev;
  const nextItems = [...cat.items];
  nextItems[itemIndex] = newItem;
  const nextCats = [...prev];
  nextCats[catIndex] = { ...cat, items: nextItems };
  return nextCats;
}

/** Insert `fromIndex` before `beforeIndex` (0…n, where n = append at end). Indices refer to the array before the move. */
function reorderItemsByBeforeIndex(items: MenuItem[], fromIndex: number, beforeIndex: number): MenuItem[] {
  const n = items.length;
  if (fromIndex < 0 || fromIndex >= n || beforeIndex < 0 || beforeIndex > n) return items;
  if (beforeIndex === fromIndex) return items;
  const copy = [...items];
  const [removed] = copy.splice(fromIndex, 1);
  let insertAt = beforeIndex;
  if (fromIndex < beforeIndex) insertAt = beforeIndex - 1;
  copy.splice(insertAt, 0, removed);
  return copy;
}

function reorderCategoriesByBeforeIndex(list: MenuCategory[], fromIndex: number, beforeIndex: number): MenuCategory[] {
  const n = list.length;
  if (fromIndex < 0 || fromIndex >= n || beforeIndex < 0 || beforeIndex > n) return list;
  if (beforeIndex === fromIndex) return list;
  const copy = [...list];
  const [removed] = copy.splice(fromIndex, 1);
  let insertAt = beforeIndex;
  if (fromIndex < beforeIndex) insertAt = beforeIndex - 1;
  copy.splice(insertAt, 0, removed);
  return copy;
}

function emptyDish(): MenuItem {
  return {
    id: `dish-${crypto.randomUUID().slice(0, 10)}`,
    name: { de: "Neues Gericht", en: "New dish" },
    description: { de: "", en: "" },
    priceEur: 0,
    image: DEFAULT_DISH_PLACEHOLDER_IMAGE,
    allergens: [],
    isNew: false,
    isBestseller: false,
    isSpecialDeal: false,
    isSoldOut: false,
    vegetarian: false,
    vegan: false,
    spicyLevel: 0
  };
}

function categoryMatchesSearch(cat: MenuCategory, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  if (cat.title.de.toLowerCase().includes(s) || cat.title.en.toLowerCase().includes(s) || cat.id.toLowerCase().includes(s)) {
    return true;
  }
  return cat.items.some(
    (item) =>
      item.name.de.toLowerCase().includes(s) ||
      item.name.en.toLowerCase().includes(s) ||
      item.id.toLowerCase().includes(s)
  );
}

function itemMatchesSearch(item: MenuItem, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  return (
    item.name.de.toLowerCase().includes(s) ||
    item.name.en.toLowerCase().includes(s) ||
    item.id.toLowerCase().includes(s)
  );
}

/** Admin price inputs: allow empty while typing; validate on blur/save. */
function parseAdminPriceEur(raw: string): number | "empty" | "invalid" {
  const t = raw.trim().replace(",", ".");
  if (t === "") return "empty";
  const n = parseFloat(t);
  if (!Number.isFinite(n) || n < 0) return "invalid";
  return n;
}

export function AdminDashboard() {
  const router = useRouter();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [gift, setGift] = useState<GiftConfig>(() => normalizeGiftConfig({}));
  const [siteContent, setSiteContent] = useState<SiteContentConfig>(defaultSiteContent);
  const [loadError, setLoadError] = useState("");
  const [menuStatus, setMenuStatus] = useState("");
  const [giftStatus, setGiftStatus] = useState("");
  const [siteStatus, setSiteStatus] = useState("");
  const [savingMenu, setSavingMenu] = useState(false);
  const [savingGift, setSavingGift] = useState(false);
  const [savingSite, setSavingSite] = useState(false);
  const [search, setSearch] = useState("");
  const [adminTab, setAdminTab] = useState<"overview" | "option-groups">("overview");
  const [optionGroups, setOptionGroups] = useState<ReusableOptionGroup[]>([]);
  /** Category id → expanded (default collapsed = less scrolling) */
  const [expandedCat, setExpandedCat] = useState<Record<string, boolean>>({});
  /** New dishes: insert at top of category (stored locally in the browser). */
  const [newDishAtTop, setNewDishAtTop] = useState(false);
  const [dragging, setDragging] = useState<{ catIndex: number; itemIndex: number } | null>(null);
  const [dragOverBefore, setDragOverBefore] = useState<{ catIndex: number; beforeIndex: number } | null>(null);
  const [draggingCategoryIndex, setDraggingCategoryIndex] = useState<number | null>(null);
  const [dragOverCategoryBeforeIndex, setDragOverCategoryBeforeIndex] = useState<number | null>(null);
  const [dishPriceDraft, setDishPriceDraft] = useState<Record<string, string>>({});
  /** Ignore stale `load()` results (parallel fetches / responses finishing after a save). */
  const loadRequestId = useRef(0);
  /** Avoid auto-save before first successful data hydration. */
  const hydratedRef = useRef(true);
  const menuSigRef = useRef("");
  const giftSigRef = useRef("");
  const siteSigRef = useRef("");

  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;
  const dishPriceDraftRef = useRef(dishPriceDraft);
  dishPriceDraftRef.current = dishPriceDraft;
  const giftRef = useRef(gift);
  giftRef.current = gift;
  const siteContentRef = useRef(siteContent);
  siteContentRef.current = siteContent;
  const hasDishPriceDraft = useMemo(
    () => Object.values(dishPriceDraft).some((v) => v.trim().length > 0),
    [dishPriceDraft]
  );

  useEffect(() => {
    try {
      setNewDishAtTop(localStorage.getItem(LS_NEW_DISH_AT_TOP) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/admin/option-groups", { cache: "no-store", credentials: "same-origin" });
        if (!res.ok) return;
        const data = (await res.json()) as ReusableOptionGroup[];
        setOptionGroups(Array.isArray(data) ? data : []);
      } catch {
        /* ignore */
      }
    };
    void run();
  }, []);

  const setNewDishAtTopPref = useCallback((atTop: boolean) => {
    setNewDishAtTop(atTop);
    try {
      localStorage.setItem(LS_NEW_DISH_AT_TOP, atTop ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const load = useCallback(async () => {
    const thisId = ++loadRequestId.current;
    setLoadError("");
    try {
      const [menuRes, giftRes, siteRes] = await Promise.all([
        /** Volle Karte inkl. Mittagsmenü — gleiche Daten wie öffentliches `/api/menu`. */
        fetch("/api/admin/menu", { cache: "no-store", credentials: "same-origin" }),
        fetch("/api/gift", { cache: "no-store" }),
        fetch("/api/site-content", { cache: "no-store" })
      ]);
      if (thisId !== loadRequestId.current) return;
      if (!menuRes.ok) throw new Error("Menu load failed");
      const menuData = (await menuRes.json()) as MenuCategory[];
      const list = cloneMenu(Array.isArray(menuData) ? menuData : []);
      if (thisId !== loadRequestId.current) return;
      setCategories(list);
      setExpandedCat((prev) => {
        const next = { ...prev };
        for (const catId of ALWAYS_VISIBLE_ADMIN_CATEGORY_IDS) {
          if (list.some((c) => c.id === catId)) next[catId] = true;
        }
        return next;
      });
      if (giftRes.ok) {
        const g = (await giftRes.json()) as GiftConfig;
        if (thisId !== loadRequestId.current) return;
        const normalizedGift = normalizeGiftConfig(g);
        setGift(normalizedGift);
      }
      if (siteRes.ok) {
        const raw = (await siteRes.json()) as unknown;
        if (thisId !== loadRequestId.current) return;
        if (raw && typeof raw === "object" && !("error" in (raw as object))) {
          setSiteContent(normalizeSiteContentConfig(raw as SiteContentConfig));
        }
      }
      hydratedRef.current = true;
    } catch {
      if (thisId !== loadRequestId.current) return;
      setLoadError("Could not load data.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredEntries = useMemo(
    () =>
      categories
        .map((cat, ci) => ({ cat, ci }))
        .filter(
          ({ cat }) =>
            ALWAYS_VISIBLE_ADMIN_CATEGORY_SET.has(cat.id) || categoryMatchesSearch(cat, search)
        ),
    [categories, search]
  );

  const giftSelectableItems = useMemo(
    () =>
      categories.flatMap((category) =>
        category.items.map((item) => ({
          id: item.id,
          nameDe: item.name.de || item.name.en || item.id,
          categoryDe: category.title.de || category.title.en || category.id
        }))
      ),
    [categories]
  );

  const toggleCat = useCallback((id: string) => {
    setExpandedCat((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const expandAll = useCallback(() => {
    const next: Record<string, boolean> = {};
    categories.forEach((c) => {
      next[c.id] = true;
    });
    setExpandedCat(next);
  }, [categories]);

  const collapseAll = useCallback(() => {
    setExpandedCat({});
  }, []);

  const goToGift = useCallback(() => {
    document.getElementById("admin-gift")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const goToSite = useCallback(() => {
    document.getElementById("admin-site-content")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const goToCategory = useCallback((id: string) => {
    setExpandedCat((prev) => ({ ...prev, [id]: true }));
    requestAnimationFrame(() => {
      document.getElementById(`admin-cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const saveMenu = useCallback(async (mode: "manual" | "auto" = "manual") => {
    setMenuStatus("");
    setSavingMenu(true);
    try {
      const categoriesSnap = categoriesRef.current;
      const draftSnap = dishPriceDraftRef.current;
      const nextMenu = cloneMenu(categoriesSnap);
      for (const cat of nextMenu) {
        for (const item of cat.items) {
          const draft = draftSnap[item.id];
          if (draft === undefined) continue;
          const p = parseAdminPriceEur(draft);
          if (p === "empty") {
            if (mode === "manual") setMenuStatus("Bitte alle Preisfelder ausfüllen.");
            setSavingMenu(false);
            return;
          }
          if (p === "invalid") {
            if (mode === "manual") setMenuStatus("Ungültiger Preis bei einem Gericht.");
            setSavingMenu(false);
            return;
          }
          item.priceEur = p;
        }
      }
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextMenu)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 400) {
          if (mode === "manual") {
            setMenuStatus(typeof data.error === "string" ? `Validierungsfehler: ${data.error}` : "Validierungsfehler.");
          }
        } else if (res.status === 401) {
          if (mode === "manual") setMenuStatus("Nicht autorisiert. Bitte neu einloggen.");
        } else if (res.status >= 500) {
          if (mode === "manual") {
            setMenuStatus(typeof data.error === "string" ? `Schreibfehler: ${data.error}` : "Schreibfehler auf dem Server.");
          }
        } else {
          if (mode === "manual") setMenuStatus(typeof data.error === "string" ? data.error : "Save failed");
        }
        return;
      }
      loadRequestId.current += 1;
      setCategories(nextMenu);
      setDishPriceDraft({});
      menuSigRef.current = JSON.stringify(nextMenu);
      setMenuStatus(mode === "auto" ? "Auto-saved menu." : "Menu saved.");
      window.dispatchEvent(new Event("sake-menu-updated"));
    } catch (error) {
      console.error("[admin] Save menu network error", error);
      if (mode === "manual") setMenuStatus("Netzwerkfehler beim Speichern.");
    } finally {
      setSavingMenu(false);
    }
  }, []);

  const saveGift = useCallback(async (mode: "manual" | "auto" = "manual") => {
    setGiftStatus("");
    const payload = normalizeGiftConfig(giftRef.current);
    if (mode === "manual" && payload.tier2ThresholdEur < payload.tier1ThresholdEur) {
      setGiftStatus("Die zweite Schwelle sollte nicht unter der ersten liegen.");
      return;
    }
    setSavingGift(true);
    try {
      const res = await fetch("/api/admin/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (mode === "manual") setGiftStatus(typeof data.error === "string" ? data.error : "Save failed");
        return;
      }
      loadRequestId.current += 1;
      setGift(payload);
      giftSigRef.current = JSON.stringify(payload);
      setGiftStatus(mode === "auto" ? "Auto-saved gift settings." : "Gift settings saved.");
      window.dispatchEvent(new Event("sake-gift-updated"));
    } finally {
      setSavingGift(false);
    }
  }, []);

  const saveSiteContent = useCallback(async (mode: "manual" | "auto" = "manual") => {
    setSiteStatus("");
    setSavingSite(true);
    try {
      const normalized = normalizeSiteContentConfig(siteContentRef.current);
      const res = await fetch("/api/admin/site-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalized)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (mode === "manual") setSiteStatus(typeof data.error === "string" ? data.error : "Save failed");
        return;
      }
      loadRequestId.current += 1;
      setSiteContent(normalized);
      siteSigRef.current = JSON.stringify(normalized);
      setSiteStatus(mode === "auto" ? "Auto-saved website content." : "Website content saved.");
    } finally {
      setSavingSite(false);
    }
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    menuSigRef.current = JSON.stringify(categories);
    giftSigRef.current = JSON.stringify(gift);
    siteSigRef.current = JSON.stringify(siteContent);
    hydratedRef.current = false;
  }, [categories, gift, siteContent]);

  useEffect(() => {
    if (hydratedRef.current || savingMenu || hasDishPriceDraft) return;
    const t = window.setTimeout(() => {
      const sig = JSON.stringify(categoriesRef.current);
      if (sig === menuSigRef.current) return;
      void saveMenu("auto");
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [categories, hasDishPriceDraft, saveMenu, savingMenu]);

  useEffect(() => {
    if (hydratedRef.current || savingGift) return;
    const t = window.setTimeout(() => {
      const sig = JSON.stringify(giftRef.current);
      if (sig === giftSigRef.current) return;
      void saveGift("auto");
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [gift, saveGift, savingGift]);

  useEffect(() => {
    if (hydratedRef.current || savingSite) return;
    const t = window.setTimeout(() => {
      const sig = JSON.stringify(siteContentRef.current);
      if (sig === siteSigRef.current) return;
      void saveSiteContent("auto");
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [siteContent, saveSiteContent, savingSite]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function updateItem(catIndex: number, itemIndex: number, patch: Partial<Pick<MenuItem, "name" | "description">>) {
    setCategories((prev) =>
      replaceItemAt(prev, catIndex, itemIndex, (item) => ({
        ...item,
        name: patch.name ? { ...item.name, ...patch.name } : item.name,
        description: patch.description ? { ...item.description, ...patch.description } : item.description
      }))
    );
  }

  function setItemField(catIndex: number, itemIndex: number, key: keyof MenuItem, value: unknown) {
    setCategories((prev) =>
      replaceItemAt(prev, catIndex, itemIndex, (item) => ({ ...item, [key]: value }) as MenuItem)
    );
  }

  function toggleItemAllergen(catIndex: number, itemIndex: number, code: string) {
    setCategories((prev) =>
      replaceItemAt(prev, catIndex, itemIndex, (item) => {
        const cur = new Set(normalizeAllergenCodes(item.allergens));
        const u = code.toUpperCase();
        if (cur.has(u)) cur.delete(u);
        else cur.add(u);
        return { ...item, allergens: normalizeAllergenCodes([...cur]) };
      })
    );
  }

  function deleteItem(catIndex: number, itemIndex: number) {
    if (!confirm("Delete this dish?")) return;
    setCategories((prev) => {
      const next = cloneMenu(prev);
      next[catIndex].items.splice(itemIndex, 1);
      return next;
    });
  }

  function addItem(catIndex: number) {
    setCategories((prev) => {
      const next = cloneMenu(prev);
      const dish = emptyDish();
      if (newDishAtTop) next[catIndex].items.unshift(dish);
      else next[catIndex].items.push(dish);
      return next;
    });
    const id = categories[catIndex]?.id;
    if (id) setExpandedCat((p) => ({ ...p, [id]: true }));
  }

  function addItemAfter(catIndex: number, afterItemIndex: number) {
    setCategories((prev) => {
      const next = cloneMenu(prev);
      const dish = emptyDish();
      next[catIndex].items.splice(afterItemIndex + 1, 0, dish);
      return next;
    });
    const id = categories[catIndex]?.id;
    if (id) setExpandedCat((p) => ({ ...p, [id]: true }));
  }

  function addCategory() {
    const id = `cat-${crypto.randomUUID().slice(0, 8)}`;
    setCategories((prev) => [...cloneMenu(prev), { id, title: { de: "Neue Kategorie", en: "New category" }, items: [] }]);
    setExpandedCat((p) => ({ ...p, [id]: true }));
    window.setTimeout(() => goToCategory(id), 80);
  }

  function deleteCategory(catIndex: number) {
    if (!confirm("Delete this category and all its dishes?")) return;
    setCategories((prev) => {
      const next = cloneMenu(prev);
      next.splice(catIndex, 1);
      return next;
    });
  }

  function moveItem(fromCat: number, itemIndex: number, toCatId: string) {
    setCategories((prev) => {
      const next = cloneMenu(prev);
      const item = next[fromCat].items[itemIndex];
      if (!item) return prev;
      const toIdx = next.findIndex((c) => c.id === toCatId);
      if (toIdx < 0 || toIdx === fromCat) return prev;
      next[fromCat].items.splice(itemIndex, 1);
      if (newDishAtTop) next[toIdx].items.unshift(item);
      else next[toIdx].items.push(item);
      return next;
    });
  }

  function reorderItemsInCategory(catIndex: number, fromIndex: number, beforeIndex: number) {
    setCategories((prev) => {
      const next = cloneMenu(prev);
      const items = next[catIndex]?.items;
      if (!items) return prev;
      next[catIndex].items = reorderItemsByBeforeIndex(items, fromIndex, beforeIndex);
      return next;
    });
  }

  function reorderCategories(fromIndex: number, beforeIndex: number) {
    setCategories((prev) => reorderCategoriesByBeforeIndex(prev, fromIndex, beforeIndex));
  }

  function moveCategoryUp(catIndex: number) {
    if (catIndex <= 0) return;
    reorderCategories(catIndex, catIndex - 1);
  }

  function moveCategoryDown(catIndex: number) {
    if (catIndex >= categories.length - 1) return;
    reorderCategories(catIndex, catIndex + 2);
  }

  function moveItemUp(catIndex: number, itemIndex: number) {
    if (itemIndex <= 0) return;
    reorderItemsInCategory(catIndex, itemIndex, itemIndex - 1);
  }

  function moveItemDown(catIndex: number, itemIndex: number) {
    const len = categories[catIndex]?.items.length ?? 0;
    if (itemIndex >= len - 1) return;
    reorderItemsInCategory(catIndex, itemIndex, itemIndex + 2);
  }

  function parseDragPayload(e: DragEvent): { catIndex: number; itemIndex: number } | null {
    try {
      const raw = e.dataTransfer.getData(DRAG_PAYLOAD_TYPE);
      if (!raw) return null;
      const o = JSON.parse(raw) as { catIndex?: unknown; itemIndex?: unknown };
      if (typeof o.catIndex !== "number" || typeof o.itemIndex !== "number") return null;
      return { catIndex: o.catIndex, itemIndex: o.itemIndex };
    } catch {
      return null;
    }
  }

  function updateCategoryTitle(catIndex: number, lang: "de" | "en", value: string) {
    setCategories((prev) =>
      replaceCategoryAt(prev, catIndex, (c) => ({
        ...c,
        title: { ...c.title, [lang]: value }
      }))
    );
  }

  function setLunchStarterEnabled(catIndex: number, itemIndex: number, enabled: boolean) {
    setCategories((prev) =>
      replaceItemAt(prev, catIndex, itemIndex, (dish) => {
        if (enabled) {
          return {
            ...dish,
            lunchStarterChoice: JSON.parse(JSON.stringify(LUNCH_STARTER_CHOICE)) as MenuItem["lunchStarterChoice"]
          };
        }
        const next: MenuItem = { ...dish };
        delete next.lunchStarterChoice;
        return next;
      })
    );
  }

  function updateLunchStarterLabelField(catIndex: number, itemIndex: number, lang: "de" | "en", value: string) {
    setCategories((prev) =>
      replaceItemAt(prev, catIndex, itemIndex, (item) => {
        const ch = item.lunchStarterChoice;
        if (!ch) return item;
        return {
          ...item,
          lunchStarterChoice: {
            ...ch,
            label: { ...ch.label, [lang]: value }
          }
        };
      })
    );
  }

  function updateLunchStarterOptionId(catIndex: number, itemIndex: number, optIdx: number, id: string) {
    setCategories((prev) =>
      replaceItemAt(prev, catIndex, itemIndex, (item) => {
        const ch = item.lunchStarterChoice;
        if (!ch?.options[optIdx]) return item;
        const options = ch.options.map((opt, i) => (i === optIdx ? { ...opt, id } : opt));
        return { ...item, lunchStarterChoice: { ...ch, options } };
      })
    );
  }

  function updateLunchStarterOptionName(
    catIndex: number,
    itemIndex: number,
    optIdx: number,
    lang: "de" | "en",
    value: string
  ) {
    setCategories((prev) =>
      replaceItemAt(prev, catIndex, itemIndex, (item) => {
        const ch = item.lunchStarterChoice;
        const opt = ch?.options[optIdx];
        if (!ch || !opt) return item;
        const options = ch.options.map((o, i) =>
          i === optIdx ? { ...o, name: { ...o.name, [lang]: value } } : o
        );
        return { ...item, lunchStarterChoice: { ...ch, options } };
      })
    );
  }

  function addLunchStarterOptionRow(catIndex: number, itemIndex: number) {
    setCategories((prev) =>
      replaceItemAt(prev, catIndex, itemIndex, (item) => {
        const ch = item.lunchStarterChoice;
        if (!ch) return item;
        return {
          ...item,
          lunchStarterChoice: {
            ...ch,
            options: [...ch.options, { id: `ls-${crypto.randomUUID().slice(0, 8)}`, name: { de: "", en: "" } }]
          }
        };
      })
    );
  }

  function removeLunchStarterOptionRow(catIndex: number, itemIndex: number, optIdx: number) {
    setCategories((prev) =>
      replaceItemAt(prev, catIndex, itemIndex, (item) => {
        const ch = item.lunchStarterChoice;
        if (!ch) return item;
        const options = ch.options.filter((_, i) => i !== optIdx);
        if (options.length === 0) {
          const next: MenuItem = { ...item };
          delete next.lunchStarterChoice;
          return next;
        }
        return { ...item, lunchStarterChoice: { ...ch, options } };
      })
    );
  }

  function updateVariantField(
    catIndex: number,
    itemIndex: number,
    variantIndex: number,
    key: "id" | "priceEur",
    value: string
  ) {
    setCategories((prev) =>
      replaceItemAt(prev, catIndex, itemIndex, (item) => {
        const variants = item.variants ?? [];
        if (!variants[variantIndex]) return item;
        const nextVariants = [...variants];
        if (key === "priceEur") {
          const parsed = parseAdminPriceEur(value);
          if (parsed === "invalid" || parsed === "empty") {
            nextVariants[variantIndex] = { ...nextVariants[variantIndex], priceEur: 0 };
          } else {
            nextVariants[variantIndex] = { ...nextVariants[variantIndex], priceEur: parsed };
          }
        } else {
          nextVariants[variantIndex] = { ...nextVariants[variantIndex], id: value };
        }
        return { ...item, variants: nextVariants };
      })
    );
  }

  function updateVariantLabelField(
    catIndex: number,
    itemIndex: number,
    variantIndex: number,
    lang: "de" | "en",
    value: string
  ) {
    setCategories((prev) =>
      replaceItemAt(prev, catIndex, itemIndex, (item) => {
        const variants = item.variants ?? [];
        if (!variants[variantIndex]) return item;
        const nextVariants = [...variants];
        const current = nextVariants[variantIndex];
        nextVariants[variantIndex] = {
          ...current,
          label: { ...current.label, [lang]: value }
        };
        return { ...item, variants: nextVariants };
      })
    );
  }

  function addVariantRow(catIndex: number, itemIndex: number) {
    setCategories((prev) =>
      replaceItemAt(prev, catIndex, itemIndex, (item) => {
        const variants: MenuItemVariant[] = item.variants ? [...item.variants] : [];
        variants.push({
          id: `variant-${crypto.randomUUID().slice(0, 8)}`,
          label: { de: "Neue Variante", en: "New variant" },
          priceEur: item.priceEur
        });
        return { ...item, variants };
      })
    );
  }

  function removeVariantRow(catIndex: number, itemIndex: number, variantIndex: number) {
    setCategories((prev) =>
      replaceItemAt(prev, catIndex, itemIndex, (item) => {
        const variants = item.variants ?? [];
        if (!variants[variantIndex]) return item;
        const nextVariants = variants.filter((_, i) => i !== variantIndex);
        return { ...item, variants: nextVariants.length ? nextVariants : undefined };
      })
    );
  }

  function setDishOptionGroupEnabled(
    catIndex: number,
    itemIndex: number,
    group: ReusableOptionGroup,
    enabled: boolean
  ) {
    setCategories((prev) =>
      replaceItemAt(prev, catIndex, itemIndex, (item) => {
        const inherited = (group.linkedCategoryIds ?? []).includes(prev[catIndex]?.id ?? "");
        const explicit = new Set(item.optionGroupIds ?? []);
        const disabled = new Set(item.disabledCategoryOptionGroupIds ?? []);
        if (enabled) {
          disabled.delete(group.id);
          if (!inherited) explicit.add(group.id);
        } else {
          explicit.delete(group.id);
          if (inherited) disabled.add(group.id);
        }
        return {
          ...item,
          optionGroupIds: explicit.size ? [...explicit] : undefined,
          disabledCategoryOptionGroupIds: disabled.size ? [...disabled] : undefined
        };
      })
    );
  }

  const addDishButtonClass =
    "rounded-full border border-brand-primary/70 bg-brand-primary/10 px-5 py-2.5 text-sm font-semibold tracking-wide text-brand-primary transition hover:bg-brand-primary/20";

  if (loadError) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-red-600">{loadError}</p>
        <button type="button" onClick={() => void load()} className="mt-4 text-sm text-brand-primary underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-12">
      {/* Sticky toolbar */}
      <header className="sticky top-0 z-40 border-b border-[#eeeeee] bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-lg tracking-wide text-neutral-900 sm:text-xl">Admin</h1>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAdminTab("overview")}
                className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${
                  adminTab === "overview" ? "bg-neutral-900 text-white" : "border border-[#ddd] text-neutral-600"
                }`}
              >
                Übersicht
              </button>
              <button
                type="button"
                onClick={() => setAdminTab("option-groups")}
                className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${
                  adminTab === "option-groups" ? "bg-neutral-900 text-white" : "border border-[#ddd] text-neutral-600"
                }`}
              >
                Optionsgruppen
              </button>
            </div>
            <p className="hidden text-[11px] text-neutral-500 sm:block">
              Search, jump to a category, or expand one section at a time. Lunch menu (Mittagsmenü): category id{" "}
              <code className="rounded bg-neutral-100 px-1">{LUNCH_CATEGORY_ID}</code> — opens expanded after load; use sidebar or
              &quot;Jump to&quot;.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-1">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category or dish…"
              className={`${adminInputClass} w-full text-sm`}
              aria-label="Search menu"
            />
          </div>
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
            {menuStatus && <span className="text-[11px] font-medium text-emerald-700">{menuStatus}</span>}
            <button
              type="button"
              onClick={() => void saveMenu()}
              disabled={savingMenu}
              className="rounded-full border border-brand-primary/80 bg-brand-primary/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-primary hover:bg-brand-primary/25 disabled:opacity-50"
            >
              {savingMenu ? "…" : "Save menu"}
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-full border border-[#ccc] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-700 hover:bg-neutral-100"
            >
              Log out
            </button>
          </div>
        </div>
        {/* Mobile jump menu */}
        <div className="border-t border-[#eeeeee] px-4 py-2 lg:hidden">
          <label className="sr-only" htmlFor="admin-jump-mobile">
            Jump to section
          </label>
          <select
            id="admin-jump-mobile"
            className={`${adminSelectClass} w-full py-2 text-sm`}
            value=""
            onChange={(e) => {
              const v = e.target.value;
              if (v === "site") goToSite();
              else if (v === "gift") goToGift();
              else if (v) goToCategory(v);
              e.target.value = "";
            }}
          >
            <option value="">Jump to…</option>
            <option value="site">Website content</option>
            <option value="gift">Order gift</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title.de || c.id} ({c.items.length})
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-8 lg:grid-cols-[minmax(200px,240px)_1fr] lg:gap-10 lg:px-8">
        {/* Sidebar TOC — desktop */}
        <aside className="hidden lg:block">
          <nav className="sticky top-[7.5rem] space-y-1 rounded-xl border border-[#eeeeee] bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">On this page</p>
            <button
              type="button"
              onClick={goToSite}
              className="w-full rounded-lg px-2 py-2 text-left text-sm text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
            >
              Website content
            </button>
            <button
              type="button"
              onClick={goToGift}
              className="w-full rounded-lg px-2 py-2 text-left text-sm text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
            >
              Order gift
            </button>
            <div className="my-2 border-t border-[#eeeeee]" />
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => goToCategory(c.id)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                <span className="truncate">{c.title.de || c.id}</span>
                <span className="shrink-0 text-[11px] tabular-nums text-neutral-400">{c.items.length}</span>
              </button>
            ))}
            <div className="mt-3 border-t border-[#eeeeee] pt-3">
              <button type="button" onClick={expandAll} className="w-full py-1.5 text-left text-[11px] text-brand-primary hover:underline">
                Expand all categories
              </button>
              <button type="button" onClick={collapseAll} className="w-full py-1.5 text-left text-[11px] text-neutral-500 hover:underline">
                Collapse all
              </button>
            </div>
          </nav>
        </aside>

        <div className="min-w-0 space-y-10">
          {adminTab === "option-groups" ? (
            <AdminOptionGroups categories={categories} />
          ) : (
            <>
          <section id="admin-site-content" className="scroll-mt-28 space-y-4 rounded-2xl border border-[#eeeeee] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-xl text-neutral-900">Website content</h2>
              <span className="text-[10px] uppercase tracking-wider text-neutral-400">Homepage</span>
            </div>
            <p className="text-xs text-neutral-500">Bilder und Texte auf der Startseite bearbeiten.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Hero title (DE)">
                <input
                  value={siteContent.hero.title.de}
                  onChange={(e) =>
                    setSiteContent((s) => ({ ...s, hero: { ...s.hero, title: { ...s.hero.title, de: e.target.value } } }))
                  }
                  className={adminInputClass}
                />
              </AdminField>
              <AdminField label="Hero title (EN)">
                <input
                  value={siteContent.hero.title.en}
                  onChange={(e) =>
                    setSiteContent((s) => ({ ...s, hero: { ...s.hero, title: { ...s.hero.title, en: e.target.value } } }))
                  }
                  className={adminInputClass}
                />
              </AdminField>
              <AdminField label="Hero main image URL" className="sm:col-span-2">
                <input
                  value={siteContent.hero.mainImage}
                  onChange={(e) => setSiteContent((s) => ({ ...s, hero: { ...s.hero, mainImage: e.target.value } }))}
                  className={adminInputClass}
                  placeholder="https://... oder /hero-main.png"
                />
              </AdminField>
              <DishImageField
                itemId="site-hero-main"
                label="Hero main image upload"
                imageUrl={siteContent.hero.mainImage}
                onChange={(url) => setSiteContent((s) => ({ ...s, hero: { ...s.hero, mainImage: url } }))}
              />
              <AdminField label="Order card label (DE)">
                <input
                  value={siteContent.cards.order.label.de}
                  onChange={(e) =>
                    setSiteContent((s) => ({
                      ...s,
                      cards: { ...s.cards, order: { ...s.cards.order, label: { ...s.cards.order.label, de: e.target.value } } }
                    }))
                  }
                  className={adminInputClass}
                />
              </AdminField>
              <AdminField label="Order card label (EN)">
                <input
                  value={siteContent.cards.order.label.en}
                  onChange={(e) =>
                    setSiteContent((s) => ({
                      ...s,
                      cards: { ...s.cards, order: { ...s.cards.order, label: { ...s.cards.order.label, en: e.target.value } } }
                    }))
                  }
                  className={adminInputClass}
                />
              </AdminField>
              <AdminField label="Order card image URL" className="sm:col-span-2">
                <input
                  value={siteContent.cards.order.image}
                  onChange={(e) =>
                    setSiteContent((s) => ({ ...s, cards: { ...s.cards, order: { ...s.cards.order, image: e.target.value } } }))
                  }
                  className={adminInputClass}
                />
              </AdminField>
              <DishImageField
                itemId="site-card-order"
                label="Order card image upload"
                imageUrl={siteContent.cards.order.image}
                onChange={(url) =>
                  setSiteContent((s) => ({ ...s, cards: { ...s.cards, order: { ...s.cards.order, image: url } } }))
                }
              />
              <AdminField label="Reservation card image URL" className="sm:col-span-2">
                <input
                  value={siteContent.cards.reservation.image}
                  onChange={(e) =>
                    setSiteContent((s) => ({
                      ...s,
                      cards: { ...s.cards, reservation: { ...s.cards.reservation, image: e.target.value } }
                    }))
                  }
                  className={adminInputClass}
                />
              </AdminField>
              <DishImageField
                itemId="site-card-reservation"
                label="Reservation card image upload"
                imageUrl={siteContent.cards.reservation.image}
                onChange={(url) =>
                  setSiteContent((s) => ({
                    ...s,
                    cards: { ...s.cards, reservation: { ...s.cards.reservation, image: url } }
                  }))
                }
              />
              <AdminField label="About card image URL" className="sm:col-span-2">
                <input
                  value={siteContent.cards.about.image}
                  onChange={(e) =>
                    setSiteContent((s) => ({ ...s, cards: { ...s.cards, about: { ...s.cards.about, image: e.target.value } } }))
                  }
                  className={adminInputClass}
                />
              </AdminField>
              <DishImageField
                itemId="site-card-about"
                label="About card image upload"
                imageUrl={siteContent.cards.about.image}
                onChange={(url) =>
                  setSiteContent((s) => ({ ...s, cards: { ...s.cards, about: { ...s.cards.about, image: url } } }))
                }
              />
              <div className="sm:col-span-2 mt-1 rounded-xl border border-[#e8e8e8] bg-neutral-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Vacation mode</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Wenn aktiv und der Zeitraum gültig ist, werden Online-Bestellungen blockiert.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <label className="flex items-center gap-2 rounded-lg border border-[#e4e4e4] bg-white px-3 py-2 text-sm text-neutral-800">
                    <input
                      type="checkbox"
                      checked={siteContent.ordering.vacationMode.active}
                      onChange={(e) =>
                        setSiteContent((s) => ({
                          ...s,
                          ordering: {
                            ...s.ordering,
                            vacationMode: { ...s.ordering.vacationMode, active: e.target.checked }
                          }
                        }))
                      }
                      className="h-4 w-4 accent-brand-primary"
                    />
                    Aktiv
                  </label>
                  <AdminField label="Startdatum">
                    <input
                      type="date"
                      value={siteContent.ordering.vacationMode.startDate}
                      onChange={(e) =>
                        setSiteContent((s) => ({
                          ...s,
                          ordering: {
                            ...s.ordering,
                            vacationMode: { ...s.ordering.vacationMode, startDate: e.target.value }
                          }
                        }))
                      }
                      className={adminInputClass}
                    />
                  </AdminField>
                  <AdminField label="Enddatum">
                    <input
                      type="date"
                      value={siteContent.ordering.vacationMode.endDate}
                      onChange={(e) =>
                        setSiteContent((s) => ({
                          ...s,
                          ordering: {
                            ...s.ordering,
                            vacationMode: { ...s.ordering.vacationMode, endDate: e.target.value }
                          }
                        }))
                      }
                      className={adminInputClass}
                    />
                  </AdminField>
                </div>
              </div>
            </div>
            {siteStatus && <p className="text-sm font-medium text-emerald-700">{siteStatus}</p>}
            <button
              type="button"
              onClick={() => void saveSiteContent()}
              disabled={savingSite}
              className="rounded-full border border-[#ccc] bg-white px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
            >
              {savingSite ? "Saving…" : "Save website content"}
            </button>
          </section>

          <section id="admin-gift" className="scroll-mt-28 space-y-4 rounded-2xl border border-[#eeeeee] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-xl text-neutral-900">Order gift</h2>
              <span className="text-[10px] uppercase tracking-wider text-neutral-400">Checkout bonus</span>
            </div>
            <p className="text-xs text-neutral-500">
              Two cart subtotal tiers: from tier 1 guests get up to N free picks; from tier 2 the higher count applies. Same item can be chosen multiple times when N is greater than 1.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Tier 1 — from cart subtotal (EUR)">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.5}
                  value={gift.tier1ThresholdEur}
                  onChange={(e) => {
                    const n = parseFloat(e.target.value.replace(",", "."));
                    setGift((g) => ({ ...g, tier1ThresholdEur: Number.isFinite(n) && n >= 0 ? n : g.tier1ThresholdEur }));
                  }}
                  className={adminInputClass}
                />
              </AdminField>
              <AdminField label="Tier 1 — max free items">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={50}
                  step={1}
                  value={gift.tier1GiftCount}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    setGift((g) => ({ ...g, tier1GiftCount: Number.isFinite(n) ? Math.max(0, Math.min(50, n)) : g.tier1GiftCount }));
                  }}
                  className={adminInputClass}
                />
              </AdminField>
              <AdminField label="Tier 2 — from cart subtotal (EUR)">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.5}
                  value={gift.tier2ThresholdEur}
                  onChange={(e) => {
                    const n = parseFloat(e.target.value.replace(",", "."));
                    setGift((g) => ({ ...g, tier2ThresholdEur: Number.isFinite(n) && n >= 0 ? n : g.tier2ThresholdEur }));
                  }}
                  className={adminInputClass}
                />
              </AdminField>
              <AdminField label="Tier 2 — max free items">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={50}
                  step={1}
                  value={gift.tier2GiftCount}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    setGift((g) => ({ ...g, tier2GiftCount: Number.isFinite(n) ? Math.max(0, Math.min(50, n)) : g.tier2GiftCount }));
                  }}
                  className={adminInputClass}
                />
              </AdminField>
            </div>
            <div className="space-y-2 rounded-xl border border-[#e8e8e8] bg-neutral-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Gratisartikel im Checkout</p>
              <p className="text-xs text-neutral-500">
                Nur hier angehakte Gerichte-IDs stehen als Gratiswahl zur Verfügung (mehrfach dieselbe ID möglich, wenn mehrere Gratis-Slots aktiv sind).
              </p>
              <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border border-[#ececec] bg-white p-3">
                {giftSelectableItems.map((entry) => {
                  const checked = gift.freeItemIds.includes(entry.id);
                  return (
                    <label
                      key={entry.id}
                      className="flex cursor-pointer items-start justify-between gap-3 rounded-md border border-[#f1f1f1] px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{entry.nameDe}</span>
                        <span className="block text-xs text-neutral-500">
                          {entry.categoryDe} · <code className="rounded bg-neutral-100 px-1">{entry.id}</code>
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setGift((prev) => ({
                            ...prev,
                            freeItemIds: e.target.checked
                              ? [...prev.freeItemIds, entry.id]
                              : prev.freeItemIds.filter((id) => id !== entry.id)
                          }))
                        }
                        className="mt-1 h-4 w-4 shrink-0 accent-brand-primary"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
            <AdminField label="Message (DE)">
              <textarea
                value={gift.message.de}
                onChange={(e) => setGift((g) => ({ ...g, message: { ...g.message, de: e.target.value } }))}
                className={adminTextareaClass}
                rows={2}
              />
            </AdminField>
            <AdminField label="Message (EN)">
              <textarea
                value={gift.message.en}
                onChange={(e) => setGift((g) => ({ ...g, message: { ...g.message, en: e.target.value } }))}
                className={adminTextareaClass}
                rows={2}
              />
            </AdminField>
            {giftStatus && <p className="text-sm font-medium text-emerald-700">{giftStatus}</p>}
            <button
              type="button"
              onClick={() => void saveGift()}
              disabled={savingGift}
              className="rounded-full border border-[#ccc] bg-white px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
            >
              {savingGift ? "Saving…" : "Save gift settings"}
            </button>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h2 className="font-serif text-xl text-neutral-900">Menu</h2>
              <label className="flex cursor-pointer items-start gap-2 text-xs text-neutral-600">
                <input
                  type="checkbox"
                  checked={newDishAtTop}
                  onChange={(e) => setNewDishAtTopPref(e.target.checked)}
                  className="accent-brand-primary mt-0.5 h-4 w-4 shrink-0"
                />
                <span>
                  Neue Gerichte automatisch <strong className="font-medium text-neutral-800">oben</strong> in der Kategorie einfügen (sonst unten). Zum Sortieren weiterhin Drag &amp; Drop oder Pfeile nutzen.
                </span>
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={expandAll} className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500 hover:text-neutral-900">
                Expand all
              </button>
              <span className="text-neutral-300">|</span>
              <button type="button" onClick={collapseAll} className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500 hover:text-neutral-900">
                Collapse all
              </button>
              <button
                type="button"
                onClick={addCategory}
                className="rounded-full border border-brand-primary/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-primary hover:bg-brand-primary/10"
              >
                + Category
              </button>
            </div>
          </div>

          {search.trim() && filteredEntries.length === 0 && (
            <p className="rounded-lg border border-[#eeeeee] bg-neutral-50 px-4 py-3 text-sm text-neutral-600">No categories or dishes match “{search.trim()}”.</p>
          )}

          <div className="space-y-4">
            {filteredEntries.map(({ cat, ci }) => {
              const open = expandedCat[cat.id] === true;
              const q = search.trim();
              const visibleItems = cat.items.map((item, ii) => ({ item, ii })).filter(({ item }) => itemMatchesSearch(item, q));

              return (
                <section
                  key={cat.id}
                  id={`admin-cat-${cat.id}`}
                  onDragOver={
                    !q
                      ? (e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          setDragOverCategoryBeforeIndex(ci);
                        }
                      : undefined
                  }
                  onDragLeave={
                    !q
                      ? (e) => {
                          const related = e.relatedTarget as Node | null;
                          if (related && e.currentTarget.contains(related)) return;
                          setDragOverCategoryBeforeIndex(null);
                        }
                      : undefined
                  }
                  onDrop={
                    !q
                      ? (e) => {
                          e.preventDefault();
                          const raw = e.dataTransfer.getData(CATEGORY_DRAG_PAYLOAD_TYPE);
                          if (!raw) return;
                          try {
                            const payload = JSON.parse(raw) as { categoryIndex?: number };
                            if (typeof payload.categoryIndex !== "number") return;
                            reorderCategories(payload.categoryIndex, ci);
                            setDraggingCategoryIndex(null);
                            setDragOverCategoryBeforeIndex(null);
                          } catch {
                            /* ignore invalid payload */
                          }
                        }
                      : undefined
                  }
                  className={`scroll-mt-28 overflow-hidden rounded-2xl border border-[#eeeeee] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${
                    !q && dragOverCategoryBeforeIndex === ci ? "ring-2 ring-brand-primary/40 ring-offset-2 ring-offset-neutral-50" : ""
                  } ${draggingCategoryIndex === ci ? "opacity-70" : ""}`}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleCat(cat.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleCat(cat.id);
                      }
                    }}
                    className="flex w-full items-center gap-3 border-b border-[#eeeeee] bg-neutral-50/80 px-4 py-4 text-left transition hover:bg-neutral-100 sm:px-5"
                  >
                    {!q && (
                      <span className="flex shrink-0 items-stretch gap-0.5 rounded-lg border border-[#e8e8e8] bg-white p-0.5 shadow-sm">
                        <span
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData(CATEGORY_DRAG_PAYLOAD_TYPE, JSON.stringify({ categoryIndex: ci }));
                            e.dataTransfer.effectAllowed = "move";
                            setDraggingCategoryIndex(ci);
                          }}
                          onDragEnd={() => {
                            setDraggingCategoryIndex(null);
                            setDragOverCategoryBeforeIndex(null);
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="flex cursor-grab touch-none flex-col items-center justify-center gap-0.5 px-2 py-1.5 text-neutral-400 active:cursor-grabbing"
                          aria-label="Kategorie ziehen, um die Reihenfolge zu ändern"
                          title="Kategorie ziehen"
                        >
                          <span className="h-0.5 w-4 rounded-full bg-current" />
                          <span className="h-0.5 w-4 rounded-full bg-current" />
                          <span className="h-0.5 w-4 rounded-full bg-current" />
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            moveCategoryUp(ci);
                          }}
                          disabled={ci <= 0}
                          className="min-w-[2rem] rounded-md px-1 py-1 text-sm text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Kategorie nach oben"
                          title="Kategorie nach oben"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            moveCategoryDown(ci);
                          }}
                          disabled={ci >= categories.length - 1}
                          className="min-w-[2rem] rounded-md px-1 py-1 text-sm text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Kategorie nach unten"
                          title="Kategorie nach unten"
                        >
                          ↓
                        </button>
                      </span>
                    )}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#ccc] text-brand-primary">
                      {open ? "−" : "+"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-neutral-900">{cat.title.de || cat.title.en || cat.id}</p>
                      <p className="text-[11px] text-neutral-500">
                        {cat.items.length} dish{cat.items.length === 1 ? "" : "es"}
                        {q && visibleItems.length !== cat.items.length && ` · ${visibleItems.length} match search`}
                      </p>
                    </div>
                    <span className="hidden text-[10px] uppercase tracking-wider text-neutral-400 sm:inline">{open ? "Collapse" : "Expand"}</span>
                  </div>

                  {open && (
                    <div className="space-y-0 p-4 sm:p-5 sm:pt-2">
                      {q && (
                        <p className="mb-4 rounded-lg border border-brand-primary/20 bg-brand-primary/10 px-3 py-2 text-xs text-brand-primary-dark">
                          Sortierung per Ziehen oder Pfeilen ist bei aktiver Suche ausgeschaltet — Suchfeld leeren, um die Reihenfolge zu ändern.
                        </p>
                      )}
                      <div className="mb-6 flex flex-col gap-4 border-b border-[#eeeeee] pb-6 sm:flex-row sm:items-end sm:justify-between">
                        <div className="grid flex-1 gap-3 sm:grid-cols-2">
                          <AdminField label="Category title (DE)">
                            <input
                              value={cat.title.de}
                              onChange={(e) => updateCategoryTitle(ci, "de", e.target.value)}
                              className={adminInputClass}
                            />
                          </AdminField>
                          <AdminField label="Category title (EN)">
                            <input
                              value={cat.title.en}
                              onChange={(e) => updateCategoryTitle(ci, "en", e.target.value)}
                              className={adminInputClass}
                            />
                          </AdminField>
                        </div>
                        <div className="flex flex-col gap-2 sm:items-end">
                          <button
                            type="button"
                            onClick={() => void saveMenu()}
                            disabled={savingMenu}
                            className="rounded-full border border-brand-primary/80 bg-brand-primary/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-primary hover:bg-brand-primary/25 disabled:opacity-50"
                          >
                            {savingMenu ? "Saving…" : "Save"}
                          </button>
                          <div className="flex flex-wrap gap-2 sm:justify-end">
                            <span className="text-[10px] uppercase tracking-wider text-neutral-400">id: {cat.id}</span>
                            {cat.items.length === 0 && (
                              <button type="button" onClick={() => addItem(ci)} className={addDishButtonClass}>
                                + Dish
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => deleteCategory(ci)}
                              className="text-[10px] font-semibold uppercase text-red-400/80 hover:underline"
                            >
                              Delete category
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8">
                        {(q ? visibleItems : cat.items.map((item, ii) => ({ item, ii }))).map(({ item, ii }) => {
                          const canReorder = !q;
                          const isDraggingHere = dragging?.catIndex === ci && dragging?.itemIndex === ii;
                          const dropBeforeHere =
                            canReorder && dragOverBefore?.catIndex === ci && dragOverBefore.beforeIndex === ii;
                          const itemCount = cat.items.length;
                          return (
                          <div
                            key={item.id}
                            onDragOver={
                              canReorder
                                ? (e) => {
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = "move";
                                    setDragOverBefore({ catIndex: ci, beforeIndex: ii });
                                  }
                                : undefined
                            }
                            onDragLeave={
                              canReorder
                                ? (e) => {
                                    const related = e.relatedTarget as Node | null;
                                    if (related && e.currentTarget.contains(related)) return;
                                    setDragOverBefore(null);
                                  }
                                : undefined
                            }
                            onDrop={
                              canReorder
                                ? (e) => {
                                    e.preventDefault();
                                    const payload = parseDragPayload(e);
                                    if (!payload || payload.catIndex !== ci) return;
                                    reorderItemsInCategory(ci, payload.itemIndex, ii);
                                    setDragging(null);
                                    setDragOverBefore(null);
                                  }
                                : undefined
                            }
                            className={`rounded-xl border border-[#eeeeee] bg-neutral-50/80 p-4 sm:p-5 transition-shadow ${
                              dropBeforeHere ? "ring-2 ring-brand-primary/40 ring-offset-2 ring-offset-neutral-50" : ""
                            } ${isDraggingHere ? "opacity-55" : ""}`}
                          >
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
                                {canReorder && (
                                  <div className="flex shrink-0 items-stretch gap-0.5 rounded-lg border border-[#e8e8e8] bg-white p-0.5 shadow-sm">
                                    <span
                                      draggable
                                      onDragStart={(e) => {
                                        e.dataTransfer.setData(
                                          DRAG_PAYLOAD_TYPE,
                                          JSON.stringify({ catIndex: ci, itemIndex: ii })
                                        );
                                        e.dataTransfer.effectAllowed = "move";
                                        setDragging({ catIndex: ci, itemIndex: ii });
                                      }}
                                      onDragEnd={() => {
                                        setDragging(null);
                                        setDragOverBefore(null);
                                      }}
                                      className="flex cursor-grab touch-none flex-col items-center justify-center gap-0.5 px-2 py-1.5 text-neutral-400 active:cursor-grabbing"
                                      aria-label="Gericht ziehen, um die Reihenfolge zu ändern"
                                      title="Ziehen zum Sortieren"
                                    >
                                      <span className="h-0.5 w-4 rounded-full bg-current" />
                                      <span className="h-0.5 w-4 rounded-full bg-current" />
                                      <span className="h-0.5 w-4 rounded-full bg-current" />
                                    </span>
                                    <button
                                      type="button"
                                      disabled={ii <= 0}
                                      onClick={() => moveItemUp(ci, ii)}
                                      className="min-w-[2rem] rounded-md px-1 py-1 text-sm text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                                      aria-label="Gericht nach oben"
                                      title="Nach oben"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      type="button"
                                      disabled={ii >= itemCount - 1}
                                      onClick={() => moveItemDown(ci, ii)}
                                      className="min-w-[2rem] rounded-md px-1 py-1 text-sm text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                                      aria-label="Gericht nach unten"
                                      title="Nach unten"
                                    >
                                      ↓
                                    </button>
                                  </div>
                                )}
                                <span className="min-w-0 font-medium text-neutral-800">
                                  {item.name.de || item.name.en || item.id}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="text-[10px] text-neutral-400">{item.id}</span>
                                <label className="flex items-center gap-2 text-xs text-neutral-600">
                                  <span className="text-[10px] uppercase tracking-wider">Move</span>
                                  <select
                                    value={cat.id}
                                    onChange={(e) => moveItem(ci, ii, e.target.value)}
                                    className={`${adminSelectClass} py-1.5 text-xs`}
                                  >
                                    {categories.map((c) => (
                                      <option key={c.id} value={c.id}>
                                        {c.title.de || c.id}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => deleteItem(ci, ii)}
                                  className="text-xs text-red-400/90 hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                              <AdminField label="Name (DE)">
                                <input
                                  value={item.name.de}
                                  onChange={(e) => updateItem(ci, ii, { name: { ...item.name, de: e.target.value } })}
                                  className={adminInputClass}
                                />
                              </AdminField>
                              <AdminField label="Name (EN)">
                                <input
                                  value={item.name.en}
                                  onChange={(e) => updateItem(ci, ii, { name: { ...item.name, en: e.target.value } })}
                                  className={adminInputClass}
                                />
                              </AdminField>
                              <AdminField label="Description (DE)" className="lg:col-span-2">
                                <textarea
                                  value={item.description.de}
                                  onChange={(e) => updateItem(ci, ii, { description: { ...item.description, de: e.target.value } })}
                                  className={adminTextareaClass}
                                  rows={2}
                                />
                              </AdminField>
                              <AdminField label="Description (EN)" className="lg:col-span-2">
                                <textarea
                                  value={item.description.en}
                                  onChange={(e) => updateItem(ci, ii, { description: { ...item.description, en: e.target.value } })}
                                  className={adminTextareaClass}
                                  rows={2}
                                />
                              </AdminField>
                              <AdminField label="Price (EUR)">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={dishPriceDraft[item.id] ?? String(item.priceEur)}
                                  onChange={(e) =>
                                    setDishPriceDraft((d) => ({ ...d, [item.id]: e.target.value }))
                                  }
                                  onBlur={() => {
                                    const draft = dishPriceDraft[item.id];
                                    if (draft === undefined) return;
                                    const t = draft.trim();
                                    if (t === "") {
                                      setDishPriceDraft((d) => {
                                        const x = { ...d };
                                        delete x[item.id];
                                        return x;
                                      });
                                      return;
                                    }
                                    const p = parseAdminPriceEur(draft);
                                    if (p === "invalid") return;
                                    if (typeof p === "number") {
                                      setItemField(ci, ii, "priceEur", p);
                                      setDishPriceDraft((d) => {
                                        const x = { ...d };
                                        delete x[item.id];
                                        return x;
                                      });
                                    }
                                  }}
                                  className={adminInputClass}
                                />
                              </AdminField>
                              <DishImageField
                                itemId={item.id}
                                imageUrl={item.image}
                                onChange={(url) => setItemField(ci, ii, "image", url)}
                              />
                              <div className="lg:col-span-2 space-y-3 rounded-xl border border-[#e5e5e5] bg-white p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Varianten / Größen</p>
                                  <button
                                    type="button"
                                    onClick={() => addVariantRow(ci, ii)}
                                    className="text-[10px] font-semibold uppercase text-brand-primary hover:underline"
                                  >
                                    Variante hinzufügen
                                  </button>
                                </div>
                                <p className="text-xs text-neutral-500">
                                  Wenn Varianten vorhanden sind, muss der Kunde im Bestellbereich eine Variante auswählen.
                                </p>
                                {item.variants?.length ? (
                                  <div className="space-y-3">
                                    {item.variants.map((variant, vi) => (
                                      <div
                                        key={`${variant.id}-${vi}`}
                                        className="grid gap-2 rounded-lg border border-[#eeeeee] bg-neutral-50/80 p-3 sm:grid-cols-2 lg:grid-cols-4"
                                      >
                                        <AdminField label="Label DE">
                                          <input
                                            value={variant.label.de}
                                            onChange={(e) => updateVariantLabelField(ci, ii, vi, "de", e.target.value)}
                                            className={adminInputClass}
                                            placeholder="z. B. 6 Stück"
                                          />
                                        </AdminField>
                                        <AdminField label="Label EN">
                                          <input
                                            value={variant.label.en}
                                            onChange={(e) => updateVariantLabelField(ci, ii, vi, "en", e.target.value)}
                                            className={adminInputClass}
                                            placeholder="e.g. 6 pcs"
                                          />
                                        </AdminField>
                                        <AdminField label="Preis (EUR)">
                                          <input
                                            type="number"
                                            inputMode="decimal"
                                            min={0}
                                            step={0.1}
                                            value={variant.priceEur}
                                            onChange={(e) => updateVariantField(ci, ii, vi, "priceEur", e.target.value)}
                                            className={adminInputClass}
                                          />
                                        </AdminField>
                                        <div className="flex items-end">
                                          <button
                                            type="button"
                                            onClick={() => removeVariantRow(ci, ii, vi)}
                                            className="text-[10px] font-semibold uppercase text-red-400/90 hover:underline"
                                          >
                                            Variante löschen
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-neutral-500">
                                    Keine Varianten gesetzt. Dann gilt der normale Einzelpreis.
                                  </p>
                                )}
                              </div>
                              {optionGroups.length > 0 && (
                                <div className="lg:col-span-2 space-y-2 rounded-xl border border-[#e5e5e5] bg-white p-4">
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Optionsgruppen für dieses Gericht</p>
                                  <p className="text-xs text-neutral-500">
                                    Kategorie-verknüpfte Gruppen gelten automatisch. Hier können Sie pro Gericht zusätzlich aktivieren oder deaktivieren.
                                  </p>
                                  <div className="grid gap-2 sm:grid-cols-2">
                                    {optionGroups.map((g) => {
                                      const inherited = (g.linkedCategoryIds ?? []).includes(cat.id);
                                      const explicit = (item.optionGroupIds ?? []).includes(g.id);
                                      const disabled = (item.disabledCategoryOptionGroupIds ?? []).includes(g.id);
                                      const enabled = inherited ? !disabled : explicit;
                                      return (
                                        <label key={g.id} className="flex items-center justify-between gap-2 rounded-lg border border-[#eee] px-3 py-2 text-xs text-neutral-700">
                                          <span>{g.name.de || g.id}</span>
                                          <input
                                            type="checkbox"
                                            checked={enabled}
                                            onChange={(e) => setDishOptionGroupEnabled(ci, ii, g, e.target.checked)}
                                            className="h-4 w-4 accent-brand-primary"
                                          />
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              <div className="lg:col-span-2">
                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Flags</p>
                                <div className="flex flex-wrap gap-3 sm:gap-4">
                                  {(
                                    [
                                      ["isNew", "New"],
                                      ["isBestseller", "Bestseller"],
                                      ["isSpecialDeal", "Special Deal"],
                                      ["isSoldOut", "Temporär ausverkauft"],
                                      ["vegetarian", "Vegetarian"],
                                      ["vegan", "Vegan"]
                                    ] as const
                                  ).map(([key, label]) => (
                                    <label
                                      key={key}
                                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#eee] bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={!!item[key]}
                                        onChange={(e) => setItemField(ci, ii, key, e.target.checked)}
                                        className="accent-brand-primary h-4 w-4"
                                      />
                                      {label}
                                    </label>
                                  ))}
                                </div>
                                <div className="mt-3 flex items-center gap-3">
                                  <label className="text-sm text-neutral-700">Schärfe-Level</label>
                                  <select
                                    value={item.spicyLevel ?? 0}
                                    onChange={(e) => setItemField(ci, ii, "spicyLevel", Number(e.target.value) as 0 | 1 | 2)}
                                    className={`${adminSelectClass} max-w-[160px] py-2 text-sm`}
                                  >
                                    <option value={0}>Keine</option>
                                    <option value={1}>🌶</option>
                                    <option value={2}>🌶🌶</option>
                                  </select>
                                </div>
                                {!!item.isSpecialDeal && (
                                  <div className="mt-3">
                                    <AdminField label="Aktion Badge-Text (optional)">
                                      <input
                                        value={item.specialDealLabel ?? ""}
                                        onChange={(e) => setItemField(ci, ii, "specialDealLabel", e.target.value)}
                                        className={adminInputClass}
                                        placeholder="z. B. -10% oder -1€"
                                      />
                                      <p className="mt-1 text-[11px] text-neutral-500">Unterstützt: -10% oder -1€</p>
                                    </AdminField>
                                  </div>
                                )}
                              </div>
                              <div className="lg:col-span-2 space-y-3 rounded-xl border border-[#e5e5e5] bg-white p-4">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                  Mittagsmenü — Vorspeise (Online-Bestellung)
                                </p>
                                <p className="text-xs text-neutral-500">
                                  Aktiv: Gäste wählen beim Bestellen eine Option. Deaktivieren entfernt die Auswahl für dieses Gericht.
                                </p>
                                <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-800">
                                  <input
                                    type="checkbox"
                                    className="accent-brand-primary h-4 w-4"
                                    checked={!!item.lunchStarterChoice?.options?.length}
                                    onChange={(e) => setLunchStarterEnabled(ci, ii, e.target.checked)}
                                  />
                                  Vorspeisenwahl beim Bestellen
                                </label>
                                {item.lunchStarterChoice?.options?.length ? (
                                  <div className="space-y-3 border-t border-[#eeeeee] pt-3">
                                    <div className="grid gap-3 sm:grid-cols-2">
                                      <AdminField label="Vorspeise — Überschrift (DE)">
                                        <input
                                          value={item.lunchStarterChoice.label.de}
                                          onChange={(e) => updateLunchStarterLabelField(ci, ii, "de", e.target.value)}
                                          className={adminInputClass}
                                          placeholder="z. B. Vorspeise"
                                        />
                                      </AdminField>
                                      <AdminField label="Vorspeise — Überschrift (EN)">
                                        <input
                                          value={item.lunchStarterChoice.label.en}
                                          onChange={(e) => updateLunchStarterLabelField(ci, ii, "en", e.target.value)}
                                          className={adminInputClass}
                                          placeholder="e.g. Starter"
                                        />
                                      </AdminField>
                                    </div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Optionen</p>
                                    <div className="space-y-3">
                                      {item.lunchStarterChoice.options.map((opt, oi) => (
                                        <div
                                          key={`${opt.id}-${oi}`}
                                          className="flex flex-col gap-2 rounded-lg border border-[#eeeeee] bg-neutral-50/80 p-3 sm:flex-row sm:flex-wrap sm:items-end"
                                        >
                                          <AdminField label="Option-ID" className="min-w-[140px] flex-1">
                                            <input
                                              value={opt.id}
                                              onChange={(e) => updateLunchStarterOptionId(ci, ii, oi, e.target.value)}
                                              className={`${adminInputClass} font-mono text-xs`}
                                            />
                                          </AdminField>
                                          <AdminField label="Name DE" className="min-w-[160px] flex-1">
                                            <input
                                              value={opt.name.de}
                                              onChange={(e) => updateLunchStarterOptionName(ci, ii, oi, "de", e.target.value)}
                                              className={adminInputClass}
                                            />
                                          </AdminField>
                                          <AdminField label="Name EN" className="min-w-[160px] flex-1">
                                            <input
                                              value={opt.name.en}
                                              onChange={(e) => updateLunchStarterOptionName(ci, ii, oi, "en", e.target.value)}
                                              className={adminInputClass}
                                            />
                                          </AdminField>
                                          <button
                                            type="button"
                                            onClick={() => removeLunchStarterOptionRow(ci, ii, oi)}
                                            className="text-[10px] font-semibold uppercase text-red-400/90 hover:underline sm:mb-2"
                                          >
                                            Remove option
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => addLunchStarterOptionRow(ci, ii)}
                                      className="text-[10px] font-semibold uppercase text-brand-primary hover:underline"
                                    >
                                      + Option
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                              <div className="lg:col-span-2">
                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                                  Allergens (EU codes)
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {ALLERGEN_CODES_ORDER.map((code) => {
                                    const active = normalizeAllergenCodes(item.allergens).includes(code);
                                    return (
                                      <button
                                        key={code}
                                        type="button"
                                        onClick={() => toggleItemAllergen(ci, ii, code)}
                                        className={`min-w-[2rem] rounded-md border px-2 py-1.5 font-mono text-xs font-semibold transition ${
                                          active
                                            ? "border-brand-primary/80 bg-brand-primary/10 text-brand-primary-dark"
                                            : "border-[#ddd] bg-neutral-50 text-neutral-500 hover:border-neutral-400"
                                        }`}
                                      >
                                        {code}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex justify-center border-t border-[#eeeeee] pt-4 sm:justify-end">
                              <button type="button" onClick={() => addItemAfter(ci, ii)} className={addDishButtonClass}>
                                + Dish
                              </button>
                            </div>
                          </div>
                          );
                        })}
                        {!q && cat.items.length > 0 && (
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = "move";
                              setDragOverBefore({ catIndex: ci, beforeIndex: cat.items.length });
                            }}
                            onDragLeave={(e) => {
                              const related = e.relatedTarget as Node | null;
                              if (related && e.currentTarget.contains(related)) return;
                              setDragOverBefore(null);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const payload = parseDragPayload(e);
                              if (!payload || payload.catIndex !== ci) return;
                              reorderItemsInCategory(ci, payload.itemIndex, cat.items.length);
                              setDragging(null);
                              setDragOverBefore(null);
                            }}
                            className={`flex min-h-[2.25rem] items-center justify-center rounded-lg border border-dashed px-3 text-center text-[10px] font-medium uppercase tracking-wider transition-colors ${
                              dragOverBefore?.catIndex === ci && dragOverBefore.beforeIndex === cat.items.length
                                ? "border-brand-primary/50 bg-brand-primary/10 text-brand-primary"
                                : "border-[#ddd] text-neutral-400"
                            }`}
                          >
                            Ziel für „ganz unten“ — hier ablegen
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
            {!search.trim() && categories.length > 0 && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setDragOverCategoryBeforeIndex(categories.length);
                }}
                onDragLeave={(e) => {
                  const related = e.relatedTarget as Node | null;
                  if (related && e.currentTarget.contains(related)) return;
                  setDragOverCategoryBeforeIndex(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const raw = e.dataTransfer.getData(CATEGORY_DRAG_PAYLOAD_TYPE);
                  if (!raw) return;
                  try {
                    const payload = JSON.parse(raw) as { categoryIndex?: number };
                    if (typeof payload.categoryIndex !== "number") return;
                    reorderCategories(payload.categoryIndex, categories.length);
                    setDraggingCategoryIndex(null);
                    setDragOverCategoryBeforeIndex(null);
                  } catch {
                    /* ignore invalid payload */
                  }
                }}
                className={`flex min-h-[2.25rem] items-center justify-center rounded-lg border border-dashed px-3 text-center text-[10px] font-medium uppercase tracking-wider transition-colors ${
                  dragOverCategoryBeforeIndex === categories.length
                    ? "border-brand-primary/50 bg-brand-primary/10 text-brand-primary"
                    : "border-[#ddd] text-neutral-400"
                } ${draggingCategoryIndex !== null ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              >
                Ziel für Kategorie „ganz unten“
              </div>
            )}
          </div>

          <div className="flex justify-center border-t border-[#eeeeee] pt-8">
            <button
              type="button"
              onClick={() => void saveMenu()}
              disabled={savingMenu}
              className="rounded-full border border-brand-primary/80 bg-brand-primary/15 px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-primary hover:bg-brand-primary/25 disabled:opacity-50"
            >
              {savingMenu ? "Saving…" : "Save entire menu"}
            </button>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
