import { NextRequest, NextResponse } from "next/server";

// Portfolio demo — acquisition channels + top pages.
// Direct dominant (~50%), Organic Search next (~25%), tail spread realistically.
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "10");

  const sources = [
    { channel: "Direct", activeUsers: 8100, sessions: 13000, newUsers: 66 },
    { channel: "Organic Search", activeUsers: 4050, sessions: 6500, newUsers: 33 },
    { channel: "Organic Social", activeUsers: 1620, sessions: 2600, newUsers: 13 },
    { channel: "Referral", activeUsers: 970, sessions: 1560, newUsers: 8 },
    { channel: "Paid Search", activeUsers: 730, sessions: 1170, newUsers: 6 },
    { channel: "Email", activeUsers: 490, sessions: 780, newUsers: 4 },
    { channel: "AI Assistant", activeUsers: 240, sessions: 390, newUsers: 1 },
  ];

  const topPages = [
    { path: "/", pageViews: 420, users: 2740 },
    { path: "/app", pageViews: 310, users: 1880 },
    { path: "/pricing", pageViews: 168, users: 980 },
    { path: "/datasets", pageViews: 142, users: 760 },
    { path: "/chatbots", pageViews: 118, users: 640 },
    { path: "/marketplace", pageViews: 96, users: 530 },
    { path: "/login", pageViews: 82, users: 470 },
    { path: "/signup", pageViews: 74, users: 410 },
    { path: "/docs", pageViews: 58, users: 320 },
    { path: "/blog", pageViews: 42, users: 240 },
  ];

  return NextResponse.json({
    sources: sources.slice(0, limit),
    topPages: topPages.slice(0, limit),
  });
}
