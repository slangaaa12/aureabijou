"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { filterProducts, useCatalogStore } from "@/store/catalog";

function SearchResults() {
  const params = useSearchParams();
  const q = params.get("q") || "";
  const products = useCatalogStore((s) => s.products);
  const list = useMemo(
    () => filterProducts(products, { query: q, sort: "recent" }),
    [products, q]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <p className="text-[11px] tracking-[0.25em] text-aurea-gold uppercase">
        Pesquisa
      </p>
      <h1 className="font-display text-3xl">
        Resultados para “{q}”
      </h1>
      <p className="mt-1 text-sm text-muted">{list.length} encontrados</p>
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {list.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
      {list.length === 0 && (
        <p className="py-16 text-center text-muted">Nenhum resultado.</p>
      )}
    </div>
  );
}

export default function PesquisaPage() {
  return (
    <Suspense fallback={<div className="p-8">A pesquisar…</div>}>
      <SearchResults />
    </Suspense>
  );
}
