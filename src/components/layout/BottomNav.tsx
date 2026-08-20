"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, ShoppingBag, Store } from "lucide-react";
import { useCartCount, useCartStore } from "@/store/cart";
import { useCatalogStore } from "@/store/catalog";
import { isPrivatePanelPath } from "@/lib/admin-path";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const openCart = useCartStore((s) => s.openCart);
  const count = useCartCount();
  const phone = useCatalogStore((s) => s.settings.whatsappNumber);

  if (isPrivatePanelPath(pathname) || pathname.startsWith("/checkout")) {
    return null;
  }

  const itemClass = (active: boolean) =>
    cn(
      "pressable flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] tracking-wide",
      active ? "text-aurea-rose-gold" : "text-muted"
    );

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      <div className="flex h-16 items-stretch">
        <Link href="/" className={itemClass(pathname === "/")}>
          <Home size={20} />
          Início
        </Link>
        <Link href="/loja" className={itemClass(pathname.startsWith("/loja") || pathname.startsWith("/categoria") || pathname.startsWith("/produto"))}>
          <Store size={20} />
          Loja
        </Link>
        <button type="button" onClick={openCart} className={itemClass(false)}>
          <span className="relative">
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-aurea-champagne-soft px-1 text-[9px] font-semibold text-aurea-mocha-deep">
                {count}
              </span>
            )}
          </span>
          Carrinho
        </button>
        <a
          href={`https://wa.me/${phone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className={itemClass(false)}
        >
          <MessageCircle size={20} />
          WhatsApp
        </a>
      </div>
    </nav>
  );
}
