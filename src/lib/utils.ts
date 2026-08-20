import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ProductBadge } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMZN(value: number) {
  return new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency: "MZN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function badgeLabel(badge: ProductBadge) {
  const map: Record<ProductBadge, string> = {
    novo: "Novo",
    promocao: "Promoção",
    mais_vendido: "Mais Vendido",
    ultimas_unidades: "Últimas Unidades",
  };
  return map[badge];
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function sanitizeText(input: string, max = 500) {
  return input.replace(/[<>]/g, "").trim().slice(0, max);
}

/** Ex: 258850847136 → +258 85 084 7136 */
export function formatMozWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("258") && digits.length === 12) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  if (digits.length === 9) {
    return `+258 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }
  return phone.startsWith("+") ? phone : `+${digits}`;
}

export const DEFAULT_WHATSAPP_NUMBER = "258850847136";
