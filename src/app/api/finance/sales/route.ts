import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { CATALOG_BLOB_PATH, isCatalogSnapshot } from "@/lib/catalog-snapshot";
import { products as seedProducts } from "@/lib/data/seed";
import type { Product } from "@/lib/types";
import type { Sale, SaleItem } from "@/lib/finance-snapshot";
import {
  readFinanceSnapshot,
  writeFinanceSnapshot,
} from "@/lib/finance-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ITEMS = 20;
const MAX_QTY = 20;

async function loadCatalogProducts(): Promise<Product[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return seedProducts;
  try {
    const { blobs } = await list({ prefix: CATALOG_BLOB_PATH, limit: 10 });
    const match =
      blobs.find((b) => b.pathname === CATALOG_BLOB_PATH) || blobs[0];
    if (!match?.url) return seedProducts;
    const res = await fetch(match.url, { cache: "no-store" });
    if (!res.ok) return seedProducts;
    const data = await res.json();
    return isCatalogSnapshot(data) ? data.products : seedProducts;
  } catch {
    return seedProducts;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const items = Array.isArray(body?.items) ? body.items : [];
  if (!items.length || items.length > MAX_ITEMS) {
    return NextResponse.json({ error: "Itens inválidos" }, { status: 400 });
  }

  const products = await loadCatalogProducts();
  const byId = new Map(products.map((p) => [p.id, p]));
  const finance = await readFinanceSnapshot();

  const saleItems: SaleItem[] = [];
  for (const raw of items) {
    const productId = String(raw?.productId || "");
    const product = byId.get(productId);
    if (!product) continue;
    const quantity = Math.max(1, Math.min(MAX_QTY, Number(raw?.quantity) || 1));
    saleItems.push({
      productId: product.id,
      name: product.name,
      quantity,
      unitPrice: Math.max(0, Number(product.price) || 0),
      unitCost: Math.max(0, Number(finance.productCosts[product.id]) || 0),
    });
  }

  if (!saleItems.length) {
    return NextResponse.json({ error: "Nenhum produto válido" }, { status: 400 });
  }

  const sale: Sale = {
    id: `sale-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    source: "site",
    items: saleItems,
  };

  try {
    await writeFinanceSnapshot({
      ...finance,
      version: 1,
      updatedAt: new Date().toISOString(),
      sales: [sale, ...finance.sales],
    });
  } catch (err) {
    console.error("[finance] sale write failed", err);
    return NextResponse.json(
      { error: "Não foi possível registar a venda." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: sale.id });
}
