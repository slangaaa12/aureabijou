import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
  isAdminConfigSecure,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count += 1;
  return true;
}

function clearRateLimit(ip: string) {
  attempts.delete(ip);
}

export async function POST(req: NextRequest) {
  const config = isAdminConfigSecure();
  if (!config.ok) {
    return NextResponse.json(
      { error: "Acesso indisponível. Contacte o responsável técnico." },
      { status: 503 }
    );
  }

  const ip = clientIp(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Demasiadas tentativas. Aguarde alguns minutos." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "");
  const password = String(body.password || "");

  if (!verifyAdminCredentials(email, password)) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  clearRateLimit(ip);
  const token = createAdminSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, adminSessionCookieOptions());
  // Invalidar cookie legado se existir
  res.cookies.set("aurea_admin", "", { path: "/", maxAge: 0 });
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { ...adminSessionCookieOptions(0), maxAge: 0 });
  res.cookies.set("aurea_admin", "", { path: "/", maxAge: 0 });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
