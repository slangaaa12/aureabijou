"use client";

import { useState } from "react";
import type { Coupon } from "@/lib/types";
import { useCatalogStore } from "@/store/catalog";
import { Button } from "@/components/ui/Button";

export function AdminCoupons() {
  const coupons = useCatalogStore((s) => s.coupons);
  const upsertCoupon = useCatalogStore((s) => s.upsertCoupon);
  const deleteCoupon = useCatalogStore((s) => s.deleteCoupon);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState(10);
  const [minSubtotal, setMinSubtotal] = useState(0);

  const save = () => {
    if (!code.trim()) return;
    const coupon: Coupon = {
      id: `c-${Date.now()}`,
      code: code.toUpperCase(),
      type,
      value,
      active: true,
      minSubtotal: minSubtotal || undefined,
    };
    upsertCoupon(coupon);
    setCode("");
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl">Cupões</h2>
      <div className="grid gap-3 border border-border bg-background p-4 md:grid-cols-2">
        <input className="admin-input" placeholder="Código" value={code} onChange={(e) => setCode(e.target.value)} />
        <select className="admin-input" value={type} onChange={(e) => setType(e.target.value as "percent" | "fixed")}>
          <option value="percent">Percentagem</option>
          <option value="fixed">Valor fixo</option>
        </select>
        <input className="admin-input" type="number" placeholder="Valor" value={value} onChange={(e) => setValue(Number(e.target.value))} />
        <input className="admin-input" type="number" placeholder="Mínimo subtotal" value={minSubtotal} onChange={(e) => setMinSubtotal(Number(e.target.value))} />
        <Button variant="gold" onClick={save}>Adicionar cupão</Button>
      </div>
      <ul className="divide-y divide-border border border-border bg-background">
        {coupons.map((c) => (
          <li key={c.id} className="flex justify-between gap-3 p-3 text-sm">
            <div>
              <p className="font-medium">{c.code}</p>
              <p className="text-xs text-muted">
                {c.type === "percent" ? `${c.value}%` : `${c.value} MZN`} · {c.active ? "Ativo" : "Inativo"}
              </p>
            </div>
            <div className="flex gap-3">
              <button type="button" className="text-aurea-gold" onClick={() => upsertCoupon({ ...c, active: !c.active })}>
                {c.active ? "Desativar" : "Ativar"}
              </button>
              <button type="button" className="text-red-600" onClick={() => deleteCoupon(c.id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
