import { NextRequest, NextResponse } from "next/server";
import { distributeFloat, lastNDates, distribute } from "@/lib/mock-data";

// Portfolio demo — engagement metrics + daily breakdown.
export async function GET(_request: NextRequest) {
  const dates = lastNDates(30);

  const metrics = {
    engagementRate: 65.7,
    engagedSessions: 17080,
    avgSessionDuration: 1031,
    pagesPerSession: 3.92,
    totalSessions: 26000,
    bounceRate: 34.3,
    totalEngagementDuration: 1031 * 17080,
  };

  // Daily engagement rates fluctuate around 65.7%, durations around 1031s,
  // pages/session around 3.92.
  const engagementRates = distributeFloat(65.7 * 30, 30, {
    seed: "eng-rate",
    variance: 0.08,
  }).map((v) => Math.min(95, Math.max(40, v)));

  const durations = distribute(1031 * 30, 30, {
    seed: "eng-dur",
    variance: 0.15,
  });

  const pagesPer = distributeFloat(3.92 * 30, 30, {
    seed: "eng-pps",
    variance: 0.12,
  }).map((v) => Math.max(1.5, v));

  const byDay = dates.map((date, i) => ({
    date,
    engagementRate: parseFloat(engagementRates[i].toFixed(2)),
    avgSessionDuration: durations[i],
    pagesPerSession: parseFloat(pagesPer[i].toFixed(2)),
  }));

  return NextResponse.json({ metrics, byDay });
}
