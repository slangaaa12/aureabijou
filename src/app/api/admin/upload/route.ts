import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_SIZE = 4 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function storeWithVercelBlob(
  key: string,
  data: Buffer,
  contentType: string
) {
  const blob = await put(`uploads/${key}`, data, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });
  return blob.url;
}

async function storeLocally(key: string, buffer: Buffer) {
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, key), buffer);
  return `/uploads/${key}`;
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
  }

  const file = formData.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhuma imagem enviada" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Tipo inválido. Use JPG, PNG, WebP ou GIF." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Ficheiro demasiado grande (máx. 4 MB)." },
      { status: 400 }
    );
  }

  const ext =
    EXT_BY_TYPE[file.type] ||
    file.name.split(".").pop()?.toLowerCase() ||
    "jpg";
  const key = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  try {
    if (hasBlobToken) {
      const url = await storeWithVercelBlob(key, buffer, file.type);
      return NextResponse.json({
        success: true,
        url,
        key,
        storage: "blob",
        contentType: file.type,
        size: file.size,
        filename: file.name,
      });
    }

    const url = await storeLocally(key, buffer);
    return NextResponse.json({
      success: true,
      url,
      key,
      storage: "local",
      contentType: file.type,
      size: file.size,
      filename: file.name,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Falha ao guardar a imagem";
    console.error("[admin/upload]", message);
    return NextResponse.json(
      {
        error:
          "Não foi possível guardar a imagem. Verifique o Vercel Blob (BLOB_READ_WRITE_TOKEN) ou permissões locais.",
      },
      { status: 500 }
    );
  }
}
