import type {
  Banner,
  Category,
  Coupon,
  Product,
  Review,
  SiteSettings,
} from "@/lib/types";

export const CATALOG_BLOB_PATH = "catalog/state.json";

export interface CatalogSnapshot {
  version: 1;
  updatedAt: string;
  products: Product[];
  categories: Category[];
  banners: Banner[];
  coupons: Coupon[];
  reviews: Review[];
  settings: SiteSettings;
  whatsappOrders: number;
}

export function isCatalogSnapshot(value: unknown): value is CatalogSnapshot {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.products) &&
    Array.isArray(v.categories) &&
    Array.isArray(v.banners) &&
    Array.isArray(v.coupons) &&
    Array.isArray(v.reviews) &&
    typeof v.settings === "object" &&
    v.settings !== null
  );
}
