"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { useCatalogStore } from "@/store/catalog";
import { useFavoritesStore } from "@/store/ui";

export default function FavoritosPage() {
  const ids = useFavoritesStore((s) => s.ids);
  const products = useCatalogStore((s) => s.products);
  const favs = ids
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <p className="text-[11px] tracking-[0.25em] text-aurea-gold uppercase">
        Wishlist
      </p>
      <h1 className="font-display text-3xl md:text-4xl">Favoritos</h1>
      {favs.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted">Ainda não guardou peças favoritas.</p>
          <Button href="/loja" variant="gold" className="mt-6">
            Explorar Loja
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {favs.map((p, i) =>
            p ? <ProductCard key={p.id} product={p} index={i} /> : null
          )}
        </div>
      )}
    </div>
  );
}
