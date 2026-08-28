import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  isFinanceSnapshot,
  type FinanceSnapshot,
  type Sale,
} from "@/lib/finance-snapshot";
import {
  readFinanceSnapshot,
  writeFinanceSnapshot,
} from "@/lib/finance-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeSnapshot(incoming: Partial<FinanceSnapshot>): FinanceSnapshot {
  const productCosts: Record<string, number> = {};
  const rawCosts = incoming.productCosts || {};
  for (const [id, value] of Object.entries(rawCosts)) {
    const n = Number(value);
    if (id && Number.isFinite(n) && n >= 0) productCosts[id] = n;
  }

  const sales: Sale[] = Array.isArray(incoming.sales)
    ? incoming.sales
        .filter((sale) => sale && Array.isArray(sale.items))
        .map((sale) => ({
          id: String(sale.id || `sale-${Date.now()}`),
          createdAt: sale.createdAt || new Date().toISOString(),
          source: sale.source === "site" ? "site" as const : "manual" as const,
          note: sale.note ? String(sale.note).slice(0, 200) : undefined,
          items: sale.items
            .filter((item) => item && item.productId)
            .map((item) => ({
              productId: String(item.productId),
              name: String(item.name || "Produto"),
              quantity: Math.max(1, Math.min(999, Number(item.quantity) || 1)),
              unitPrice: Math.max(0, Number(item.unitPrice) || 0),
              unitCost: Math.max(0, Number(item.unitCost) || 0),
            })),
        }))
        .filter((sale) => sale.items.length > 0)
    : [];

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    productCosts,
    sales,
  };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const snapshot = await readFinanceSnapshot();
  return NextResponse.json(snapshot, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const snapshot = isFinanceSnapshot(body)
    ? sanitizeSnapshot(body)
    : sanitizeSnapshot(body as Partial<FinanceSnapshot>);

  try {
    await writeFinanceSnapshot(snapshot);
  } catch (err) {
    console.error("[finance] write failed", err);
    return NextResponse.json(
      { error: "Não foi possível guardar as finanças." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, updatedAt: snapshot.updatedAt });
}
