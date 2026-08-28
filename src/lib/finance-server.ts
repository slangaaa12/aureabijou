import { list, put } from "@vercel/blob";
import {
  FINANCE_BLOB_PATH,
  emptyFinanceSnapshot,
  isFinanceSnapshot,
  type FinanceSnapshot,
} from "@/lib/finance-snapshot";

export async function readFinanceSnapshot(): Promise<FinanceSnapshot> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return emptyFinanceSnapshot();

  try {
    const { blobs } = await list({
      prefix: FINANCE_BLOB_PATH,
      limit: 10,
    });
    const match =
      blobs.find((b) => b.pathname === FINANCE_BLOB_PATH) || blobs[0];
    if (!match?.url) return emptyFinanceSnapshot();

    const res = await fetch(match.url, { cache: "no-store" });
    if (!res.ok) return emptyFinanceSnapshot();
    const data = await res.json();
    return isFinanceSnapshot(data) ? data : emptyFinanceSnapshot();
  } catch (err) {
    console.error("[finance] read failed", err);
    return emptyFinanceSnapshot();
  }
}

export async function writeFinanceSnapshot(snapshot: FinanceSnapshot) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN em falta");
  }

  await put(FINANCE_BLOB_PATH, JSON.stringify(snapshot), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}
