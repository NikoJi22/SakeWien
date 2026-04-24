"use client";

import { useEffect, useMemo, useState } from "react";
import type { MenuCategory, ReusableOptionGroup } from "@/lib/menu-types";
import { adminInputClass } from "./admin-field";
import { resolveReusableOptionGroupsForDish } from "@/lib/reusable-option-groups";

export function AdminOptionGroups({ categories }: { categories: MenuCategory[] }) {
  const [groups, setGroups] = useState<ReusableOptionGroup[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewDishId, setPreviewDishId] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/option-groups", { cache: "no-store", credentials: "same-origin" });
        if (!res.ok) throw new Error("load failed");
        const data = (await res.json()) as ReusableOptionGroup[];
        setGroups(Array.isArray(data) ? data : []);
      } catch {
        setStatus("Could not load option groups.");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const dishOptions = useMemo(
    () =>
      categories.flatMap((c) =>
        c.items.map((i) => ({ id: i.id, label: `${i.name.de || i.name.en || i.id} (${c.title.de || c.id})` }))
      ),
    [categories]
  );

  const previewDish = useMemo(() => {
    for (const c of categories) {
      const dish = c.items.find((i) => i.id === previewDishId);
      if (dish) return { dish, categoryId: c.id };
    }
    return null;
  }, [categories, previewDishId]);

  const previewGroups = useMemo(() => {
    if (!previewDish) return [];
    return resolveReusableOptionGroupsForDish(previewDish.dish, previewDish.categoryId, groups);
  }, [previewDish, groups]);

  function addTemplate(kind: "beilagen" | "getraenke" | "saucen") {
    const template: ReusableOptionGroup =
      kind === "beilagen"
        ? {
            id: `og-${crypto.randomUUID().slice(0, 8)}`,
            name: { de: "Beilagen", en: "Sides" },
            required: false,
            selectionType: "single",
            minSelections: 0,
            maxSelections: 1,
            options: [
              { id: `opt-${crypto.randomUUID().slice(0, 8)}`, label: { de: "Ohne Beilage", en: "Without side" }, extraPriceEur: 0 },
              { id: `opt-${crypto.randomUUID().slice(0, 8)}`, label: { de: "Jasminreis", en: "Jasmine rice" }, extraPriceEur: 2.5 },
              { id: `opt-${crypto.randomUUID().slice(0, 8)}`, label: { de: "Eierreis mit Gemüse", en: "Egg fried rice with vegetables" }, extraPriceEur: 5 }
            ],
            linkedCategoryIds: [],
            linkedDishIds: []
          }
        : kind === "getraenke"
          ? {
              id: `og-${crypto.randomUUID().slice(0, 8)}`,
              name: { de: "Getränke", en: "Drinks" },
              required: false,
              selectionType: "single",
              minSelections: 0,
              maxSelections: 1,
              options: [
                { id: `opt-${crypto.randomUUID().slice(0, 8)}`, label: { de: "Cola", en: "Cola" }, extraPriceEur: 2.5 },
                { id: `opt-${crypto.randomUUID().slice(0, 8)}`, label: { de: "Wasser", en: "Water" }, extraPriceEur: 2.8 }
              ],
              linkedCategoryIds: [],
              linkedDishIds: []
            }
          : {
              id: `og-${crypto.randomUUID().slice(0, 8)}`,
              name: { de: "Saucen", en: "Sauces" },
              required: false,
              selectionType: "multiple",
              minSelections: 0,
              maxSelections: 3,
              options: [
                { id: `opt-${crypto.randomUUID().slice(0, 8)}`, label: { de: "Sojasauce", en: "Soy sauce" }, extraPriceEur: 0 },
                { id: `opt-${crypto.randomUUID().slice(0, 8)}`, label: { de: "Scharfe Sauce", en: "Hot sauce" }, extraPriceEur: 0.5 }
              ],
              linkedCategoryIds: [],
              linkedDishIds: []
            };
    setGroups((prev) => [...prev, template]);
  }

  async function save() {
    setStatus("");
    const res = await fetch("/api/admin/option-groups", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(groups)
    });
    if (!res.ok) {
      setStatus("Save failed.");
      return;
    }
    setStatus("Option groups saved.");
    window.dispatchEvent(new Event("sake-option-groups-updated"));
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[#eeeeee] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-neutral-900">Optionsgruppen</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => addTemplate("beilagen")} className="rounded-full border border-[#ddd] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-700 hover:bg-neutral-50">Template: Beilagen</button>
          <button type="button" onClick={() => addTemplate("getraenke")} className="rounded-full border border-[#ddd] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-700 hover:bg-neutral-50">Template: Getränke</button>
          <button type="button" onClick={() => addTemplate("saucen")} className="rounded-full border border-[#ddd] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-700 hover:bg-neutral-50">Template: Saucen</button>
          <button
            type="button"
            onClick={() =>
              setGroups((prev) => [
                ...prev,
                {
                  id: `og-${crypto.randomUUID().slice(0, 8)}`,
                  name: { de: "Neue Optionsgruppe", en: "New option group" },
                  required: false,
                  selectionType: "single",
                  minSelections: 0,
                  maxSelections: 1,
                  options: [],
                  linkedCategoryIds: [],
                  linkedDishIds: []
                }
              ])
            }
            className="rounded-full border border-brand-primary/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-primary hover:bg-brand-primary/10"
          >
            Neu erstellen
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-[#e8e8e8] bg-neutral-50 p-4 space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Vorschau / Test</p>
        <select
          className={adminInputClass}
          value={previewDishId}
          onChange={(e) => setPreviewDishId(e.target.value)}
        >
          <option value="">Gericht auswählen…</option>
          {dishOptions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
        {previewDish ? (
          <div className="text-xs text-neutral-700">
            <p className="font-medium">Aktive Optionsgruppen:</p>
            {previewGroups.length ? (
              <ul className="mt-1 list-disc pl-5">
                {previewGroups.map((g) => (
                  <li key={g.id}>
                    {g.name.de || g.id} ({g.selectionType}, required: {g.required ? "yes" : "no"})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-neutral-500">Keine Gruppe verknüpft.</p>
            )}
          </div>
        ) : null}
      </div>
      {loading ? <p className="text-sm text-neutral-500">Loading…</p> : null}
      <div className="space-y-4">
        {groups.map((g, gi) => (
          <div key={g.id} className="rounded-xl border border-[#eeeeee] bg-neutral-50/70 p-4 space-y-3">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!confirm(`Optionsgruppe "${g.name.de || g.id}" wirklich löschen?`)) return;
                  setGroups((prev) => prev.filter((_, i) => i !== gi));
                }}
                className="text-[10px] font-semibold uppercase text-red-500 hover:underline"
              >
                Optionsgruppe löschen
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-600">
              <span className="rounded-full border border-[#ddd] bg-white px-2 py-0.5">
                Kategorien: {g.linkedCategoryIds?.length ?? 0}
              </span>
              <span className="rounded-full border border-[#ddd] bg-white px-2 py-0.5">
                Gerichte: {g.linkedDishIds?.length ?? 0}
              </span>
              <span className="rounded-full border border-[#ddd] bg-white px-2 py-0.5">
                Pflicht: {g.required ? "Ja" : "Nein"}
              </span>
              <span className="rounded-full border border-[#ddd] bg-white px-2 py-0.5">
                Auswahl: {g.selectionType === "single" ? "Single" : "Multiple"}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={adminInputClass}
                value={g.name.de}
                onChange={(e) => setGroups((prev) => prev.map((x, i) => (i === gi ? { ...x, name: { ...x.name, de: e.target.value } } : x)))}
                placeholder="Name DE"
              />
              <input
                className={adminInputClass}
                value={g.name.en}
                onChange={(e) => setGroups((prev) => prev.map((x, i) => (i === gi ? { ...x, name: { ...x.name, en: e.target.value } } : x)))}
                placeholder="Name EN"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <label className="text-xs">Required
                <input type="checkbox" checked={g.required} onChange={(e) => setGroups((prev) => prev.map((x, i) => (i === gi ? { ...x, required: e.target.checked } : x)))} />
              </label>
              <select
                className={adminInputClass}
                value={g.selectionType}
                onChange={(e) => setGroups((prev) => prev.map((x, i) => (i === gi ? { ...x, selectionType: e.target.value as "single" | "multiple" } : x)))}
              >
                <option value="single">single choice</option>
                <option value="multiple">multiple choice</option>
              </select>
              <input type="number" className={adminInputClass} value={g.minSelections} onChange={(e) => setGroups((prev) => prev.map((x, i) => (i === gi ? { ...x, minSelections: Number(e.target.value) } : x)))} />
              <input type="number" className={adminInputClass} value={g.maxSelections} onChange={(e) => setGroups((prev) => prev.map((x, i) => (i === gi ? { ...x, maxSelections: Number(e.target.value) } : x)))} />
            </div>
            <div className="space-y-2">
              {g.options.map((o, oi) => (
                <div key={o.id} className="grid gap-2 sm:grid-cols-4">
                  <input className={adminInputClass} value={o.label.de} onChange={(e) => setGroups((prev) => prev.map((x, i) => i === gi ? { ...x, options: x.options.map((q, qi) => qi === oi ? { ...q, label: { ...q.label, de: e.target.value } } : q) } : x))} placeholder="Label DE" />
                  <input className={adminInputClass} value={o.label.en} onChange={(e) => setGroups((prev) => prev.map((x, i) => i === gi ? { ...x, options: x.options.map((q, qi) => qi === oi ? { ...q, label: { ...q.label, en: e.target.value } } : q) } : x))} placeholder="Label EN" />
                  <input type="number" step={0.1} min={0} className={adminInputClass} value={o.extraPriceEur ?? 0} onChange={(e) => setGroups((prev) => prev.map((x, i) => i === gi ? { ...x, options: x.options.map((q, qi) => qi === oi ? { ...q, extraPriceEur: Number(e.target.value) } : q) } : x))} />
                  <button
                    type="button"
                    onClick={() => setGroups((prev) => prev.map((x, i) => i === gi ? { ...x, options: x.options.filter((_, qi) => qi !== oi) } : x))}
                    className="text-xs text-red-500"
                  >
                    Option löschen
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setGroups((prev) => prev.map((x, i) => i === gi ? { ...x, options: [...x.options, { id: `opt-${crypto.randomUUID().slice(0, 8)}`, label: { de: "Neue Option", en: "New option" }, extraPriceEur: 0 }] } : x))} className="text-xs text-brand-primary">Option hinzufügen</button>
            </div>
            <details>
              <summary className="cursor-pointer text-xs font-semibold text-neutral-700">Verknüpfungen</summary>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold">Kategorien</p>
                  {categories.map((c) => (
                    <label key={c.id} className="block text-xs">
                      <input
                        type="checkbox"
                        checked={g.linkedCategoryIds?.includes(c.id) ?? false}
                        onChange={(e) =>
                          setGroups((prev) =>
                            prev.map((x, i) =>
                              i === gi
                                ? {
                                    ...x,
                                    linkedCategoryIds: e.target.checked
                                      ? [...(x.linkedCategoryIds ?? []), c.id]
                                      : (x.linkedCategoryIds ?? []).filter((id) => id !== c.id)
                                  }
                                : x
                            )
                          )
                        }
                      />{" "}
                      {c.title.de || c.id}
                    </label>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold">Gerichte</p>
                  <div className="max-h-40 overflow-auto">
                    {dishOptions.map((d) => (
                      <label key={d.id} className="block text-xs">
                        <input
                          type="checkbox"
                          checked={g.linkedDishIds?.includes(d.id) ?? false}
                          onChange={(e) =>
                            setGroups((prev) =>
                              prev.map((x, i) =>
                                i === gi
                                  ? {
                                      ...x,
                                      linkedDishIds: e.target.checked
                                        ? [...(x.linkedDishIds ?? []), d.id]
                                        : (x.linkedDishIds ?? []).filter((id) => id !== d.id)
                                    }
                                  : x
                              )
                            )
                          }
                        />{" "}
                        {d.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </details>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => void save()} className="rounded-full border border-brand-primary/80 bg-brand-primary/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-primary hover:bg-brand-primary/25">
          Save options groups
        </button>
        {status ? <span className="text-xs text-neutral-600">{status}</span> : null}
      </div>
    </section>
  );
}
