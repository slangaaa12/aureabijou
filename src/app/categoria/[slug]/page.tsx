"use client";

import { use } from "react";
import { ShopClient } from "@/components/shop/ShopClient";
import { useCatalogStore } from "@/store/catalog";

export default function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const categories = useCatalogStore((s) => s.categories);
  const category = categories.find((c) => c.slug === slug);

  return (
    <ShopClient
      initialCategory={slug}
      title={category?.name || slug}
      subtitle={category?.description || "Produtos desta categoria"}
    />
  );
}
