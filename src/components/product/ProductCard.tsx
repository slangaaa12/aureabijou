"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { badgeLabel, cn, formatMZN } from "@/lib/utils";
import { Stars } from "@/components/ui/Stars";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore, useToastStore } from "@/store/ui";

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const favIds = useFavoritesStore((s) => s.ids);
  const toggleFav = useFavoritesStore((s) => s.toggle);
  const toast = useToastStore((s) => s.show);
  const isFav = favIds.includes(product.id);
  const badge = product.badges[0];
  const soldOut = product.availability === "esgotado";

  const add = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
      color: product.colors?.[0],
      size: product.sizes?.[0],
    });
    toast("Adicionado ao pedido");
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.25) }}
      className="group gold-glow relative"
    >
      <Link href={`/produto/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-surface">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {badge && (
            <span className="absolute left-2 top-2 bg-aurea-mocha px-2 py-1 text-[10px] tracking-[0.14em] text-aurea-cream uppercase">
              {badgeLabel(badge)}
            </span>
          )}
          <button
            type="button"
            aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFav(product.id);
            }}
            className="pressable absolute right-2 top-2 flex h-10 w-10 items-center justify-center bg-background/85 backdrop-blur"
          >
            <Heart
              size={18}
              className={cn(isFav && "fill-aurea-rose-gold text-aurea-rose-gold")}
            />
          </button>
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45">
              <span className="bg-background px-3 py-1 text-xs tracking-widest uppercase">
                Esgotado
              </span>
            </div>
          )}
        </div>
        <div className="space-y-1 pt-3">
          <div className="flex items-center justify-between gap-2">
            <Stars rating={product.rating} size={12} />
            <span className="text-[10px] text-muted">({product.reviewCount})</span>
          </div>
          <h3 className="font-display text-lg leading-tight">{product.name}</h3>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-aurea-rose-gold">
              {formatMZN(product.price)}
            </p>
            {product.compareAtPrice && (
              <p className="text-xs text-muted line-through">
                {formatMZN(product.compareAtPrice)}
              </p>
            )}
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={add}
        disabled={soldOut}
        className="pressable mt-3 flex min-h-12 w-full items-center justify-center gap-2 border border-border text-xs tracking-[0.18em] uppercase transition-colors hover:border-aurea-champagne-soft hover:text-aurea-rose-gold disabled:opacity-40"
      >
        <Plus size={16} />
        Adicionar
      </button>
    </motion.article>
  );
}

export function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <div className="skeleton aspect-[4/5]" />
      <div className="skeleton h-3 w-20" />
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-4 w-1/3" />
      <div className="skeleton h-12 w-full" />
    </div>
  );
}
