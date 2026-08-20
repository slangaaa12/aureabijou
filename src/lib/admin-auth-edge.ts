/**
 * Verificação de sessão compatível com Edge (middleware).
 * Usa Web Crypto — não depende de node:crypto.
 */

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= 24) return secret;
  if (process.env.NODE_ENV === "production") return "";
  return "aurea-dev-only-secret-not-for-prod";
}

function b64urlToBytes(value: string): Uint8Array {
  const pad = "=".repeat((4 - (value.length % 4)) % 4);
  const b64 = (value + pad).replace(/-/g, "+").replace(/_/g, "/");
  const str = atob(b64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

function bytesToB64url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let str = "";
  for (let i = 0; i < arr.length; i++) str += String.fromCharCode(arr[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function verifyAdminSessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token || !token.includes(".")) return false;
  const secret = getSecret();
  if (!secret) return false;

  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const mac = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payload)
    );
    const expected = bytesToB64url(mac);
    if (!timingSafeEqualStr(sig, expected)) return false;

    const json = new TextDecoder().decode(b64urlToBytes(payload));
    const data = JSON.parse(json) as { role?: string; exp?: number };
    if (data.role !== "admin") return false;
    if (typeof data.exp !== "number" || data.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}
