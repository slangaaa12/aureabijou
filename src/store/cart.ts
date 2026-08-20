"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Coupon } from "@/lib/types";

interface CartState {
  items: CartItem[];
  couponCode?: string;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => void;
  clearCoupon: () => void;
  getItemKey: (item: Pick<CartItem, "productId" | "color" | "size">) => string;
}

export function cartItemKey(item: Pick<CartItem, "productId" | "color" | "size">) {
  return `${item.productId}::${item.color || ""}::${item.size || ""}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: undefined,
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      getItemKey: cartItemKey,
      addItem: (item) => {
        const key = cartItemKey(item);
        const qty = item.quantity ?? 1;
        set((s) => {
          const existing = s.items.find((i) => cartItemKey(i) === key);
          if (existing) {
            return {
              items: s.items.map((i) =>
                cartItemKey(i) === key
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [...s.items, { ...item, quantity: qty }],
            isOpen: true,
          };
        });
      },
      removeItem: (key) =>
        set((s) => ({
          items: s.items.filter((i) => cartItemKey(i) !== key),
        })),
      updateQuantity: (key, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => cartItemKey(i) !== key)
              : s.items.map((i) =>
                  cartItemKey(i) === key ? { ...i, quantity } : i
                ),
        })),
      clearCart: () => set({ items: [], couponCode: undefined }),
      applyCoupon: (code) => set({ couponCode: code.toUpperCase() }),
      clearCoupon: () => set({ couponCode: undefined }),
    }),
    { name: "aurea-cart" }
  )
);

export function calcCartTotals(
  items: CartItem[],
  coupon: Coupon | undefined,
  deliveryFee: number
) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  let discount = 0;
  if (coupon?.active) {
    const eligible =
      !coupon.minSubtotal || subtotal >= coupon.minSubtotal;
    if (eligible) {
      discount =
        coupon.type === "percent"
          ? Math.round((subtotal * coupon.value) / 100)
          : coupon.value;
    }
  }
  const total = Math.max(0, subtotal - discount + deliveryFee);
  return { subtotal, discount, deliveryFee, total };
}

export function useCartCount() {
  return useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
}
