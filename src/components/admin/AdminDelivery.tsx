"use client";

import { useState } from "react";
import { formatMZN } from "@/lib/utils";
import { useCatalogStore } from "@/store/catalog";
import { Button } from "@/components/ui/Button";

export function AdminDelivery() {
  const settings = useCatalogStore((s) => s.settings);
  const updateSettings = useCatalogStore((s) => s.updateSettings);
  const [name, setName] = useState("");
  const [fee, setFee] = useState(150);
  const [whatsapp, setWhatsapp] = useState(settings.whatsappNumber);
  const [defaultFee, setDefaultFee] = useState(settings.defaultDeliveryFee);

  const addFee = () => {
    if (!name.trim()) return;
    updateSettings({
      deliveryFees: [
        ...settings.deliveryFees,
        { id: `df-${Date.now()}`, name, fee, active: true },
      ],
    });
    setName("");
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl">Entrega & Contacto</h2>
      <div className="grid gap-3 border border-border bg-background p-4">
        <label className="text-xs tracking-widest text-muted uppercase">WhatsApp (258…)</label>
        <input className="admin-input" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        <label className="text-xs tracking-widest text-muted uppercase">Taxa padrão</label>
        <input className="admin-input" type="number" value={defaultFee} onChange={(e) => setDefaultFee(Number(e.target.value))} />
        <Button
          variant="gold"
          onClick={() =>
            updateSettings({
              whatsappNumber: whatsapp.replace(/\D/g, ""),
              defaultDeliveryFee: defaultFee,
            })
          }
        >
          Guardar definições
        </Button>
      </div>

      <div className="grid gap-3 border border-border bg-background p-4 md:grid-cols-3">
        <input className="admin-input" placeholder="Zona (ex: Maputo)" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="admin-input" type="number" placeholder="Taxa" value={fee} onChange={(e) => setFee(Number(e.target.value))} />
        <Button variant="secondary" onClick={addFee}>Adicionar taxa</Button>
      </div>

      <ul className="divide-y divide-border border border-border bg-background">
        {settings.deliveryFees.map((f) => (
          <li key={f.id} className="flex justify-between p-3 text-sm">
            <span>{f.name}</span>
            <span className="text-aurea-gold">{formatMZN(f.fee)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
