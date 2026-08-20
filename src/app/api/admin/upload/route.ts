import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
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

async function storeWithBlobs(
  key: string,
  data: ArrayBuffer,
  contentType: string,
  originalFilename: string
) {
  const { getStore } = await import("@netlify/blobs");
  const store = getStore({ name: "aurea-images", consistency: "strong" });
  await store.set(key, data, {
    metadata: {
      contentType,
      originalFilename,
      uploadedAt: new Date().toISOString(),
    },
  });
  return `/api/uploads/${key}`;
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
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let url: string | null = null;
  let storage: "blobs" | "local" = "local";

  try {
    url = await storeWithBlobs(key, arrayBuffer, file.type, file.name);
    storage = "blobs";
  } catch {
    try {
      url = await storeLocally(key, buffer);
      storage = "local";
    } catch {
      return NextResponse.json(
        {
          error:
            "Não foi possível guardar a imagem. Em produção use Netlify Blobs; em local, verifique permissões de escrita.",
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    success: true,
    url,
    key,
    storage,
    contentType: file.type,
    size: file.size,
    filename: file.name,
  });
}
