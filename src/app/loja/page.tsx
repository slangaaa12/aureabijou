import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/ShopClient";

export const metadata: Metadata = {
  title: "Loja",
  description: "Explore anéis, brincos, fios, pulseiras e conjuntos AUREA.",
};

export default function LojaPage() {
  return <ShopClient />;
}
