"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { adminUrl, getAdminBasePath } from "@/lib/admin-path";

const segments = [
  { path: "", label: "Dashboard" },
  { path: "produtos", label: "Produtos" },
  { path: "categorias", label: "Categorias" },
  { path: "banners", label: "Banners" },
  { path: "cupons", label: "Cupões" },
  { path: "entrega", label: "Entrega" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const base = getAdminBasePath();

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push(adminUrl("login"));
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <div>
              <p className="text-[11px] tracking-[0.25em] text-muted uppercase">
                Privado
              </p>
              <h1 className="font-display text-xl">Painel</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-muted hover:text-aurea-gold">
              Ver site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="min-h-10 border border-border px-3 text-xs uppercase tracking-wide"
            >
              Sair
            </button>
          </div>
        </div>
        <nav className="hide-scrollbar mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
          {segments.map((l) => {
            const href = adminUrl(l.path);
            const active =
              pathname === href ||
              pathname === `/${base}${l.path ? `/${l.path}` : ""}`;
            return (
              <Link
                key={l.path || "home"}
                href={href}
                className={cn(
                  "min-h-10 shrink-0 border px-3 py-2 text-xs tracking-wide uppercase",
                  active
                    ? "border-aurea-gold text-aurea-gold"
                    : "border-border text-muted"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
