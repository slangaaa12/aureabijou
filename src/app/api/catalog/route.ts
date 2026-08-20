import { list, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  CATALOG_BLOB_PATH,
  isCatalogSnapshot,
  type CatalogSnapshot,
} from "@/lib/catalog-snapshot";
import {
  banners as seedBanners,
  categories as seedCategories,
  coupons as seedCoupons,
  defaultSettings,
  products as seedProducts,
  reviews as seedReviews,
} from "@/lib/data/seed";
import { DEFAULT_WHATSAPP_NUMBER } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function seedSnapshot(): CatalogSnapshot {
  const envPhone =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER;
  return {
    version: 1,
    updatedAt: new Date(0).toISOString(),
    products: seedProducts,
    categories: seedCategories,
    banners: seedBanners,
    coupons: seedCoupons,
    reviews: seedReviews,
    settings: {
      ...defaultSettings,
      whatsappNumber: envPhone,
    },
    whatsappOrders: 0,
  };
}

async function readRemoteSnapshot(): Promise<CatalogSnapshot | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;

  try {
    const { blobs } = await list({
      prefix: CATALOG_BLOB_PATH,
      limit: 10,
    });
    const match =
      blobs.find((b) => b.pathname === CATALOG_BLOB_PATH) || blobs[0];
    if (!match?.url) return null;

    const res = await fetch(match.url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return isCatalogSnapshot(data) ? data : null;
  } catch (err) {
    console.error("[catalog] read failed", err);
    return null;
  }
}

async function writeRemoteSnapshot(snapshot: CatalogSnapshot) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN em falta");
  }

  await put(CATALOG_BLOB_PATH, JSON.stringify(snapshot), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

export async function GET() {
  const remote = await readRemoteSnapshot();
  const snapshot = remote || seedSnapshot();

  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!isCatalogSnapshot(body) && !(body && typeof body === "object")) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const incoming = body as Partial<CatalogSnapshot>;
  if (
    !Array.isArray(incoming.products) ||
    !Array.isArray(incoming.categories) ||
    !Array.isArray(incoming.banners) ||
    !Array.isArray(incoming.coupons) ||
    !Array.isArray(incoming.reviews) ||
    !incoming.settings
  ) {
    return NextResponse.json({ error: "Catálogo incompleto" }, { status: 400 });
  }

  const snapshot: CatalogSnapshot = {
    version: 1,
    updatedAt: new Date().toISOString(),
    products: incoming.products,
    categories: incoming.categories,
    banners: incoming.banners,
    coupons: incoming.coupons,
    reviews: incoming.reviews,
    settings: incoming.settings,
    whatsappOrders: Number(incoming.whatsappOrders || 0),
  };

  try {
    await writeRemoteSnapshot(snapshot);
  } catch (err) {
    console.error("[catalog] write failed", err);
    return NextResponse.json(
      { error: "Não foi possível guardar o catálogo partilhado." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, updatedAt: snapshot.updatedAt });
}
