"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";
import { MOZ_PROVINCES } from "@/lib/data/seed";
import type { CustomerData, DeliveryMethod, PaymentMethod, PreferredTime } from "@/lib/types";
import { formatMZN, sanitizeText } from "@/lib/utils";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { calcCartTotals, useCartStore } from "@/store/cart";
import { useCatalogStore } from "@/store/catalog";
import { cn } from "@/lib/utils";

const steps = ["Dados", "Endereço", "Entrega", "Pagamento", "Resumo"] as const;

const empty: CustomerData = {
  fullName: "",
  phone: "",
  email: "",
  city: "",
  neighborhood: "",
  mapsLocation: "",
  reference: "",
  province: "Maputo Cidade",
  postalCode: "",
  deliveryMethod: "domicilio",
  paymentMethod: "mpesa",
  preferredDate: "",
  preferredTime: "tarde",
  notes: "",
};

export function CheckoutFlow() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const couponCode = useCartStore((s) => s.couponCode);
  const clearCart = useCartStore((s) => s.clearCart);
  const closeCart = useCartStore((s) => s.closeCart);
  const coupons = useCatalogStore((s) => s.coupons);
  const settings = useCatalogStore((s) => s.settings);
  const incrementOrders = useCatalogStore((s) => s.incrementOrders);
  const incrementWhatsAppOrders = useCatalogStore((s) => s.incrementWhatsAppOrders);

  const [step, setStep] = useState(0);
  const [data, setData] = useState<CustomerData>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const coupon = coupons.find(
    (c) => c.active && c.code.toUpperCase() === (couponCode || "").toUpperCase()
  );

  const deliveryFee = 0;

  const totals = calcCartTotals(items, coupon, deliveryFee);

  const setField = <K extends keyof CustomerData>(key: K, value: CustomerData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const validateStep = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!data.fullName.trim()) e.fullName = "Obrigatório";
      if (!data.phone.trim() || data.phone.replace(/\D/g, "").length < 9)
        e.phone = "Telefone inválido";
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        e.email = "Email inválido";
    }
    if (step === 1) {
      if (!data.city.trim()) e.city = "Obrigatório";
      if (!data.neighborhood.trim()) e.neighborhood = "Obrigatório";
      if (!data.province.trim()) e.province = "Obrigatório";
    }
    if (step === 2) {
      if (!data.preferredDate) e.preferredDate = "Escolha uma data";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const confirm = () => {
    const customer: CustomerData = {
      ...data,
      fullName: sanitizeText(data.fullName, 120),
      phone: sanitizeText(data.phone, 30),
      email: data.email ? sanitizeText(data.email, 120) : undefined,
      city: sanitizeText(data.city, 80),
      neighborhood: sanitizeText(data.neighborhood, 80),
      mapsLocation: data.mapsLocation
        ? sanitizeText(data.mapsLocation, 500)
        : undefined,
      reference: data.reference ? sanitizeText(data.reference, 160) : undefined,
      notes: data.notes ? sanitizeText(data.notes, 500) : undefined,
      couponCode: coupon?.code,
    };

    const message = buildWhatsAppMessage({
      customer,
      items,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      discount: totals.discount,
      total: totals.total,
    });

    incrementOrders(items.map((i) => i.productId));
    incrementWhatsAppOrders();
    void fetch("/api/finance/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      }),
    }).catch(() => undefined);
    const url = buildWhatsAppUrl(settings.whatsappNumber, message);
    clearCart();
    closeCart();
    window.open(url, "_blank", "noopener,noreferrer");
    router.push("/loja?pedido=enviado");
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Pedido vazio</h1>
        <p className="mt-2 text-muted">Adicione peças antes de finalizar.</p>
        <Button href="/loja" variant="gold" className="mt-6">
          Ir à Loja
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 pb-10 md:py-10">
      <div className="mb-6 flex justify-center">
        <Logo size="sm" />
      </div>
      <p className="text-[11px] tracking-[0.25em] text-aurea-champagne-soft uppercase text-center">
        Checkout
      </p>
      <h1 className="font-display text-3xl">Finalizar Pedido</h1>

      <div className="mt-6 flex gap-1">
        {steps.map((label, i) => (
          <div key={label} className="flex-1">
            <div
              className={cn(
                "h-1 w-full",
                i <= step ? "bg-aurea-gold" : "bg-border"
              )}
            />
            <p
              className={cn(
                "mt-2 text-[10px] tracking-wide uppercase",
                i === step ? "text-foreground" : "text-muted"
              )}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {step === 0 && (
          <>
            <Field
              label="Nome completo"
              value={data.fullName}
              onChange={(v) => setField("fullName", v)}
              error={errors.fullName}
            />
            <Field
              label="Telefone"
              value={data.phone}
              onChange={(v) => setField("phone", v)}
              error={errors.phone}
              placeholder="84 XXX XXXX"
              inputMode="tel"
            />
            <Field
              label="Email (opcional)"
              value={data.email || ""}
              onChange={(v) => setField("email", v)}
              error={errors.email}
              type="email"
            />
          </>
        )}

        {step === 1 && (
          <>
            <label className="block">
              <span className="mb-1.5 block text-xs tracking-widest text-muted uppercase">
                Província
              </span>
              <select
                value={data.province}
                onChange={(e) => setField("province", e.target.value)}
                className="min-h-12 w-full border border-border bg-surface px-3 text-sm outline-none focus:border-aurea-gold"
              >
                {MOZ_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <Field label="Cidade" value={data.city} onChange={(v) => setField("city", v)} error={errors.city} />
            <Field label="Bairro" value={data.neighborhood} onChange={(v) => setField("neighborhood", v)} error={errors.neighborhood} />
            <Field
              label="Sua localização do Maps / Google Maps (opcional)"
              value={data.mapsLocation || ""}
              onChange={(v) => setField("mapsLocation", v)}
              placeholder="Cole o link do Google Maps"
            />
            <Field label="Ponto de referência" value={data.reference || ""} onChange={(v) => setField("reference", v)} />
            <Field label="Código Postal (opcional)" value={data.postalCode || ""} onChange={(v) => setField("postalCode", v)} />
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-xs tracking-widest text-muted uppercase">Forma de entrega</p>
            {(
              [
                ["domicilio", "Entrega ao domicílio"],
                ["retirada", "Retirar na loja"],
                ["transportadora", "Transportadora"],
              ] as [DeliveryMethod, string][]
            ).map(([value, label]) => (
              <Choice
                key={value}
                active={data.deliveryMethod === value}
                label={label}
                onClick={() => setField("deliveryMethod", value)}
              />
            ))}
            <Field
              label="Data desejada"
              type="date"
              value={data.preferredDate}
              onChange={(v) => setField("preferredDate", v)}
              error={errors.preferredDate}
            />
            <p className="pt-2 text-xs tracking-widest text-muted uppercase">Horário</p>
            {(
              [
                ["manha", "Manhã"],
                ["tarde", "Tarde"],
                ["noite", "Noite"],
              ] as [PreferredTime, string][]
            ).map(([value, label]) => (
              <Choice
                key={value}
                active={data.preferredTime === value}
                label={label}
                onClick={() => setField("preferredTime", value)}
              />
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-xs tracking-widest text-muted uppercase">Pagamento</p>
            {(
              [
                ["dinheiro", "Dinheiro"],
                ["mpesa", "M-Pesa"],
                ["emola", "e-Mola"],
                ["transferencia", "Transferência Bancária"],
              ] as [PaymentMethod, string][]
            ).map(([value, label]) => (
              <Choice
                key={value}
                active={data.paymentMethod === value}
                label={label}
                onClick={() => setField("paymentMethod", value)}
              />
            ))}
            <label className="block pt-2">
              <span className="mb-1.5 block text-xs tracking-widest text-muted uppercase">
                Observações
              </span>
              <textarea
                value={data.notes || ""}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="Ex: Quero embalagem para presente."
                rows={4}
                className="w-full border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-aurea-gold"
              />
            </label>
          </>
        )}

        {step === 4 && (
          <div className="space-y-4 border border-border p-4 text-sm">
            <h2 className="font-display text-xl">Resumo do Pedido</h2>
            <ul className="space-y-2 border-b border-border pb-3">
              {items.map((item) => (
                <li key={`${item.productId}-${item.color}-${item.size}`} className="flex justify-between gap-3">
                  <span>
                    {item.name} × {item.quantity}
                    <span className="block text-xs text-muted">
                      {formatMZN(item.price)} un.
                    </span>
                  </span>
                  <span>{formatMZN(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-1">
              <Row label="Subtotal" value={formatMZN(totals.subtotal)} />
              {totals.discount > 0 && (
                <Row label="Desconto" value={`-${formatMZN(totals.discount)}`} />
              )}
              <Row label="Entrega" value="Grátis" />
              <Row label="Total" value={formatMZN(totals.total)} strong />
            </div>
            <div className="space-y-1 border-t border-border pt-3 text-muted">
              <p>
                <span className="text-foreground">Nome:</span> {data.fullName}
              </p>
              <p>
                <span className="text-foreground">Telefone:</span> {data.phone}
              </p>
              <p>
                <span className="text-foreground">Endereço:</span>{" "}
                {[data.neighborhood, data.city, data.province]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {data.mapsLocation && (
                <p>
                  <span className="text-foreground">Localização (Maps):</span>{" "}
                  {data.mapsLocation}
                </p>
              )}
              {data.reference && (
                <p>
                  <span className="text-foreground">Referência:</span>{" "}
                  {data.reference}
                </p>
              )}
              <p>
                <span className="text-foreground">Entrega:</span> {data.deliveryMethod}
              </p>
              <p>
                <span className="text-foreground">Pagamento:</span> {data.paymentMethod}
              </p>
              <p>
                <span className="text-foreground">Data:</span> {data.preferredDate} ({data.preferredTime})
              </p>
              {data.notes && (
                <p>
                  <span className="text-foreground">Obs:</span> {data.notes}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <Button variant="secondary" className="flex-1" onClick={() => setStep((s) => s - 1)}>
            Voltar
          </Button>
        )}
        {step < steps.length - 1 ? (
          <Button variant="gold" className="flex-1" onClick={next}>
            Continuar
          </Button>
        ) : (
          <Button variant="gold" className="flex-1" onClick={confirm}>
            Confirmar Pedido
          </Button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs tracking-widest text-muted uppercase">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className={cn(
          "min-h-12 w-full border bg-surface px-3 text-sm outline-none focus:border-aurea-gold",
          error ? "border-red-500" : "border-border"
        )}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function Choice({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "pressable flex min-h-12 w-full items-center border px-4 text-left text-sm",
        active ? "border-aurea-gold text-aurea-gold" : "border-border"
      )}
    >
      {label}
    </button>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={cn("flex justify-between", strong && "text-base font-medium text-aurea-gold")}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
