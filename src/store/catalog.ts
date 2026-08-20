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
import type { CatalogSnapshot } from "@/lib/catalog-snapshot";
import { DEFAULT_WHATSAPP_NUMBER } from "@/lib/utils";
import {
  banners as seedBanners,
  categories as seedCategories,
  coupons as seedCoupons,
  defaultSettings,
  products as seedProducts,
  reviews as seedReviews,
} from "@/lib/data/seed";

type SyncStatus = "idle" | "loading" | "ready" | "error" | "saving";

interface CatalogState {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  coupons: Coupon[];
  reviews: Review[];
  settings: SiteSettings;
  whatsappOrders: number;
  hydrated: boolean;
  syncStatus: SyncStatus;
  remoteUpdatedAt: string | null;
  setHydrated: (v: boolean) => void;
  setSyncStatus: (v: SyncStatus) => void;
  replaceCatalog: (snapshot: Partial<CatalogSnapshot>) => void;
  syncToRemote: () => Promise<boolean>;
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

let syncTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleRemoteSync() {
  if (typeof window === "undefined") return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    void useCatalogStore.getState().syncToRemote();
  }, 400);
}

function buildSnapshot(state: CatalogState): CatalogSnapshot {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    products: state.products,
    categories: state.categories,
    banners: state.banners,
    coupons: state.coupons,
    reviews: state.reviews,
    settings: state.settings,
    whatsappOrders: state.whatsappOrders,
  };
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      products: seedProducts,
      categories: seedCategories,
      banners: seedBanners,
      coupons: seedCoupons,
      reviews: seedReviews,
      settings: defaultSettings,
      whatsappOrders: 0,
      hydrated: false,
      syncStatus: "idle",
      remoteUpdatedAt: null,
      setHydrated: (v) => set({ hydrated: v }),
      setSyncStatus: (v) => set({ syncStatus: v }),
      replaceCatalog: (snapshot) =>
        set((s) => ({
          products: snapshot.products ?? s.products,
          categories: snapshot.categories ?? s.categories,
          banners: snapshot.banners ?? s.banners,
          coupons: snapshot.coupons ?? s.coupons,
          reviews: snapshot.reviews ?? s.reviews,
          settings: {
            ...s.settings,
            ...(snapshot.settings || {}),
            whatsappNumber:
              process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
              snapshot.settings?.whatsappNumber ||
              s.settings.whatsappNumber ||
              DEFAULT_WHATSAPP_NUMBER,
            // Entregas são sempre grátis
            defaultDeliveryFee: 0,
            deliveryFees: [],
          },
          whatsappOrders: snapshot.whatsappOrders ?? s.whatsappOrders,
          remoteUpdatedAt: snapshot.updatedAt ?? s.remoteUpdatedAt,
        })),
      syncToRemote: async () => {
        const state = get();
        set({ syncStatus: "saving" });
        try {
          const res = await fetch("/api/catalog", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildSnapshot(state)),
          });
          if (!res.ok) {
            set({ syncStatus: "error" });
            return false;
          }
          const data = (await res.json().catch(() => ({}))) as {
            updatedAt?: string;
          };
          set({
            syncStatus: "ready",
            remoteUpdatedAt: data.updatedAt || new Date().toISOString(),
          });
          return true;
        } catch {
          set({ syncStatus: "error" });
          return false;
        }
      },
      upsertProduct: (product) => {
        set((s) => {
          const idx = s.products.findIndex((p) => p.id === product.id);
          if (idx === -1) return { products: [product, ...s.products] };
          const products = [...s.products];
          products[idx] = product;
          return { products };
        });
        scheduleRemoteSync();
      },
      deleteProduct: (id) => {
        set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
        scheduleRemoteSync();
      },
      upsertCategory: (category) => {
        set((s) => {
          const idx = s.categories.findIndex((c) => c.id === category.id);
          if (idx === -1) return { categories: [...s.categories, category] };
          const categories = [...s.categories];
          categories[idx] = category;
          return { categories };
        });
        scheduleRemoteSync();
      },
      deleteCategory: (id) => {
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
        scheduleRemoteSync();
      },
      upsertBanner: (banner) => {
        set((s) => {
          const idx = s.banners.findIndex((b) => b.id === banner.id);
          if (idx === -1) return { banners: [...s.banners, banner] };
          const banners = [...s.banners];
          banners[idx] = banner;
          return { banners };
        });
        scheduleRemoteSync();
      },
      deleteBanner: (id) => {
        set((s) => ({ banners: s.banners.filter((b) => b.id !== id) }));
        scheduleRemoteSync();
      },
      upsertCoupon: (coupon) => {
        set((s) => {
          const idx = s.coupons.findIndex((c) => c.id === coupon.id);
          if (idx === -1) return { coupons: [...s.coupons, coupon] };
          const coupons = [...s.coupons];
          coupons[idx] = coupon;
          return { coupons };
        });
        scheduleRemoteSync();
      },
      deleteCoupon: (id) => {
        set((s) => ({ coupons: s.coupons.filter((c) => c.id !== id) }));
        scheduleRemoteSync();
      },
      incrementViews: (productId) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === productId ? { ...p, views: p.views + 1 } : p
          ),
        })),
      incrementOrders: (productIds) => {
        set((s) => ({
          products: s.products.map((p) =>
            productIds.includes(p.id) ? { ...p, orders: p.orders + 1 } : p
          ),
        }));
      },
      incrementWhatsAppOrders: () => {
        set((s) => ({ whatsappOrders: s.whatsappOrders + 1 }));
      },
      addReview: (review) => {
        set((s) => ({ reviews: [review, ...s.reviews] }));
      },
      updateSettings: (partial) => {
        set((s) => ({ settings: { ...s.settings, ...partial } }));
        scheduleRemoteSync();
      },
      resetCatalog: () => {
        set({
          products: seedProducts,
          categories: seedCategories,
          banners: seedBanners,
          coupons: seedCoupons,
          reviews: seedReviews,
          settings: defaultSettings,
          whatsappOrders: 0,
        });
        scheduleRemoteSync();
      },
    }),
    {
      name: "aurea-catalog",
      partialize: (state) => ({
        products: state.products,
        categories: state.categories,
        banners: state.banners,
        coupons: state.coupons,
        reviews: state.reviews,
        settings: state.settings,
        whatsappOrders: state.whatsappOrders,
        remoteUpdatedAt: state.remoteUpdatedAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const envPhone =
            process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER;
          state.settings = {
            ...state.settings,
            whatsappNumber: envPhone,
            defaultDeliveryFee: 0,
            deliveryFees: [],
          };
          // hydrated fica true só depois do CatalogSync carregar o remoto
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
