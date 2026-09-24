import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isValidAdminApiKey, isValidAdminSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
  const isAuthenticated =
    (await isValidAdminSessionToken(token)) ||
    isValidAdminApiKey(bearerToken) ||
    isValidAdminApiKey(request.headers.get("x-admin-key"));

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
