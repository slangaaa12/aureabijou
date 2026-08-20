/**
 * Caminho público do painel de administração.
 */
export function getAdminBasePath(): string {
  return "admin";
}

export function adminUrl(path = ""): string {
  const base = getAdminBasePath();
  const suffix = path.replace(/^\/+/, "");
  return suffix ? `/${base}/${suffix}` : `/${base}`;
}

export function isAdminPublicPath(pathname: string): boolean {
  const base = getAdminBasePath();
  return pathname === `/${base}` || pathname.startsWith(`/${base}/`);
}

/** Qualquer UI do painel. */
export function isPrivatePanelPath(pathname: string): boolean {
  return isAdminPublicPath(pathname);
}

export const ADMIN_COOKIE = "aurea_sid";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 8; // 8 horas
