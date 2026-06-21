import { NextRequest, NextResponse } from "next/server";

// Portfolio demo — top pages by views + landing pages with session metrics.
export async function GET(_request: NextRequest) {
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
    { path: "/about", pageViews: 36, users: 210 },
    { path: "/features", pageViews: 31, users: 180 },
    { path: "/contact", pageViews: 24, users: 140 },
    { path: "/terms", pageViews: 19, users: 110 },
    { path: "/privacy", pageViews: 16, users: 92 },
  ];

  const landingPages = [
    { page: "/", sessions: 14200, users: 9100, bounceRate: 31.4, avgDuration: 1180 },
    { page: "/app", sessions: 6800, users: 4200, bounceRate: 22.1, avgDuration: 1620 },
    { page: "/pricing", sessions: 2100, users: 1480, bounceRate: 48.7, avgDuration: 540 },
    { page: "/datasets", sessions: 1380, users: 920, bounceRate: 38.2, avgDuration: 720 },
    { page: "/chatbots", sessions: 1120, users: 780, bounceRate: 36.5, avgDuration: 680 },
    { page: "/marketplace", sessions: 820, users: 590, bounceRate: 41.3, avgDuration: 510 },
    { page: "/signup", sessions: 640, users: 510, bounceRate: 28.9, avgDuration: 410 },
    { page: "/login", sessions: 580, users: 430, bounceRate: 18.2, avgDuration: 220 },
    { page: "/docs", sessions: 420, users: 310, bounceRate: 52.8, avgDuration: 380 },
    { page: "/blog", sessions: 310, users: 240, bounceRate: 64.1, avgDuration: 290 },
    { page: "/features", sessions: 240, users: 180, bounceRate: 44.6, avgDuration: 460 },
    { page: "/about", sessions: 210, users: 160, bounceRate: 56.2, avgDuration: 320 },
  ];

  return NextResponse.json({ topPages, landingPages });
}
