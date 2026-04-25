"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getStoredAdminLang, type AdminLang } from "@/lib/admin-i18n";

const ZH_LABELS: Record<string, string> = {
  "Password": "密码",
  "Hero title (DE)": "首页主标题（德语）",
  "Hero title (EN)": "首页主标题（英语）",
  "Hero main image URL": "首页主图 URL",
  "Order card label (DE)": "下单卡片标题（德语）",
  "Order card label (EN)": "下单卡片标题（英语）",
  "Order card image URL": "下单卡片图片 URL",
  "Reservation card image URL": "预订卡片图片 URL",
  "About card image URL": "关于我们卡片图片 URL",
  "Startdatum": "开始日期",
  "Enddatum": "结束日期",
  "Tier 1 — from cart subtotal (EUR)": "第1档 — 购物小计起始金额（EUR）",
  "Tier 1 — max free items": "第1档 — 免费商品数量上限",
  "Tier 2 — from cart subtotal (EUR)": "第2档 — 购物小计起始金额（EUR）",
  "Tier 2 — max free items": "第2档 — 免费商品数量上限",
  "Message (DE)": "消息文案（德语）",
  "Message (EN)": "消息文案（英语）",
  "Category title (DE)": "分类标题（德语）",
  "Category title (EN)": "分类标题（英语）",
  "Name (DE)": "名称（德语）",
  "Name (EN)": "名称（英语）",
  "Description (DE)": "描述（德语）",
  "Description (EN)": "描述（英语）",
  "Price (EUR)": "价格（EUR）",
  "Aufpreis (EUR)": "加价（EUR）",
  "Label DE": "标签（德语）",
  "Label EN": "标签（英语）",
  "Preis (EUR)": "价格（EUR）",
  "Aktion Badge-Text (optional)": "活动角标文本（可选）",
  "Vorspeise — Überschrift (DE)": "前菜标题（德语）",
  "Vorspeise — Überschrift (EN)": "前菜标题（英语）",
  "Option-ID": "选项 ID",
  "Name DE": "名称（德语）",
  "Name EN": "名称（英语）"
};

export function AdminField({
  label,
  children,
  className = ""
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const [lang, setLang] = useState<AdminLang>("de");
  useEffect(() => {
    setLang(getStoredAdminLang());
  }, []);
  const translatedLabel = lang === "zh" ? (ZH_LABELS[label] ?? label) : label;
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span
        className={`admin-field-label text-neutral-500 ${
          lang === "zh" ? "text-sm font-semibold tracking-[0.04em]" : "text-[10px] font-semibold uppercase tracking-[0.2em]"
        }`}
      >
        {translatedLabel}
      </span>
      {children}
    </label>
  );
}

export const adminInputClass =
  "rounded-lg border border-[#ccc] bg-white px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-[#888] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]";

export const adminSelectClass =
  "rounded-lg border border-[#ccc] bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#888] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]";

export const adminTextareaClass = `${adminInputClass} min-h-[72px] resize-y`;
