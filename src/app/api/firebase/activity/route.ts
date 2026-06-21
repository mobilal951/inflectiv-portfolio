import { NextRequest, NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/mock-data";

// Portfolio demo - activity stats across datasets, agents, files, credits, users, promos.
// Shape mirrors the real Postgres-backed route exactly.
type Bucket = {
  total: number;
  filtered: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byDay: { date: string; count: number }[];
};

function buildBucket(total: number, periodTotal: number, seed: string): Bucket {
  const dates = lastNDates(30, "YYYY-MM-DD");
  const series = distribute(periodTotal, 30, { seed, variance: 0.5, trend: 0.2 });
  const byDay = dates.map((date, i) => ({ date, count: series[i] }));
  const today = series[series.length - 1];
  const thisWeek = series.slice(-7).reduce((a, b) => a + b, 0);
  const thisMonth = periodTotal;
  return { total, filtered: periodTotal, today, thisWeek, thisMonth, byDay };
}

export async function GET(_request: NextRequest) {
  const datasets = buildBucket(1840, 320, "act-datasets");
  const agents = buildBucket(620, 180, "act-agents");
  const files = buildBucket(4280, 940, "act-files");
  const credits = buildBucket(2_180_000, 480_000, "act-credits");
  const users = buildBucket(6700, 4200, "act-users");

  const promoDates = lastNDates(30, "YYYY-MM-DD");
  const promoSeries = distribute(86, 30, { seed: "act-promo", variance: 0.7, trend: 0.2 });

  const promos = {
    total: 312,
    filtered: 86,
    today: promoSeries[promoSeries.length - 1],
    thisWeek: promoSeries.slice(-7).reduce((a, b) => a + b, 0),
    thisMonth: 86,
    uniqueUsers: { total: 248, filtered: 72 },
    discountCents: { total: 482_400, filtered: 124_800 },
    byDay: promoDates.map((date, i) => ({ date, count: promoSeries[i] })),
    byCode: [
      { code: "LAUNCH50", redemptions: 38 },
      { code: "SPRING-PRO", redemptions: 22 },
      { code: "FREEMONTH", redemptions: 14 },
      { code: "DATA100", redemptions: 8 },
      { code: "BETA-VIP", redemptions: 4 },
    ],
  };

  return NextResponse.json({ datasets, agents, files, credits, users, promos });
}
