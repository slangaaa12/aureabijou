export const FINANCE_BLOB_PATH = "finance/state.json";

export type SaleSource = "site" | "manual";

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

export interface Sale {
  id: string;
  createdAt: string;
  source: SaleSource;
  note?: string;
  items: SaleItem[];
}

export interface FinanceSnapshot {
  version: 1;
  updatedAt: string;
  /** Custo unitário de aquisição por produto */
  productCosts: Record<string, number>;
  sales: Sale[];
}

export interface FinanceTotals {
  salesCount: number;
  unitsSold: number;
  revenue: number;
  costs: number;
  grossProfit: number;
  netProfit: number;
  roiPct: number | null;
}

export interface ProductFinanceRow {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
  costs: number;
  profit: number;
}

export function emptyFinanceSnapshot(): FinanceSnapshot {
  return {
    version: 1,
    updatedAt: new Date(0).toISOString(),
    productCosts: {},
    sales: [],
  };
}

export function isFinanceSnapshot(value: unknown): value is FinanceSnapshot {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.version === 1 &&
    typeof v.productCosts === "object" &&
    v.productCosts !== null &&
    Array.isArray(v.sales)
  );
}

export function saleTotals(sale: Sale) {
  return sale.items.reduce(
    (acc, item) => {
      const qty = Math.max(0, Number(item.quantity) || 0);
      acc.revenue += qty * (Number(item.unitPrice) || 0);
      acc.costs += qty * (Number(item.unitCost) || 0);
      acc.units += qty;
      return acc;
    },
    { revenue: 0, costs: 0, units: 0 }
  );
}

export function computeFinanceTotals(sales: Sale[]): FinanceTotals {
  const base = sales.reduce(
    (acc, sale) => {
      const t = saleTotals(sale);
      acc.salesCount += 1;
      acc.unitsSold += t.units;
      acc.revenue += t.revenue;
      acc.costs += t.costs;
      return acc;
    },
    { salesCount: 0, unitsSold: 0, revenue: 0, costs: 0 }
  );

  const netProfit = base.revenue - base.costs;
  return {
    ...base,
    grossProfit: base.revenue,
    netProfit,
    roiPct: base.costs > 0 ? (netProfit / base.costs) * 100 : null,
  };
}

export function computeProductRows(
  sales: Sale[],
  namesById: Record<string, string>
): ProductFinanceRow[] {
  const map = new Map<string, ProductFinanceRow>();

  for (const sale of sales) {
    for (const item of sale.items) {
      const qty = Math.max(0, Number(item.quantity) || 0);
      const revenue = qty * (Number(item.unitPrice) || 0);
      const costs = qty * (Number(item.unitCost) || 0);
      const current = map.get(item.productId) || {
        productId: item.productId,
        name: namesById[item.productId] || item.name,
        unitsSold: 0,
        revenue: 0,
        costs: 0,
        profit: 0,
      };
      current.unitsSold += qty;
      current.revenue += revenue;
      current.costs += costs;
      current.profit = current.revenue - current.costs;
      current.name = namesById[item.productId] || current.name;
      map.set(item.productId, current);
    }
  }

  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
}
