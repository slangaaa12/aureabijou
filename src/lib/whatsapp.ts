import type { CartItem, CustomerData } from "./types";
import { formatMZN } from "./utils";

const deliveryLabels: Record<CustomerData["deliveryMethod"], string> = {
  domicilio: "Entrega ao domicílio",
  retirada: "Retirar na loja",
  transportadora: "Transportadora",
};

const paymentLabels: Record<CustomerData["paymentMethod"], string> = {
  dinheiro: "Dinheiro",
  mpesa: "M-Pesa",
  emola: "e-Mola",
  transferencia: "Transferência Bancária",
};

const timeLabels: Record<CustomerData["preferredTime"], string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
};

export function buildWhatsAppMessage(params: {
  customer: CustomerData;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}) {
  const { customer, items, subtotal, deliveryFee, discount, total } = params;

  const productsBlock = items
    .map((item) => {
      const extras = [item.color, item.size].filter(Boolean).join(" · ");
      return [
        `Produto: ${item.name}${extras ? ` (${extras})` : ""}`,
        `Quantidade: ${item.quantity}`,
        `Preço: ${formatMZN(item.price)}`,
        `Subtotal: ${formatMZN(item.price * item.quantity)}`,
      ].join("\n");
    })
    .join("\n\n");

  const address = [
    `Cidade: ${customer.city}`,
    `Bairro: ${customer.neighborhood}`,
    customer.mapsLocation
      ? `Localização (Maps): ${customer.mapsLocation}`
      : null,
    customer.reference ? `Referência: ${customer.reference}` : null,
    `Província: ${customer.province}`,
    customer.postalCode ? `Código Postal: ${customer.postalCode}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const message = [
    "🛍️ NOVO PEDIDO - AUREA",
    "",
    "👤 Cliente:",
    `Nome: ${customer.fullName}`,
    "",
    "📞 Telefone:",
    customer.phone,
    "",
    customer.email ? `📧 Email:\n${customer.email}\n` : "",
    "📍 Endereço:",
    address,
    "",
    "🚚 Entrega:",
    deliveryLabels[customer.deliveryMethod],
    "",
    "💳 Pagamento:",
    paymentLabels[customer.paymentMethod],
    "",
    "📅 Data desejada:",
    customer.preferredDate,
    "",
    "🕒 Horário:",
    timeLabels[customer.preferredTime],
    "",
    "━━━━━━━━━━━━━━━",
    "",
    "🛒 Produtos",
    "",
    productsBlock,
    "",
    "━━━━━━━━━━━━━━━",
    "",
    `Subtotal: ${formatMZN(subtotal)}`,
    discount > 0 ? `Desconto: -${formatMZN(discount)}` : null,
    deliveryFee > 0 ? `Entrega: ${formatMZN(deliveryFee)}` : "Entrega: Grátis",
    `TOTAL: ${formatMZN(total)}`,
    customer.couponCode ? `Cupão: ${customer.couponCode}` : null,
    "",
    "━━━━━━━━━━━━━━━",
    "",
    "📝 Observações:",
    customer.notes?.trim() || "Nenhuma",
    "",
    "Obrigado!",
  ]
    .filter((line) => line !== null)
    .join("\n");

  return message;
}

export function buildWhatsAppUrl(phone: string, message: string) {
  const clean = phone.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
