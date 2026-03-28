"use client";

import { FormEvent, useState } from "react";
import { useLanguage } from "@/context/language-context";
import { Input, TextArea } from "./form-fields";

export function ContactForm() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData.entries());

    const res = await fetch("/api/contact", {
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
      className="space-y-6 rounded-2xl border border-[#eeeeee] bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-9"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Input label={t.form.fullName} name="name" />
        <Input
          label={t.form.phone}
          name="phone"
          type="tel"
          placeholder={t.form.phonePlaceholder}
          hint={t.form.phoneHint}
        />
        <Input label={t.form.email} name="email" type="email" />
      </div>
      <TextArea label={t.form.message} name="message" />

      <button
        type="submit"
        className="rounded-full bg-brand-accent px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-md shadow-brand-accent/15 transition hover:bg-brand-accent-hover"
      >
        {status === "loading" ? t.form.sending : t.form.submit}
      </button>
      {status === "success" && <p className="text-sm font-medium text-brand-success">{t.form.success}</p>}
      {status === "error" && <p className="text-sm font-medium text-brand-danger">{t.form.error}</p>}
    </form>
  );
}
