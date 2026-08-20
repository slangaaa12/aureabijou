"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Heart, ZoomIn } from "lucide-react";
import type { Product, Review } from "@/lib/types";
import { badgeLabel, cn, formatMZN, sanitizeText } from "@/lib/utils";
import { Stars } from "@/components/ui/Stars";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { useCartStore } from "@/store/cart";
import { useCatalogStore } from "@/store/catalog";
import { useFavoritesStore, useRecentStore, useToastStore } from "@/store/ui";

export function ProductDetail({
  product,
  related,
  reviews,
}: {
  product: Product;
  related: Product[];
  reviews: Review[];
}) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [color, setColor] = useState(product.colors?.[0]);
  const [size, setSize] = useState(product.sizes?.[0]);
  const [author, setAuthor] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const favIds = useFavoritesStore((s) => s.ids);
  const toggleFav = useFavoritesStore((s) => s.toggle);
  const addRecent = useRecentStore((s) => s.add);
  const incrementViews = useCatalogStore((s) => s.incrementViews);
  const addReview = useCatalogStore((s) => s.addReview);
  const toast = useToastStore((s) => s.show);
  const isFav = favIds.includes(product.id);
  const soldOut = product.availability === "esgotado";

  useEffect(() => {
    addRecent(product.id);
    incrementViews(product.id);
  }, [product.id, addRecent, incrementViews]);

  const addToOrder = (buyNow = false) => {
    if (soldOut) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
      color,
      size,
    });
    toast("Adicionado ao pedido");
    if (buyNow) {
      openCart();
      window.location.href = "/checkout";
    }
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) return;
    addReview({
      id: `rev-${Date.now()}`,
      productId: product.id,
      author: sanitizeText(author, 80),
      rating,
      comment: sanitizeText(comment, 600),
      createdAt: new Date().toISOString(),
      approved: true,
    });
    setAuthor("");
    setComment("");
    toast("Avaliação enviada");
  };

  return (
    <div className="pb-28 md:pb-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 md:grid-cols-2 md:gap-12 md:px-6 md:py-10">
        <div>
          <div className="relative aspect-square overflow-hidden bg-surface">
            <Image
              src={product.images[index]}
              alt={product.name}
              fill
              priority
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-cover"
            />
            <button
              type="button"
              aria-label="Zoom"
              onClick={() => setZoom(true)}
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center bg-background/85 backdrop-blur"
            >
              <ZoomIn size={18} />
            </button>
            {product.badges[0] && (
              <span className="absolute left-3 top-3 bg-foreground px-2 py-1 text-[10px] tracking-widest text-background uppercase">
                {badgeLabel(product.badges[0])}
              </span>
            )}
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {product.images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden border",
                  i === index ? "border-aurea-gold" : "border-transparent"
                )}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
          {product.videoUrl && (
            <div className="mt-4 aspect-video overflow-hidden bg-surface">
              <iframe
                src={product.videoUrl}
                title={`Vídeo ${product.name}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>

        <div>
          <p className="text-[11px] tracking-[0.22em] text-aurea-gold uppercase">
            {product.categorySlug}
          </p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <h1 className="font-display text-3xl md:text-4xl">{product.name}</h1>
            <button
              type="button"
              aria-label="Favorito"
              onClick={() => toggleFav(product.id)}
              className="pressable flex h-12 w-12 shrink-0 items-center justify-center border border-border"
            >
              <Heart className={cn(isFav && "fill-aurea-gold text-aurea-gold")} size={18} />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Stars rating={product.rating} />
            <span className="text-xs text-muted">{product.reviewCount} avaliações</span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-2xl text-aurea-gold">{formatMZN(product.price)}</p>
            {product.compareAtPrice && (
              <p className="text-sm text-muted line-through">
                {formatMZN(product.compareAtPrice)}
              </p>
            )}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">{product.description}</p>
          {product.materials && (
            <p className="mt-3 text-sm">
              <span className="text-muted">Materiais: </span>
              {product.materials}
            </p>
          )}
          <p className="mt-2 text-sm">
            <span className="text-muted">Disponibilidade: </span>
            <span className="capitalize">{product.availability.replace("_", " ")}</span>
          </p>

          {product.colors && product.colors.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs tracking-widest text-muted uppercase">Cor</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "min-h-11 border px-4 text-sm",
                      color === c ? "border-aurea-gold text-aurea-gold" : "border-border"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs tracking-widest text-muted uppercase">Tamanho</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={cn(
                      "flex h-11 min-w-11 items-center justify-center border px-3 text-sm",
                      size === s ? "border-aurea-gold text-aurea-gold" : "border-border"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 hidden gap-3 md:flex">
            <Button
              variant="gold"
              size="lg"
              className="flex-1"
              disabled={soldOut}
              onClick={() => addToOrder(false)}
            >
              Adicionar ao Pedido
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              disabled={soldOut}
              onClick={() => addToOrder(true)}
            >
              Comprar Agora
            </Button>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <h2 className="font-display text-2xl">Avaliações</h2>
        <div className="mt-4 space-y-4">
          {reviews.length === 0 && (
            <p className="text-sm text-muted">Ainda sem avaliações. Seja a primeira!</p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{r.author}</p>
                <Stars rating={r.rating} size={12} />
              </div>
              <p className="mt-1 text-sm text-muted">{r.comment}</p>
            </div>
          ))}
        </div>
        <form onSubmit={submitReview} className="mt-6 space-y-3 border border-border p-4">
          <p className="text-sm font-medium">Deixar avaliação</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={cn(
                  "h-11 w-11 border text-sm",
                  rating >= n ? "border-aurea-gold text-aurea-gold" : "border-border"
                )}
              >
                {n}★
              </button>
            ))}
          </div>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="O seu nome"
            className="min-h-12 w-full border border-border bg-surface px-3 text-sm outline-none focus:border-aurea-gold"
            required
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="O seu comentário"
            rows={3}
            className="w-full border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-aurea-gold"
            required
          />
          <Button type="submit" variant="secondary">
            Enviar avaliação
          </Button>
        </form>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <h2 className="mb-5 font-display text-2xl">Produtos relacionados</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <div className="safe-bottom fixed inset-x-0 bottom-16 z-40 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
        <div className="flex gap-2">
          <Button
            variant="gold"
            className="flex-1"
            disabled={soldOut}
            onClick={() => addToOrder(false)}
          >
            Adicionar ao Pedido
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            disabled={soldOut}
            onClick={() => addToOrder(true)}
          >
            Comprar
          </Button>
        </div>
      </div>

      {zoom && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoom(false)}
          role="dialog"
        >
          <div className="relative h-[80vh] w-full max-w-3xl">
            <Image
              src={product.images[index]}
              alt={product.name}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
