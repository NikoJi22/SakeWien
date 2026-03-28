"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GiftConfig, MenuCategory, MenuItem } from "@/lib/menu-types";
import { ALLERGEN_CODES_ORDER, normalizeAllergenCodes } from "@/lib/allergen-codes";
import { AdminField, adminInputClass, adminSelectClass, adminTextareaClass } from "./admin-field";

function cloneMenu(c: MenuCategory[]): MenuCategory[] {
  return JSON.parse(JSON.stringify(c)) as MenuCategory[];
}

function emptyDish(): MenuItem {
  return {
    id: `dish-${crypto.randomUUID().slice(0, 10)}`,
    name: { de: "Neues Gericht", en: "New dish" },
    description: { de: "", en: "" },
    priceEur: 0,
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=900&q=80",
    allergens: [],
    isNew: false,
    isBestseller: false,
    vegetarian: false,
    vegan: false,
    spicy: false
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

export function AdminDashboard() {
  const router = useRouter();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [gift, setGift] = useState<GiftConfig>({
    thresholdEur: 45,
    message: { en: "", de: "" }
  });
  const [loadError, setLoadError] = useState("");
  const [menuStatus, setMenuStatus] = useState("");
  const [giftStatus, setGiftStatus] = useState("");
  const [savingMenu, setSavingMenu] = useState(false);
  const [savingGift, setSavingGift] = useState(false);
  const [search, setSearch] = useState("");
  /** Category id → expanded (default collapsed = less scrolling) */
  const [expandedCat, setExpandedCat] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const [menuRes, giftRes] = await Promise.all([fetch("/api/menu", { cache: "no-store" }), fetch("/api/gift", { cache: "no-store" })]);
      if (!menuRes.ok) throw new Error("Menu load failed");
      const menuData = (await menuRes.json()) as MenuCategory[];
      setCategories(cloneMenu(Array.isArray(menuData) ? menuData : []));
      if (giftRes.ok) {
        const g = (await giftRes.json()) as GiftConfig;
        setGift(g);
      }
    } catch {
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
        .filter(({ cat }) => categoryMatchesSearch(cat, search)),
    [categories, search]
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

  const goToCategory = useCallback((id: string) => {
    setExpandedCat((prev) => ({ ...prev, [id]: true }));
    requestAnimationFrame(() => {
      document.getElementById(`admin-cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  async function saveMenu() {
    setMenuStatus("");
    setSavingMenu(true);
    try {
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categories)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMenuStatus(typeof data.error === "string" ? data.error : "Save failed");
        return;
      }
      setMenuStatus("Menu saved.");
      window.dispatchEvent(new Event("sake-menu-updated"));
    } finally {
      setSavingMenu(false);
    }
  }

  async function saveGift() {
    setGiftStatus("");
    setSavingGift(true);
    try {
      const res = await fetch("/api/admin/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gift)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setGiftStatus(typeof data.error === "string" ? data.error : "Save failed");
        return;
      }
      setGiftStatus("Gift settings saved.");
      window.dispatchEvent(new Event("sake-gift-updated"));
    } finally {
      setSavingGift(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function updateItem(catIndex: number, itemIndex: number, patch: Partial<Pick<MenuItem, "name" | "description">>) {
    setCategories((prev) => {
      const next = cloneMenu(prev);
      const item = next[catIndex].items[itemIndex];
      if (!item) return prev;
      if (patch.name) item.name = { ...item.name, ...patch.name };
      if (patch.description) item.description = { ...item.description, ...patch.description };
      return next;
    });
  }

  function setItemField(catIndex: number, itemIndex: number, key: keyof MenuItem, value: unknown) {
    setCategories((prev) => {
      const next = cloneMenu(prev);
      const item = next[catIndex].items[itemIndex];
      if (!item) return prev;
      (item as Record<string, unknown>)[key] = value;
      return next;
    });
  }

  function toggleItemAllergen(catIndex: number, itemIndex: number, code: string) {
    setCategories((prev) => {
      const next = cloneMenu(prev);
      const item = next[catIndex].items[itemIndex];
      if (!item) return prev;
      const cur = new Set(normalizeAllergenCodes(item.allergens));
      const u = code.toUpperCase();
      if (cur.has(u)) cur.delete(u);
      else cur.add(u);
      item.allergens = normalizeAllergenCodes([...cur]);
      return next;
    });
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
      next[catIndex].items.push(emptyDish());
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
      next[toIdx].items.push(item);
      return next;
    });
  }

  function updateCategoryTitle(catIndex: number, lang: "de" | "en", value: string) {
    setCategories((prev) => {
      const next = cloneMenu(prev);
      next[catIndex].title[lang] = value;
      return next;
    });
  }

  if (loadError) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-red-600">{loadError}</p>
        <button type="button" onClick={() => void load()} className="mt-4 text-sm text-gold underline">
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
            <p className="hidden text-[11px] text-neutral-500 sm:block">Search, jump to a category, or expand one section at a time.</p>
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
              className="rounded-full border border-gold/80 bg-gold/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-gold hover:bg-gold/25 disabled:opacity-50"
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
              if (v === "gift") goToGift();
              else if (v) goToCategory(v);
              e.target.value = "";
            }}
          >
            <option value="">Jump to…</option>
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
              <button type="button" onClick={expandAll} className="w-full py-1.5 text-left text-[11px] text-gold/90 hover:underline">
                Expand all categories
              </button>
              <button type="button" onClick={collapseAll} className="w-full py-1.5 text-left text-[11px] text-neutral-500 hover:underline">
                Collapse all
              </button>
            </div>
          </nav>
        </aside>

        <div className="min-w-0 space-y-10">
          <section id="admin-gift" className="scroll-mt-28 space-y-4 rounded-2xl border border-[#eeeeee] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-xl text-neutral-900">Order gift</h2>
              <span className="text-[10px] uppercase tracking-wider text-neutral-400">Checkout bonus</span>
            </div>
            <p className="text-xs text-neutral-500">Shown when the cart reaches the threshold.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Threshold (EUR)">
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={gift.thresholdEur}
                  onChange={(e) => setGift((g) => ({ ...g, thresholdEur: Number(e.target.value) || 0 }))}
                  className={adminInputClass}
                />
              </AdminField>
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

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-xl text-neutral-900">Menu</h2>
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
                className="rounded-full border border-gold/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold hover:bg-gold/10"
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
                  className="scroll-mt-28 overflow-hidden rounded-2xl border border-[#eeeeee] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                >
                  <button
                    type="button"
                    onClick={() => toggleCat(cat.id)}
                    className="flex w-full items-center gap-3 border-b border-[#eeeeee] bg-neutral-50/80 px-4 py-4 text-left transition hover:bg-neutral-100 sm:px-5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#ccc] text-amber-800">
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
                  </button>

                  {open && (
                    <div className="space-y-0 p-4 sm:p-5 sm:pt-2">
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
                            className="rounded-full border border-gold/80 bg-gold/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-gold hover:bg-gold/25 disabled:opacity-50"
                          >
                            {savingMenu ? "Saving…" : "Save"}
                          </button>
                          <div className="flex flex-wrap gap-2 sm:justify-end">
                            <span className="text-[10px] uppercase tracking-wider text-neutral-400">id: {cat.id}</span>
                            <button
                              type="button"
                              onClick={() => addItem(ci)}
                              className="text-[10px] font-semibold uppercase text-gold hover:underline"
                            >
                              + Dish
                            </button>
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
                        {(q ? visibleItems : cat.items.map((item, ii) => ({ item, ii }))).map(({ item, ii }) => (
                          <div key={item.id} className="rounded-xl border border-[#eeeeee] bg-neutral-50/80 p-4 sm:p-5">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                              <span className="font-medium text-neutral-800">{item.name.de || item.name.en || item.id}</span>
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
                                  type="number"
                                  step="0.1"
                                  min={0}
                                  value={item.priceEur}
                                  onChange={(e) => setItemField(ci, ii, "priceEur", Number(e.target.value) || 0)}
                                  className={adminInputClass}
                                />
                              </AdminField>
                              <AdminField label="Image URL" className="lg:col-span-2">
                                <input
                                  value={item.image}
                                  onChange={(e) => setItemField(ci, ii, "image", e.target.value)}
                                  className={adminInputClass}
                                />
                              </AdminField>
                              <div className="lg:col-span-2">
                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Flags</p>
                                <div className="flex flex-wrap gap-3 sm:gap-4">
                                  {(
                                    [
                                      ["isNew", "New"],
                                      ["isBestseller", "Bestseller"],
                                      ["vegetarian", "Vegetarian"],
                                      ["vegan", "Vegan"],
                                      ["spicy", "Spicy"]
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
                                        className="accent-gold h-4 w-4"
                                      />
                                      {label}
                                    </label>
                                  ))}
                                </div>
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
                                            ? "border-amber-600/80 bg-amber-50 text-amber-950"
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
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          <div className="flex justify-center border-t border-[#eeeeee] pt-8">
            <button
              type="button"
              onClick={() => void saveMenu()}
              disabled={savingMenu}
              className="rounded-full border border-gold/80 bg-gold/15 px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold hover:bg-gold/25 disabled:opacity-50"
            >
              {savingMenu ? "Saving…" : "Save entire menu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
