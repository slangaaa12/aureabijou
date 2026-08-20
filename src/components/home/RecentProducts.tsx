"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { useCatalogStore } from "@/store/catalog";
import { useRecentStore } from "@/store/ui";

export function RecentProducts() {
  const ids = useRecentStore((s) => s.ids);
  const products = useCatalogStore((s) => s.products);
  const recent = ids
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 4);

  if (recent.length === 0) return null;

  return (
    <section className="bg-surface py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <p className="text-[11px] tracking-[0.25em] text-aurea-gold uppercase">
          Recentes
        </p>
        <h2 className="mb-6 font-display text-3xl">Vistos recentemente</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {recent.map((p, i) =>
            p ? <ProductCard key={p.id} product={p} index={i} /> : null
          )}
        </div>
      </div>
    </section>
  );
}
