"use client";

import { use, useMemo } from "react";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { useCatalogStore } from "@/store/catalog";

export default function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const products = useCatalogStore((s) => s.products);
  const reviews = useCatalogStore((s) => s.reviews);
  const hydrated = useCatalogStore((s) => s.hydrated);

  const product = products.find((p) => p.slug === slug && p.active);

  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter(
        (p) =>
          p.active &&
          p.id !== product.id &&
          p.categorySlug === product.categorySlug
      )
      .slice(0, 4);
  }, [product, products]);

  const productReviews = useMemo(() => {
    if (!product) return [];
    return reviews.filter((r) => r.productId === product.id && r.approved);
  }, [product, reviews]);

  if (hydrated && !product) notFound();
  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="skeleton aspect-square max-w-xl" />
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    brand: { "@type": "Brand", name: "AUREA" },
    offers: {
      "@type": "Offer",
      priceCurrency: "MZN",
      price: product.price,
      availability:
        product.availability === "disponivel"
          ? "https://schema.org/InStock"
          : product.availability === "esgotado"
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/PreOrder",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail
        product={product}
        related={related}
        reviews={productReviews}
      />
    </>
  );
}
