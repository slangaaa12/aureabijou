import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";

export const metadata: Metadata = {
  title: "Finalizar Pedido",
  description: "Complete os seus dados e envie o pedido pelo WhatsApp.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutFlow />;
}
