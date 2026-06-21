import { NextRequest, NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/mock-data";

// Portfolio demo — scaled ~0.4 from real captured snapshot.
// Real (last 30d): Website Visitors 40.4K, Sessions 65.2K, Page Views ~4K,
// New Visitors 327, Avg Duration 1031s, Bounce 34.3%, Pages/Session 3.92.
export async function GET(_request: NextRequest) {
  const dates = lastNDates(30);

  const activeUsers = 16200;
  const sessions = 26000;
  const pageViews = 1600;
  const newUsers = 131;

  const overview = {
    activeUsers,
    sessions,
    pageViews,
    newUsers,
    avgSessionDuration: 1031,
    bounceRate: 34.3,
    pagesPerSession: 3.92,
  };

  const auSeries = distribute(activeUsers, 30, { seed: "ga-traffic-au", variance: 0.4, trend: 0.25 });
  const sessSeries = distribute(sessions, 30, { seed: "ga-traffic-sess", variance: 0.4, trend: 0.25 });
  const newSeries = distribute(newUsers, 30, { seed: "ga-traffic-new", variance: 0.55, trend: 0.3 });

  const dailyData = dates.map((date, i) => ({
    date,
    activeUsers: auSeries[i],
    sessions: sessSeries[i],
    newUsers: newSeries[i],
  }));

  const ctaSeries = distribute(4200, 30, { seed: "ga-traffic-cta", variance: 0.5, trend: 0.3 });
  const websiteTraffic = dates.map((date, i) => ({
    date,
    activeUsers: auSeries[i],
    ctaClicks: ctaSeries[i],
  }));

  return NextResponse.json({ overview, dailyData, websiteTraffic });
}
