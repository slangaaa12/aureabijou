"use client";

import { ProductCard, ProductSkeleton } from "@/components/product/ProductCard";
import { filterProducts, useCatalogStore } from "@/store/catalog";
import { Button } from "@/components/ui/Button";

export function FeaturedProducts() {
  const hydrated = useCatalogStore((s) => s.hydrated);
  const products = useCatalogStore((s) => s.products);
  const featured = filterProducts(products, { sort: "bestseller" }).slice(0, 8);

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.25em] text-aurea-gold uppercase">
              Destaques
            </p>
            <h2 className="font-display text-3xl md:text-4xl">
              Peças mais desejadas
            </h2>
          </div>
          <Button href="/loja" variant="outline" className="hidden sm:inline-flex">
            Ver Loja
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {!hydrated
            ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            : featured.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
        </div>
        <div className="mt-8 sm:hidden">
          <Button href="/loja" variant="gold" className="w-full" size="lg">
            Ver Loja
          </Button>
        </div>
      </div>
    </section>
  );
}
