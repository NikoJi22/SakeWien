"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminField, adminInputClass } from "./admin-field";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        setError(typeof data.error === "string" ? data.error : "Login failed");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-serif text-3xl tracking-wide text-[#ebe3d6]">Admin</h1>
      <p className="mt-2 text-sm text-white/50">Sign in with the site password.</p>
      <form onSubmit={onSubmit} className="mt-10 space-y-6">
        <AdminField label="Password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={adminInputClass}
            autoComplete="current-password"
            required
          />
        </AdminField>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full border border-gold/80 bg-gold/15 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold transition hover:bg-gold/25 disabled:opacity-50"
        >
          {loading ? "…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
