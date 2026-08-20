"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Banner,
  Category,
  Coupon,
  Product,
  Review,
  SiteSettings,
} from "@/lib/types";
import { DEFAULT_WHATSAPP_NUMBER } from "@/lib/utils";
import {
  banners as seedBanners,
  categories as seedCategories,
  coupons as seedCoupons,
  defaultSettings,
  products as seedProducts,
  reviews as seedReviews,
} from "@/lib/data/seed";

interface CatalogState {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  coupons: Coupon[];
  reviews: Review[];
  settings: SiteSettings;
  whatsappOrders: number;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  upsertProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  upsertCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  upsertBanner: (banner: Banner) => void;
  deleteBanner: (id: string) => void;
  upsertCoupon: (coupon: Coupon) => void;
  deleteCoupon: (id: string) => void;
  addReview: (review: Review) => void;
  updateSettings: (settings: Partial<SiteSettings>) => void;
  incrementViews: (productId: string) => void;
  incrementOrders: (productIds: string[]) => void;
  incrementWhatsAppOrders: () => void;
  resetCatalog: () => void;
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set) => ({
      products: seedProducts,
      categories: seedCategories,
      banners: seedBanners,
      coupons: seedCoupons,
      reviews: seedReviews,
      settings: defaultSettings,
      whatsappOrders: 0,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      upsertProduct: (product) =>
        set((s) => {
          const idx = s.products.findIndex((p) => p.id === product.id);
          if (idx === -1) return { products: [product, ...s.products] };
          const products = [...s.products];
          products[idx] = product;
          return { products };
        }),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      upsertCategory: (category) =>
        set((s) => {
          const idx = s.categories.findIndex((c) => c.id === category.id);
          if (idx === -1) return { categories: [...s.categories, category] };
          const categories = [...s.categories];
          categories[idx] = category;
          return { categories };
        }),
      deleteCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),
      upsertBanner: (banner) =>
        set((s) => {
          const idx = s.banners.findIndex((b) => b.id === banner.id);
          if (idx === -1) return { banners: [...s.banners, banner] };
          const banners = [...s.banners];
          banners[idx] = banner;
          return { banners };
        }),
      deleteBanner: (id) =>
        set((s) => ({ banners: s.banners.filter((b) => b.id !== id) })),
      upsertCoupon: (coupon) =>
        set((s) => {
          const idx = s.coupons.findIndex((c) => c.id === coupon.id);
          if (idx === -1) return { coupons: [...s.coupons, coupon] };
          const coupons = [...s.coupons];
          coupons[idx] = coupon;
          return { coupons };
        }),
      deleteCoupon: (id) =>
        set((s) => ({ coupons: s.coupons.filter((c) => c.id !== id) })),
      addReview: (review) =>
        set((s) => ({ reviews: [review, ...s.reviews] })),
      updateSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),
      incrementViews: (productId) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === productId ? { ...p, views: p.views + 1 } : p
          ),
        })),
      incrementOrders: (productIds) =>
        set((s) => ({
          products: s.products.map((p) =>
            productIds.includes(p.id) ? { ...p, orders: p.orders + 1 } : p
          ),
        })),
      incrementWhatsAppOrders: () =>
        set((s) => ({ whatsappOrders: s.whatsappOrders + 1 })),
      resetCatalog: () =>
        set({
          products: seedProducts,
          categories: seedCategories,
          banners: seedBanners,
          coupons: seedCoupons,
          reviews: seedReviews,
          settings: defaultSettings,
          whatsappOrders: 0,
        }),
    }),
    {
      name: "aurea-catalog",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const envPhone =
            process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER;
          state.settings = {
            ...state.settings,
            whatsappNumber: envPhone,
            promoBanner: defaultSettings.promoBanner,
          };
          const heroBanner = seedBanners.find((b) => b.id === "b1");
          if (heroBanner) {
            state.banners = state.banners.map((b) =>
              b.id === "b1" ? { ...b, image: heroBanner.image } : b
            );
          }
          state.setHydrated(true);
        }
      },
    }
  )
);

export function getActiveProducts(products: Product[]) {
  return products.filter((p) => p.active);
}

export function filterProducts(
  products: Product[],
  opts: {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: "recent" | "price_asc" | "price_desc" | "bestseller" | "promo";
    availability?: string;
  }
) {
  let list = products.filter((p) => p.active);

  if (opts.category) {
    list = list.filter(
      (p) =>
        p.categorySlug === opts.category ||
        (opts.category === "novidades" && p.badges.includes("novo"))
    );
  }

  if (opts.query) {
    const q = opts.query.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categorySlug.includes(q) ||
        String(p.price).includes(q)
    );
  }

  if (opts.minPrice != null) list = list.filter((p) => p.price >= opts.minPrice!);
  if (opts.maxPrice != null) list = list.filter((p) => p.price <= opts.maxPrice!);

  if (opts.availability) {
    list = list.filter((p) => p.availability === opts.availability);
  }

  if (opts.sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
  if (opts.sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
  if (opts.sort === "bestseller") list = [...list].sort((a, b) => b.orders - a.orders);
  if (opts.sort === "recent")
    list = [...list].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );
  if (opts.sort === "promo")
    list = list.filter((p) => p.badges.includes("promocao") || p.compareAtPrice);

  return list;
}
