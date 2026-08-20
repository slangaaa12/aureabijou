"use client";

import { useState } from "react";
import { useCatalogStore } from "@/store/catalog";
import { Button } from "@/components/ui/Button";

export function AdminDelivery() {
  const settings = useCatalogStore((s) => s.settings);
  const updateSettings = useCatalogStore((s) => s.updateSettings);
  const [whatsapp, setWhatsapp] = useState(settings.whatsappNumber);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl">Entrega & Contacto</h2>
      <p className="text-sm text-muted">
        As entregas são grátis. Não é cobrada taxa de entrega no checkout.
      </p>
      <div className="grid gap-3 border border-border bg-background p-4">
        <label className="text-xs tracking-widest text-muted uppercase">
          WhatsApp (258…)
        </label>
        <input
          className="admin-input"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
        />
        <Button
          variant="gold"
          onClick={() =>
            updateSettings({
              whatsappNumber: whatsapp.replace(/\D/g, ""),
              defaultDeliveryFee: 0,
              deliveryFees: [],
            })
          }
        >
          Guardar definições
        </Button>
      </div>
    </div>
  );
}
