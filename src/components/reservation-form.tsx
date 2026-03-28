"use client";

import { FormEvent, useState } from "react";
import { useLanguage } from "@/context/language-context";
import { Input, TextArea } from "./form-fields";

export function ReservationForm() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData.entries());

    const res = await fetch("/api/reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    setStatus(res.ok ? "success" : "error");
    if (res.ok) e.currentTarget.reset();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-white/[0.08] bg-[#0a0a0a]/80 p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-9"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Input label={t.form.fullName} name="name" />
        <Input label={t.form.phone} name="phone" />
        <Input label={t.form.email} name="email" type="email" />
        <Input label={t.form.guests} name="guests" type="number" />
        <Input label={t.form.date} name="date" type="date" />
        <Input label={t.form.time} name="time" type="time" />
      </div>
      <TextArea label={t.form.message} name="notes" />
      <button
        type="submit"
        className="rounded-full bg-gold px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-black shadow-[0_8px_28px_rgba(196,165,116,0.28)] transition hover:brightness-105"
      >
        {status === "loading" ? t.form.sending : t.form.submit}
      </button>
      {status === "success" && <p className="text-sm text-green-400">{t.form.success}</p>}
      {status === "error" && <p className="text-sm text-red-400">{t.form.error}</p>}
    </form>
  );
}
