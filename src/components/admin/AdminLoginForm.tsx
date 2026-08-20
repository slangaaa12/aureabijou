"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { adminUrl } from "@/lib/admin-path";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(
        typeof data.error === "string"
          ? data.error
          : "Não foi possível entrar"
      );
      return;
    }
    router.push(adminUrl());
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 border border-border bg-background p-6"
        autoComplete="off"
      >
        <h1 className="font-display text-2xl">Acesso</h1>
        <p className="text-sm text-muted">Área restrita.</p>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="min-h-12 w-full border border-border bg-surface px-3 text-sm outline-none focus:border-aurea-gold"
          required
          autoComplete="username"
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="min-h-12 w-full border border-border bg-surface px-3 text-sm outline-none focus:border-aurea-gold"
          required
          autoComplete="current-password"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" variant="gold" className="w-full" disabled={loading}>
          {loading ? "A verificar…" : "Continuar"}
        </Button>
      </form>
    </div>
  );
}
