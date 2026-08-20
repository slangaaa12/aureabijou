import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Serve uploads locais (dev). Em produção as imagens vão para Vercel Blob
 * com URL pública direta — este endpoint fica só como fallback legado.
 */
function safeKey(raw: string) {
  return raw.replace(/[^a-zA-Z0-9._-]/g, "");
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  const { key: rawKey } = await context.params;
  const key = safeKey(rawKey);
  if (!key) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const filePath = path.join(process.cwd(), "public", "uploads", key);
    const data = await readFile(filePath);
    const ext = key.split(".").pop()?.toLowerCase();
    const contentType =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : ext === "gif"
            ? "image/gif"
            : "image/jpeg";
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
