"use client";

import { useMemo, useState } from "react";
import { ProductCard, ProductSkeleton } from "@/components/product/ProductCard";
import { filterProducts, useCatalogStore } from "@/store/catalog";
import { cn } from "@/lib/utils";

export function ShopClient({
  initialCategory,
  title = "Loja",
  subtitle = "Todas as peças AUREA",
}: {
  initialCategory?: string;
  title?: string;
  subtitle?: string;
}) {
  const hydrated = useCatalogStore((s) => s.hydrated);
  const products = useCatalogStore((s) => s.products);
  const categories = useCatalogStore((s) => s.categories);

  const [category, setCategory] = useState(initialCategory || "");
  const [sort, setSort] = useState<
    "recent" | "price_asc" | "price_desc" | "bestseller" | "promo"
  >("recent");
  const [availability, setAvailability] = useState("");
  const [maxPrice, setMaxPrice] = useState(5000);

  const list = useMemo(
    () =>
      filterProducts(products, {
        category: category || undefined,
        sort,
        availability: availability || undefined,
        maxPrice,
      }),
    [products, category, sort, availability, maxPrice]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <p className="text-[11px] tracking-[0.25em] text-aurea-gold uppercase">
        Coleção
      </p>
      <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>

      <div className="mt-6 space-y-3 border border-border p-4">
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
          <FilterChip
            active={!category}
            label="Todas"
            onClick={() => setCategory("")}
          />
          {categories
            .filter((c) => c.active)
            .map((c) => (
              <FilterChip
                key={c.id}
                active={category === c.slug}
                label={c.name}
                onClick={() => setCategory(c.slug)}
              />
            ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="min-h-12 border border-border bg-surface px-3 text-sm"
          >
            <option value="recent">Mais recentes</option>
            <option value="bestseller">Mais vendidos</option>
            <option value="promo">Promoções</option>
            <option value="price_asc">Preço: menor</option>
            <option value="price_desc">Preço: maior</option>
          </select>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="min-h-12 border border-border bg-surface px-3 text-sm"
          >
            <option value="">Disponibilidade</option>
            <option value="disponivel">Disponível</option>
            <option value="sob_encomenda">Sob encomenda</option>
            <option value="esgotado">Esgotado</option>
          </select>
          <label className="flex min-h-12 items-center gap-3 border border-border bg-surface px-3 text-sm">
            <span className="text-muted">Até</span>
            <input
              type="range"
              min={500}
              max={5000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="flex-1 accent-aurea-gold"
            />
            <span>{maxPrice}</span>
          </label>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted">{list.length} produtos</p>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
        {!hydrated
          ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
          : list.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>

      {hydrated && list.length === 0 && (
        <p className="py-16 text-center text-muted">
          Nenhum produto encontrado com estes filtros.
        </p>
      )}
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "pressable min-h-11 shrink-0 border px-4 text-xs tracking-wide uppercase",
        active ? "border-aurea-gold text-aurea-gold" : "border-border text-muted"
      )}
    >
      {label}
    </button>
  );
}
