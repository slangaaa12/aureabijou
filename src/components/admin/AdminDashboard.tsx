"use client";

import { useEffect, useMemo, useState } from "react";
import { formatMZN } from "@/lib/utils";
import { useCatalogStore } from "@/store/catalog";
import { saleSourceLabel, useFinanceStore } from "@/store/finance";
import {
  computeFinanceTotals,
  computeProductRows,
  saleTotals,
} from "@/lib/finance-snapshot";
import { Button } from "@/components/ui/Button";

function formatPct(value: number | null) {
  if (value == null) return "—";
  return `${value.toFixed(1)}%`;
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("pt-MZ", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function AdminDashboard() {
  const products = useCatalogStore((s) => s.products);
  const sales = useFinanceStore((s) => s.sales);
  const productCosts = useFinanceStore((s) => s.productCosts);
  const setProductCost = useFinanceStore((s) => s.setProductCost);
  const addSale = useFinanceStore((s) => s.addSale);
  const deleteSale = useFinanceStore((s) => s.deleteSale);
  const hydrated = useFinanceStore((s) => s.hydrated);

  const [productId, setProductId] = useState(products[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(products[0]?.price || 0);
  const [note, setNote] = useState("");
  const [costDraft, setCostDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!productId && products[0]) {
      setProductId(products[0].id);
      setUnitPrice(products[0].price);
    }
  }, [productId, products]);

  const selected = products.find((p) => p.id === productId);

  const namesById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p.name])),
    [products]
  );

  const totals = useMemo(() => computeFinanceTotals(sales), [sales]);
  const productRows = useMemo(
    () => computeProductRows(sales, namesById),
    [sales, namesById]
  );

  const onSelectProduct = (id: string) => {
    setProductId(id);
    const p = products.find((item) => item.id === id);
    if (p) setUnitPrice(p.price);
  };

  const addOfflineSale = () => {
    const product = products.find((p) => p.id === productId);
    if (!product || quantity < 1) return;
    addSale({
      source: "manual",
      note: note.trim() || undefined,
      items: [
        {
          productId: product.id,
          name: product.name,
          quantity,
          unitPrice: Math.max(0, Number(unitPrice) || 0),
          unitCost: Math.max(0, Number(productCosts[product.id]) || 0),
        },
      ],
    });
    setNote("");
    setQuantity(1);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl">Gestão financeira</h2>
        <p className="mt-1 text-sm text-muted">
          Lucro líquido = dinheiro que entrou − gastos por produto. As vendas
          começam a zero; pode registar também vendas feitas fora do site.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="Vendas" value={String(totals.salesCount)} />
        <Stat label="Peças vendidas" value={String(totals.unitsSold)} />
        <Stat label="Receita bruta" value={formatMZN(totals.grossProfit)} />
        <Stat label="Gastos (produtos)" value={formatMZN(totals.costs)} />
        <Stat label="Lucro líquido" value={formatMZN(totals.netProfit)} />
        <Stat label="ROI" value={formatPct(totals.roiPct)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="border border-border bg-background p-4">
          <h3 className="font-display text-xl">Adicionar venda fora do site</h3>
          <p className="mt-1 text-xs text-muted">
            Use para loja física, Instagram, WhatsApp direto, etc.
          </p>
          <div className="mt-4 grid gap-3">
            <select
              className="admin-input"
              value={productId}
              onChange={(e) => onSelectProduct(e.target.value)}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                className="admin-input"
                type="number"
                min={1}
                placeholder="Quantidade"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
              <input
                className="admin-input"
                type="number"
                min={0}
                placeholder="Preço unitário"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
              />
            </div>
            <input
              className="admin-input"
              placeholder="Nota (opcional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            {selected && (
              <p className="text-xs text-muted">
                Custo unitário atual:{" "}
                {formatMZN(productCosts[selected.id] || 0)} · Lucro desta
                venda:{" "}
                {formatMZN(
                  quantity * unitPrice -
                    quantity * (productCosts[selected.id] || 0)
                )}
              </p>
            )}
            <Button variant="gold" onClick={addOfflineSale}>
              Registar venda
            </Button>
          </div>
        </section>

        <section className="border border-border bg-background p-4">
          <h3 className="font-display text-xl">Gastos por produto</h3>
          <p className="mt-1 text-xs text-muted">
            Custo de aquisição de cada peça. É este valor que entra no cálculo
            do lucro.
          </p>
          <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto">
            {products.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 border-b border-border py-2 text-sm last:border-0"
              >
                <span className="min-w-0 flex-1 truncate">{p.name}</span>
                <input
                  className="admin-input w-28 shrink-0"
                  type="number"
                  min={0}
                  value={
                    costDraft[p.id] ??
                    (productCosts[p.id] != null ? String(productCosts[p.id]) : "")
                  }
                  placeholder="0"
                  onChange={(e) =>
                    setCostDraft((d) => ({ ...d, [p.id]: e.target.value }))
                  }
                  onBlur={(e) => {
                    setProductCost(p.id, Number(e.target.value) || 0);
                    setCostDraft((d) => {
                      const next = { ...d };
                      delete next[p.id];
                      return next;
                    });
                  }}
                />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="border border-border bg-background p-4">
        <h3 className="font-display text-xl">Lucro por produto</h3>
        {!hydrated ? (
          <p className="mt-3 text-sm text-muted">A carregar…</p>
        ) : productRows.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Ainda não há vendas registadas.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-[11px] tracking-widest text-muted uppercase">
                <tr>
                  <th className="py-2 font-medium">Produto</th>
                  <th className="py-2 font-medium">Qtd</th>
                  <th className="py-2 font-medium">Receita</th>
                  <th className="py-2 font-medium">Gastos</th>
                  <th className="py-2 font-medium">Lucro</th>
                </tr>
              </thead>
              <tbody>
                {productRows.map((row) => (
                  <tr key={row.productId} className="border-t border-border">
                    <td className="py-2">{row.name}</td>
                    <td className="py-2 tabular-nums">{row.unitsSold}</td>
                    <td className="py-2 tabular-nums">{formatMZN(row.revenue)}</td>
                    <td className="py-2 tabular-nums">{formatMZN(row.costs)}</td>
                    <td className="py-2 tabular-nums text-aurea-gold">
                      {formatMZN(row.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="border border-border bg-background p-4">
        <h3 className="font-display text-xl">Histórico de vendas</h3>
        {sales.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nenhuma venda ainda.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {sales.map((sale) => {
              const t = saleTotals(sale);
              return (
                <li key={sale.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm">
                      {sale.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
                    </p>
                    <p className="text-xs text-muted">
                      {formatDate(sale.createdAt)} · {saleSourceLabel(sale.source)}
                      {sale.note ? ` · ${sale.note}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm tabular-nums text-aurea-gold">
                      {formatMZN(t.revenue - t.costs)}
                    </span>
                    <button
                      type="button"
                      className="text-xs tracking-wide text-red-600 uppercase"
                      onClick={() => deleteSale(sale.id)}
                    >
                      Apagar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-background p-4">
      <p className="text-[11px] tracking-widest text-muted uppercase">{label}</p>
      <p className="mt-2 font-display text-2xl text-aurea-gold md:text-3xl">{value}</p>
    </div>
  );
}
