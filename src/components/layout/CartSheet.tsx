"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore, cartItemKey, calcCartTotals } from "@/store/cart";
import { useCatalogStore } from "@/store/catalog";
import { formatMZN } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export function CartSheet() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, applyCoupon, clearCoupon, couponCode } =
    useCartStore();
  const coupons = useCatalogStore((s) => s.coupons);
  const settings = useCatalogStore((s) => s.settings);
  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState("");

  const coupon = coupons.find(
    (c) => c.active && c.code.toUpperCase() === (couponCode || "").toUpperCase()
  );
  const { subtotal, discount, deliveryFee, total } = calcCartTotals(
    items,
    coupon,
    settings.defaultDeliveryFee
  );

  const tryCoupon = () => {
    const found = coupons.find(
      (c) => c.active && c.code.toUpperCase() === code.trim().toUpperCase()
    );
    if (!found) {
      setCouponError("Cupão inválido");
      return;
    }
    if (found.minSubtotal && subtotal < found.minSubtotal) {
      setCouponError(`Mínimo ${formatMZN(found.minSubtotal)}`);
      return;
    }
    applyCoupon(found.code);
    setCouponError("");
    setCode("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[75]">
          <motion.button
            type="button"
            aria-label="Fechar carrinho"
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="safe-bottom absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden rounded-t-2xl border-t border-border bg-background md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-l md:border-t-0"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <div>
                <p className="text-[11px] tracking-[0.25em] text-aurea-gold uppercase">
                  Seu Pedido
                </p>
                <h2 className="font-display text-2xl">Carrinho</h2>
              </div>
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center"
                onClick={closeCart}
                aria-label="Fechar"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex max-h-[calc(88vh-11rem)] flex-col overflow-y-auto md:max-h-[calc(100vh-11rem)]">
              {items.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
                  <p className="text-muted">O seu pedido ainda está vazio.</p>
                  <Button href="/loja" variant="gold" onClick={closeCart}>
                    Explorar Coleção
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-border px-4">
                  {items.map((item) => {
                    const key = cartItemKey(item);
                    return (
                      <li key={key} className="flex gap-3 py-4">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-surface">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="truncate font-medium">{item.name}</p>
                              <p className="text-xs text-muted">
                                {[item.color, item.size].filter(Boolean).join(" · ")}
                              </p>
                              <p className="mt-1 text-sm text-aurea-gold">
                                {formatMZN(item.price)}
                              </p>
                            </div>
                            <button
                              type="button"
                              aria-label="Remover"
                              className="pressable text-muted hover:text-foreground"
                              onClick={() => removeItem(key)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="mt-3 inline-flex items-center border border-border">
                            <button
                              type="button"
                              className="flex h-10 w-10 items-center justify-center"
                              onClick={() => updateQuantity(key, item.quantity - 1)}
                              aria-label="Diminuir"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                              type="button"
                              className="flex h-10 w-10 items-center justify-center"
                              onClick={() => updateQuantity(key, item.quantity + 1)}
                              aria-label="Aumentar"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {items.length > 0 && (
                <div className="mt-auto space-y-3 border-t border-border p-4">
                  <div className="flex gap-2">
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Cupão de desconto"
                      className="min-h-12 flex-1 border border-border bg-surface px-3 text-sm outline-none focus:border-aurea-gold"
                    />
                    <Button type="button" variant="secondary" onClick={tryCoupon}>
                      Aplicar
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-600">{couponError}</p>
                  )}
                  {couponCode && (
                    <button
                      type="button"
                      className="text-xs text-aurea-gold underline"
                      onClick={clearCoupon}
                    >
                      Remover cupão {couponCode}
                    </button>
                  )}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Subtotal</span>
                      <span>{formatMZN(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-aurea-gold">
                        <span>Desconto</span>
                        <span>-{formatMZN(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted">Entrega (est.)</span>
                      <span>{formatMZN(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 text-base font-medium">
                      <span>Total</span>
                      <span className="text-aurea-gold">{formatMZN(total)}</span>
                    </div>
                  </div>
                  <Button
                    href="/checkout"
                    variant="gold"
                    size="lg"
                    className="w-full"
                    onClick={closeCart}
                  >
                    Finalizar Pedido
                  </Button>
                  <Link
                    href="/loja"
                    onClick={closeCart}
                    className="block text-center text-xs tracking-widest text-muted uppercase"
                  >
                    Continuar a comprar
                  </Link>
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
