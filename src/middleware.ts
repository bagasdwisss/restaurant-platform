import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "restosync_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isPosRoute = pathname.startsWith("/pos");
  const isUserRoute = pathname.startsWith("/user");

  if (!isAdminRoute && !isPosRoute && !isUserRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("error", "session_required");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const parts = token.split(".");
    if (parts.length < 2) {
      throw new Error("Invalid token format");
    }

    const payloadBase64 = parts[0].replace(/-/g, "+").replace(/_/g, "/");
    // Edge-safe base64 decoding
    const decodedStr = atob(payloadBase64);
    const session = JSON.parse(decodedStr);

    if (session.exp && Date.now() > session.exp) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("error", "session_expired");
      return NextResponse.redirect(loginUrl);
    }

    // Role Guard: /admin requires role 'admin'
    if (isAdminRoute && session.role !== "admin") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("error", "admin_role_required");
      return NextResponse.redirect(loginUrl);
    }

    // Role Guard: /pos requires role 'kasir' or 'admin'
    if (isPosRoute && session.role !== "kasir" && session.role !== "admin") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("error", "pos_role_required");
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("error", "invalid_session");
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*", "/pos/:path*", "/user/:path*"],
};
