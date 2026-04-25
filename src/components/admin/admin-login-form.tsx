"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { brandBtnPrimary } from "@/lib/brand-actions";
import { AdminField, adminInputClass } from "./admin-field";
import { getStoredAdminLang, setStoredAdminLang, type AdminLang } from "@/lib/admin-i18n";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<AdminLang>("de");

  const copy =
    lang === "zh"
      ? {
          subtitle: "请使用网站管理员密码登录。",
          password: "密码",
          signIn: "登录",
          loginFailed: "登录失败"
        }
      : {
          subtitle: "Mit dem Website-Admin-Passwort anmelden.",
          password: "Passwort",
          signIn: "Anmelden",
          loginFailed: "Login fehlgeschlagen"
        };

  useEffect(() => {
    setLang(getStoredAdminLang());
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : copy.loginFailed);
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 ${lang === "zh" ? "admin-zh" : ""}`}>
      <div className="mb-3 flex justify-end gap-2">
        <button type="button" onClick={() => { setLang("de"); setStoredAdminLang("de"); }} className={`rounded-full px-3 py-1 text-xs ${lang === "de" ? "bg-neutral-900 text-white" : "border border-[#ddd] text-neutral-600"}`}>DE</button>
        <button type="button" onClick={() => { setLang("zh"); setStoredAdminLang("zh"); }} className={`rounded-full px-3 py-1 text-xs ${lang === "zh" ? "bg-neutral-900 text-white" : "border border-[#ddd] text-neutral-600"}`}>中文</button>
      </div>
      <h1 className="font-serif text-3xl tracking-wide text-neutral-900">Admin</h1>
      <p className="mt-2 text-sm text-neutral-600">{copy.subtitle}</p>
      <form onSubmit={onSubmit} className="mt-10 space-y-6">
        <AdminField label={copy.password}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={adminInputClass}
            autoComplete="current-password"
            required
          />
        </AdminField>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-full py-3 text-xs font-semibold uppercase tracking-[0.2em] shadow-md ${brandBtnPrimary} hover:shadow-lg disabled:opacity-50`}
        >
          {loading ? "…" : copy.signIn}
        </button>
      </form>
    </div>
  );
}
