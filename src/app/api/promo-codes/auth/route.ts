import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Portfolio demo - accept any non-empty password. Sets a simple cookie
// the other promo-codes routes use as the gate.
const DEMO_COOKIE = "promo_admin_token";
const DEMO_USER = "Demo Admin";
const MAX_AGE = 24 * 60 * 60; // 24 hours

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set(DEMO_COOKIE, "demo-portfolio-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: MAX_AGE,
      path: "/",
    });

    return NextResponse.json({ success: true, userName: DEMO_USER });
  } catch {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(DEMO_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({ authenticated: true, userName: DEMO_USER });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE);
  return NextResponse.json({ success: true });
}
