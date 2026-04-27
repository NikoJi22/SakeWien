"use client";

import { useEffect, useMemo, useState } from "react";
import type { MenuCategory, ReusableOptionGroup } from "@/lib/menu-types";
import type { AdminLang } from "@/lib/admin-i18n";
import { adminInputClass } from "./admin-field";
import { resolveReusableOptionGroupsForDish } from "@/lib/reusable-option-groups";

export function AdminOptionGroups({ categories, lang = "de" }: { categories: MenuCategory[]; lang?: AdminLang }) {
  const txt =
    lang === "zh"
      ? {
          title: "选项组",
          new: "新建",
          templateSides: "模板：配菜",
          templateDrinks: "模板：饮料",
          templateSauces: "模板：酱料",
          preview: "预览 / 测试",
          selectDish: "选择菜品…",
          activeGroups: "生效的选项组：",
          save: "保存选项组",
          saveOk: "选项组已保存。",
          saveFail: "保存失败。",
          deleteGroup: "删除选项组",
          deleteOption: "删除选项",
          links: "关联"
          ,
          categories: "分类",
          dishes: "菜品"
          ,
          requiredShort: "必选",
          yes: "是",
          no: "否",
          selectionShort: "选择",
          single: "单选",
          multiple: "多选",
          noLinked: "没有关联到该菜品的选项组。",
          loading: "加载中…",
          nameDe: "名称（德语）",
          nameEn: "名称（英语）",
          requiredLabel: "必选",
          selectionType: "选择类型",
          singleChoice: "单选",
          multipleChoice: "多选",
          min: "最少选择",
          max: "最多选择",
          addOption: "添加选项",
          optionPlaceholderDe: "标签（德语）",
          optionPlaceholderEn: "标签（英语）",
          extraPrice: "加价（EUR）"
          ,
          lunchCategoryLinked: "已关联午市分类",
          lunchDishesLinked: "午市菜品"
        }
      : {
          title: "Optionsgruppen",
          new: "Neu erstellen",
          templateSides: "Template: Beilagen",
          templateDrinks: "Template: Getränke",
          templateSauces: "Template: Saucen",
          preview: "Vorschau / Test",
          selectDish: "Gericht auswählen…",
          activeGroups: "Aktive Optionsgruppen:",
          save: "Optionsgruppen speichern",
          saveOk: "Optionsgruppen gespeichert.",
          saveFail: "Speichern fehlgeschlagen.",
          deleteGroup: "Optionsgruppe löschen",
          deleteOption: "Option löschen",
          links: "Verknüpfungen"
          ,
          categories: "Kategorien",
          dishes: "Gerichte"
          ,
          requiredShort: "Pflicht",
          yes: "Ja",
          no: "Nein",
          selectionShort: "Auswahl",
          single: "Single",
          multiple: "Multiple",
          noLinked: "Keine Gruppe verknüpft.",
          loading: "Loading…",
          nameDe: "Name (DE)",
          nameEn: "Name (EN)",
          requiredLabel: "Required",
          selectionType: "Selection type",
          singleChoice: "single choice",
          multipleChoice: "multiple choice",
          min: "Min selections",
          max: "Max selections",
          addOption: "Option hinzufügen",
          optionPlaceholderDe: "Label DE",
          optionPlaceholderEn: "Label EN",
          extraPrice: "Aufpreis (EUR)"
          ,
          lunchCategoryLinked: "Mit Lunch-Kategorie verknüpft",
          lunchDishesLinked: "Lunch-Gerichte"
        };
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
      setStatus(lang === "zh" ? "无法加载选项组。" : "Could not load option groups.");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [lang]);

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
      setStatus(txt.saveFail);
      return;
    }
    setStatus(txt.saveOk);
    window.dispatchEvent(new Event("sake-option-groups-updated"));
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[#eeeeee] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-neutral-900">{txt.title}</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => addTemplate("beilagen")} className="rounded-full border border-[#ddd] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-700 hover:bg-neutral-50">{txt.templateSides}</button>
          <button type="button" onClick={() => addTemplate("getraenke")} className="rounded-full border border-[#ddd] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-700 hover:bg-neutral-50">{txt.templateDrinks}</button>
          <button type="button" onClick={() => addTemplate("saucen")} className="rounded-full border border-[#ddd] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-700 hover:bg-neutral-50">{txt.templateSauces}</button>
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
            {txt.new}
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-[#e8e8e8] bg-neutral-50 p-4 space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">{txt.preview}</p>
        <select
          className={adminInputClass}
          value={previewDishId}
          onChange={(e) => setPreviewDishId(e.target.value)}
        >
          <option value="">{txt.selectDish}</option>
          {dishOptions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
        {previewDish ? (
          <div className="text-xs text-neutral-700">
            <p className="font-medium">{txt.activeGroups}</p>
            {previewGroups.length ? (
              <ul className="mt-1 list-disc pl-5">
                {previewGroups.map((g) => (
                  <li key={g.id}>
                    {g.name.de || g.id} ({g.selectionType === "single" ? txt.single : txt.multiple}, {txt.requiredShort}: {g.required ? txt.yes : txt.no})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-neutral-500">{txt.noLinked}</p>
            )}
          </div>
        ) : null}
      </div>
      {loading ? <p className="text-sm text-neutral-500">{txt.loading}</p> : null}
      <div className="space-y-4">
        {groups.map((g, gi) => (
          <div key={g.id} className="rounded-xl border border-[#eeeeee] bg-neutral-50/70 p-4 space-y-3">
            {(() => {
              const lunchCategoryLinked = (g.linkedCategoryIds ?? []).includes("lunch");
              const lunchDishLinkedCount = categories
                .find((c) => c.id === "lunch")
                ?.items.filter((i) => (g.linkedDishIds ?? []).includes(i.id)).length ?? 0;
              return (
                <>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                      if (!confirm(lang === "zh" ? `确定删除选项组 "${g.name.de || g.id}" ?` : `Optionsgruppe "${g.name.de || g.id}" wirklich löschen?`)) return;
                        setGroups((prev) => prev.filter((_, i) => i !== gi));
                      }}
                      className="text-[10px] font-semibold uppercase text-red-500 hover:underline"
                    >
                    {txt.deleteGroup}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-600">
                    <span className="rounded-full border border-[#ddd] bg-white px-2 py-0.5">
                      {txt.categories}: {g.linkedCategoryIds?.length ?? 0}
                    </span>
                    <span className="rounded-full border border-[#ddd] bg-white px-2 py-0.5">
                      {txt.dishes}: {g.linkedDishIds?.length ?? 0}
                    </span>
                    <span className="rounded-full border border-[#ddd] bg-white px-2 py-0.5">
                      {txt.requiredShort}: {g.required ? txt.yes : txt.no}
                    </span>
                    <span className="rounded-full border border-[#ddd] bg-white px-2 py-0.5">
                      {txt.selectionShort}: {g.selectionType === "single" ? txt.single : txt.multiple}
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 ${lunchCategoryLinked ? "border-brand-primary/40 bg-brand-primary/10 text-brand-primary-dark" : "border-[#ddd] bg-white"}`}>
                      {txt.lunchCategoryLinked}: {lunchCategoryLinked ? txt.yes : txt.no}
                    </span>
                    <span className="rounded-full border border-[#ddd] bg-white px-2 py-0.5">
                      {txt.lunchDishesLinked}: {lunchDishLinkedCount}
                    </span>
                  </div>
                </>
              );
            })()}
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={adminInputClass}
                value={g.name.de}
                onChange={(e) => setGroups((prev) => prev.map((x, i) => (i === gi ? { ...x, name: { ...x.name, de: e.target.value } } : x)))}
                placeholder={txt.nameDe}
              />
              <input
                className={adminInputClass}
                value={g.name.en}
                onChange={(e) => setGroups((prev) => prev.map((x, i) => (i === gi ? { ...x, name: { ...x.name, en: e.target.value } } : x)))}
                placeholder={txt.nameEn}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <label className="text-xs">{txt.requiredLabel}
                <input type="checkbox" checked={g.required} onChange={(e) => setGroups((prev) => prev.map((x, i) => (i === gi ? { ...x, required: e.target.checked } : x)))} />
              </label>
              <select
                className={adminInputClass}
                value={g.selectionType}
                onChange={(e) => setGroups((prev) => prev.map((x, i) => (i === gi ? { ...x, selectionType: e.target.value as "single" | "multiple" } : x)))}
              >
                <option value="single">{txt.singleChoice}</option>
                <option value="multiple">{txt.multipleChoice}</option>
              </select>
              <input type="number" title={txt.min} className={adminInputClass} value={g.minSelections} onChange={(e) => setGroups((prev) => prev.map((x, i) => (i === gi ? { ...x, minSelections: Number(e.target.value) } : x)))} />
              <input type="number" title={txt.max} className={adminInputClass} value={g.maxSelections} onChange={(e) => setGroups((prev) => prev.map((x, i) => (i === gi ? { ...x, maxSelections: Number(e.target.value) } : x)))} />
            </div>
            <div className="space-y-2">
              {g.options.map((o, oi) => (
                <div key={o.id} className="grid gap-2 sm:grid-cols-4">
                  <input className={adminInputClass} value={o.label.de} onChange={(e) => setGroups((prev) => prev.map((x, i) => i === gi ? { ...x, options: x.options.map((q, qi) => qi === oi ? { ...q, label: { ...q.label, de: e.target.value } } : q) } : x))} placeholder={txt.optionPlaceholderDe} />
                  <input className={adminInputClass} value={o.label.en} onChange={(e) => setGroups((prev) => prev.map((x, i) => i === gi ? { ...x, options: x.options.map((q, qi) => qi === oi ? { ...q, label: { ...q.label, en: e.target.value } } : q) } : x))} placeholder={txt.optionPlaceholderEn} />
                  <input type="number" title={txt.extraPrice} step={0.1} min={0} className={adminInputClass} value={o.extraPriceEur ?? 0} onChange={(e) => setGroups((prev) => prev.map((x, i) => i === gi ? { ...x, options: x.options.map((q, qi) => qi === oi ? { ...q, extraPriceEur: Number(e.target.value) } : q) } : x))} />
                  <button
                    type="button"
                    onClick={() => setGroups((prev) => prev.map((x, i) => i === gi ? { ...x, options: x.options.filter((_, qi) => qi !== oi) } : x))}
                    className="text-xs text-red-500"
                  >
                    {txt.deleteOption}
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setGroups((prev) => prev.map((x, i) => i === gi ? { ...x, options: [...x.options, { id: `opt-${crypto.randomUUID().slice(0, 8)}`, label: { de: "Neue Option", en: "New option" }, extraPriceEur: 0 }] } : x))} className="text-xs text-brand-primary">{txt.addOption}</button>
            </div>
            <details>
            <summary className="cursor-pointer text-xs font-semibold text-neutral-700">{txt.links}</summary>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold">{txt.categories}</p>
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
                  <p className="text-xs font-semibold">{txt.dishes}</p>
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
          {txt.save}
        </button>
        {status ? <span className="text-xs text-neutral-600">{status}</span> : null}
      </div>
    </section>
  );
}
