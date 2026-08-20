"use client";

import { formatMZN } from "@/lib/utils";
import { useCatalogStore } from "@/store/catalog";

export function AdminDashboard() {
  const products = useCatalogStore((s) => s.products);
  const whatsappOrders = useCatalogStore((s) => s.whatsappOrders);
  const active = products.filter((p) => p.active).length;
  const topViews = [...products].sort((a, b) => b.views - a.views).slice(0, 5);
  const topOrders = [...products].sort((a, b) => b.orders - a.orders).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Produtos ativos" value={String(active)} />
        <Stat label="Total produtos" value={String(products.length)} />
        <Stat label="Pedidos WhatsApp" value={String(whatsappOrders)} />
        <Stat
          label="Visualizações"
          value={String(products.reduce((s, p) => s + p.views, 0))}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border border-border bg-background p-4">
          <h2 className="font-display text-xl">Mais vistos</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {topViews.map((p) => (
              <li key={p.id} className="flex justify-between gap-3">
                <span>{p.name}</span>
                <span className="text-muted">{p.views} views</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-border bg-background p-4">
          <h2 className="font-display text-xl">Mais pedidos</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {topOrders.map((p) => (
              <li key={p.id} className="flex justify-between gap-3">
                <span>{p.name}</span>
                <span className="text-muted">
                  {p.orders} · {formatMZN(p.price)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-background p-4">
      <p className="text-[11px] tracking-widest text-muted uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl text-aurea-gold">{value}</p>
    </div>
  );
}
