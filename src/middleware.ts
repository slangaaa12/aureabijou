import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  isAdminPublicPath,
} from "@/lib/admin-path";
import { verifyAdminSessionToken } from "@/lib/admin-auth-edge";

function withAdminHeaders(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    if (pathname === "/api/admin/login") {
      return withAdminHeaders(NextResponse.next());
    }
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!(await verifyAdminSessionToken(token))) {
      return NextResponse.json(
        { error: "Não autorizado" },
        {
          status: 401,
          headers: {
            "X-Robots-Tag": "noindex, nofollow",
            "Cache-Control": "no-store",
          },
        }
      );
    }
    return withAdminHeaders(NextResponse.next());
  }

  if (isAdminPublicPath(pathname)) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const authed = await verifyAdminSessionToken(token);
    const isLogin = pathname === "/admin/login";

    if (!authed && !isLogin) {
      const login = req.nextUrl.clone();
      login.pathname = "/admin/login";
      return withAdminHeaders(NextResponse.redirect(login));
    }

    if (authed && isLogin) {
      const home = req.nextUrl.clone();
      home.pathname = "/admin";
      return withAdminHeaders(NextResponse.redirect(home));
    }

    return withAdminHeaders(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
