export const PAYMENT_PROOF_WHATSAPP = "258850847136";
export const PAYMENT_PROOF_WHATSAPP_DISPLAY = "+258 85 084 7136";

export const PAYMENT_DETAILS = [
  {
    method: "mpesa" as const,
    title: "M-Pesa",
    lines: ["85 084 7136 — Shelton Arlindo Langa"],
  },
  {
    method: "emola" as const,
    title: "e-Mola",
    lines: ["87 304 6853 — Shelton Arlindo Langa"],
  },
  {
    method: "transferencia" as const,
    title: "Transferência bancária",
    lines: ["FNB: 3459768710001", "BCI: 25186690310001"],
  },
];

export const paymentLabels = {
  mpesa: "M-Pesa",
  emola: "e-Mola",
  transferencia: "Transferência Bancária",
} as const;

export function proofWhatsAppUrl() {
  return `https://wa.me/${PAYMENT_PROOF_WHATSAPP}`;
}
