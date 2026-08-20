"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sun,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useCartCount, useCartStore } from "@/store/cart";
import { useThemeStore } from "@/store/ui";
import { useCatalogStore } from "@/store/catalog";
import { isPrivatePanelPath } from "@/lib/admin-path";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Início" },
  { href: "/loja", label: "Loja" },
  { href: "/categoria/novidades", label: "Novidades" },
  { href: "/checkout", label: "Pedido" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const openCart = useCartStore((s) => s.openCart);
  const count = useCartCount();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const promo = useCatalogStore((s) => s.settings.promoBanner);

  if (isPrivatePanelPath(pathname)) return null;

  const isHome = pathname === "/";

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/pesquisa?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setMenuOpen(false);
  };

  return (
    <>
      {promo?.active && !isHome && (
        <div className="bg-aurea-mocha text-center text-[11px] tracking-[0.18em] text-aurea-cream uppercase py-2 px-3">
          {promo.href ? (
            <Link href={promo.href} className="hover:text-aurea-champagne transition-colors">
              {promo.text}
            </Link>
          ) : (
            promo.text
          )}
        </div>
      )}

      <header
        className={cn(
          "z-50",
          isHome
            ? "absolute inset-x-0 top-0 border-none bg-transparent text-[#f7f4ef]"
            : "sticky top-0 border-b border-border/80 bg-background/90 backdrop-blur-md"
        )}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 md:h-16 md:px-6">
          <button
            type="button"
            aria-label="Abrir menu"
            className={cn(
              "pressable flex h-12 w-12 items-center justify-center md:hidden",
              isHome && "text-[#f7f4ef]"
            )}
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>

          <Link href="/" className="pressable shrink-0" aria-label="AUREA início">
            <Logo size="sm" className="md:hidden" />
            <Logo size="md" className="hidden md:inline-flex" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "text-xs tracking-[0.2em] uppercase transition-colors",
                  isHome
                    ? pathname === l.href
                      ? "text-[#d4bc96]"
                      : "text-white/70 hover:text-[#d4bc96]"
                    : pathname === l.href
                      ? "text-aurea-rose-gold"
                      : "text-muted hover:text-aurea-gold"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label="Pesquisar"
              className={cn(
                "pressable flex h-12 w-12 items-center justify-center",
                isHome && "text-[#f7f4ef]"
              )}
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Search size={20} />
            </button>
            <button
              type="button"
              aria-label="Alternar tema"
              className={cn(
                "pressable hidden h-12 w-12 items-center justify-center md:flex",
                isHome && "text-[#f7f4ef]"
              )}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              aria-label="Abrir carrinho"
              className={cn(
                "pressable relative flex h-12 w-12 items-center justify-center",
                isHome && "text-[#f7f4ef]"
              )}
              onClick={openCart}
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-aurea-champagne-soft px-1 text-[10px] font-semibold text-aurea-mocha-deep">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <form
            onSubmit={submitSearch}
            className={cn(
              "border-t px-4 py-3 md:px-6",
              isHome
                ? "border-white/15 bg-[#3d2b24]/95 backdrop-blur-md"
                : "border-border"
            )}
          >
            <div className="mx-auto flex max-w-6xl gap-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar por nome, categoria ou preço..."
                className="min-h-12 w-full border border-border bg-surface px-4 text-sm outline-none focus:border-aurea-champagne-soft"
              />
              <button
                type="submit"
                className="pressable min-h-12 bg-aurea-mocha px-5 text-xs tracking-widest text-aurea-cream uppercase"
              >
                Ir
              </button>
            </div>
          </form>
        )}
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-sm flex-col bg-background p-6 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <Logo size="md" />
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center"
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar"
              >
                <X size={22} />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="pressable min-h-12 border-b border-border py-3 font-display text-2xl"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => {
                toggleTheme();
              }}
              className="mt-auto flex min-h-12 items-center gap-3 text-sm text-muted"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              Modo {theme === "dark" ? "claro" : "escuro"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
