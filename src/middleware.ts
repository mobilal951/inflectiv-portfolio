import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only allow access to password page, auth APIs, and static assets without authentication
  const publicPaths = [
    "/password",
    "/api/auth",  // All NextAuth routes
    "/api/promo-codes",  // Promo codes (has its own password auth)
    "/api/stats",  // Stats APIs (subscriptions, credits, api-keys, datasets)
    "/api/ga/status",  // Debug endpoint
    "/api/firebase/explore",  // Temp exploration endpoint
    "/_next",
    "/favicon.ico",
    "/icon.svg",
    "/inf-logo.png",
  ];

  // Check if path is public
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get("dashboard_auth");

  if (!authCookie || authCookie.value !== "authenticated") {
    // For API routes, return 401 JSON response
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }
    // For pages, redirect to password page
    const url = request.nextUrl.clone();
    url.pathname = "/password";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
