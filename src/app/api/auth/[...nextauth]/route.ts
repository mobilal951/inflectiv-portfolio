import { NextRequest, NextResponse } from "next/server";

// Portfolio demo — NextAuth is intentionally not configured (no Google
// OAuth credentials in this deploy). We stub the route so the
// useSession() hook gets a clean { user: null } response instead of
// 500ing the way the unconfigured NextAuth handler would.

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  // /api/auth/session → empty session
  if (url.pathname.endsWith("/session")) {
    return NextResponse.json({});
  }
  // /api/auth/providers, /api/auth/csrf, etc. → minimal valid responses
  if (url.pathname.endsWith("/providers")) {
    return NextResponse.json({});
  }
  if (url.pathname.endsWith("/csrf")) {
    return NextResponse.json({ csrfToken: "demo" });
  }
  return NextResponse.json({});
}

export async function POST(request: NextRequest) {
  // /api/auth/_log → 204 No Content (NextAuth client posts here on error)
  // /api/auth/signin/google → just respond ok
  return NextResponse.json({ ok: true });
}
