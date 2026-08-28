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
  const removeProductCost = useFinanceStore((s) => s.removeProductCost);
  const addSale = useFinanceStore((s) => s.addSale);
  const deleteSale = useFinanceStore((s) => s.deleteSale);
  const hydrated = useFinanceStore((s) => s.hydrated);
  const syncStatus = useFinanceStore((s) => s.syncStatus);

  const [productId, setProductId] = useState(products[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(products[0]?.price || 0);
  const [note, setNote] = useState("");
  const [costProductId, setCostProductId] = useState(products[0]?.id || "");
  const [costAmount, setCostAmount] = useState("");
  const [costMessage, setCostMessage] = useState("");
  const [editingCost, setEditingCost] = useState(false);

  useEffect(() => {
    if (!productId && products[0]) {
      setProductId(products[0].id);
      setUnitPrice(products[0].price);
    }
    if (!costProductId && products[0]) {
      setCostProductId(products[0].id);
    }
  }, [productId, costProductId, products]);

  const selected = products.find((p) => p.id === productId);

  const namesById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p.name])),
    [products]
  );

  const totals = useMemo(
    () => computeFinanceTotals(sales, productCosts),
    [sales, productCosts]
  );
  const productRows = useMemo(
    () => computeProductRows(sales, namesById, productCosts),
    [sales, namesById, productCosts]
  );

  const costEntries = useMemo(
    () =>
      Object.entries(productCosts)
        .map(([id, amount]) => ({
          id,
          name: namesById[id] || "Produto removido",
          amount,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "pt")),
    [productCosts, namesById]
  );

  const existingCost = costProductId
    ? productCosts[costProductId]
    : undefined;

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
          unitCost: 0,
        },
      ],
    });
    setNote("");
    setQuantity(1);
  };

  const saveProductCost = () => {
    const product = products.find((p) => p.id === costProductId);
    const amount = Number(costAmount);
    if (!product) {
      setCostMessage("Escolha um produto.");
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      setCostMessage("Indique um valor de gasto válido.");
      return;
    }
    setProductCost(product.id, amount);
    setEditingCost(true);
    setCostAmount(String(amount));
    setCostMessage(
      productCosts[product.id] != null
        ? `Gasto de ${product.name} atualizado para ${formatMZN(amount)}.`
        : `Gasto de ${product.name} adicionado: ${formatMZN(amount)}.`
    );
  };

  const startEditCost = (id: string, amount: number) => {
    setCostProductId(id);
    setCostAmount(String(amount));
    setEditingCost(true);
    setCostMessage("");
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
                Gasto geral deste produto:{" "}
                {formatMZN(productCosts[selected.id] || 0)}
              </p>
            )}
            <Button variant="gold" onClick={addOfflineSale}>
              Registar venda
            </Button>
          </div>
        </section>

        <section className="border border-border bg-background p-4">
          <h3 className="font-display text-xl">Gastos gerais por produto</h3>
          <p className="mt-1 text-xs text-muted">
            Adicione o investimento de cada produto e edite depois se o gasto
            aumentar. O lucro = dinheiro que entrou − estes gastos.
          </p>
          <div className="mt-4 grid gap-3">
            <select
              className="admin-input"
              value={costProductId}
              onChange={(e) => {
                const id = e.target.value;
                setCostProductId(id);
                const current = productCosts[id];
                setEditingCost(current != null);
                setCostAmount(current != null ? String(current) : "");
                setCostMessage("");
              }}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {productCosts[p.id] != null
                    ? ` · atual ${formatMZN(productCosts[p.id])}`
                    : ""}
                </option>
              ))}
            </select>
            <input
              className="admin-input"
              type="number"
              min={0}
              step="1"
              inputMode="numeric"
              placeholder="Valor do gasto (MZN)"
              value={costAmount}
              onChange={(e) => setCostAmount(e.target.value)}
            />
            {existingCost != null && !editingCost && (
              <p className="text-xs text-muted">
                Já existe um gasto de {formatMZN(existingCost)}. Guardar vai
                atualizar esse valor.
              </p>
            )}
            <Button variant="gold" onClick={saveProductCost}>
              {existingCost != null || editingCost
                ? "Atualizar gasto"
                : "Adicionar gasto"}
            </Button>
            {costMessage && (
              <p className="text-sm text-aurea-gold">{costMessage}</p>
            )}
            {syncStatus === "error" && (
              <p className="text-sm text-red-600">
                Não foi possível sincronizar. Tente guardar outra vez.
              </p>
            )}
          </div>

          {costEntries.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              Ainda não há gastos registados.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border border-t border-border">
              {costEntries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm">{entry.name}</p>
                    <p className="text-xs text-muted tabular-nums">
                      {formatMZN(entry.amount)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <button
                      type="button"
                      className="text-xs tracking-wide uppercase text-aurea-gold"
                      onClick={() => startEditCost(entry.id, entry.amount)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="text-xs tracking-wide text-red-600 uppercase"
                      onClick={() => {
                        removeProductCost(entry.id);
                        if (costProductId === entry.id) {
                          setCostAmount("");
                          setEditingCost(false);
                        }
                        setCostMessage("Gasto removido.");
                      }}
                    >
                      Apagar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
