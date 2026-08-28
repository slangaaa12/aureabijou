export type ProductBadge = "novo" | "promocao" | "mais_vendido" | "ultimas_unidades";

export type ProductAvailability = "disponivel" | "esgotado" | "sob_encomenda";

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  materials?: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  categorySlug: string;
  images: string[];
  videoUrl?: string;
  colors?: string[];
  sizes?: string[];
  availability: ProductAvailability;
  badges: ProductBadge[];
  active: boolean;
  rating: number;
  reviewCount: number;
  views: number;
  orders: number;
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  order: number;
  active: boolean;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
  approved: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  ctaLabel?: string;
  ctaHref?: string;
  active: boolean;
  order: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
  minSubtotal?: number;
  expiresAt?: string;
}

export interface DeliveryFee {
  id: string;
  name: string;
  fee: number;
  active: boolean;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
}

export type DeliveryMethod = "domicilio" | "retirada" | "transportadora";
export type PaymentMethod = "mpesa" | "emola" | "transferencia";
export type PreferredTime = "manha" | "tarde" | "noite";

export interface CustomerData {
  fullName: string;
  phone: string;
  email?: string;
  city: string;
  neighborhood: string;
  mapsLocation?: string;
  reference?: string;
  province: string;
  postalCode?: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  preferredDate: string;
  preferredTime: PreferredTime;
  notes?: string;
  couponCode?: string;
}

export interface SiteSettings {
  deliveryFees: DeliveryFee[];
  defaultDeliveryFee: number;
  storeAddress?: string;
  whatsappNumber: string;
  promoBanner?: {
    active: boolean;
    text: string;
    href?: string;
  };
}

export interface AdminStats {
  whatsappOrders: number;
  productViews: Record<string, number>;
  productOrders: Record<string, number>;
}
