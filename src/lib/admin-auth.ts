import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE_SEC,
  getAdminBasePath,
  adminUrl,
} from "@/lib/admin-path";

const DEFAULT_ADMIN_EMAIL = "kaylla.aurea@admin.com";
const DEFAULT_ADMIN_PASSWORD = "aurea12";

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= 24) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET em falta ou demasiado curto");
  }
  return "aurea-dev-only-secret-not-for-prod";
}

function adminEmail() {
  return (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

export function isAdminConfigSecure(): { ok: boolean; reason?: string } {
  const password = adminPassword();
  const email = adminEmail();
  const secret = process.env.ADMIN_SESSION_SECRET || "";

  if (!email || !email.includes("@")) {
    return {
      ok: false,
      reason: "Defina ADMIN_EMAIL com um email válido.",
    };
  }

  if (!password || password.length < 6) {
    return {
      ok: false,
      reason: "Defina ADMIN_PASSWORD com pelo menos 6 caracteres.",
    };
  }

  if (process.env.NODE_ENV === "production") {
    if (secret.length < 32) {
      return {
        ok: false,
        reason: "ADMIN_SESSION_SECRET deve ter pelo menos 32 caracteres em produção.",
      };
    }
  }

  return { ok: true };
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  try {
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const expectedEmail = adminEmail();
  const expectedPassword = adminPassword();
  if (!expectedEmail || !expectedPassword) return false;

  const normalized = email.trim().toLowerCase();
  return (
    safeEqual(normalized, expectedEmail) &&
    safeEqual(password, expectedPassword)
  );
}

/** @deprecated use verifyAdminCredentials */
export function verifyAdminPassword(password: string): boolean {
  return safeEqual(password, adminPassword());
}

export function createAdminSessionToken(): string {
  const exp = Date.now() + SESSION_MAX_AGE_SEC * 1000;
  const nonce = randomBytes(16).toString("hex");
  const payload = Buffer.from(
    JSON.stringify({ role: "admin", exp, nonce })
  ).toString("base64url");
  const sig = createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const expected = createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url");

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { role?: string; exp?: number };
    if (data.role !== "admin") return false;
    if (typeof data.exp !== "number" || data.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated() {
  try {
    const jar = await cookies();
    return verifyAdminSessionToken(jar.get(ADMIN_COOKIE)?.value);
  } catch {
    return false;
  }
}

export function adminSessionCookieOptions(maxAge = SESSION_MAX_AGE_SEC) {
  return {
    httpOnly: true as const,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export { getAdminBasePath, adminUrl, ADMIN_COOKIE };
