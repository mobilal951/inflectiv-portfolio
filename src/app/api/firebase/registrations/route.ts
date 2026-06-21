import { NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/mock-data";

// Portfolio demo - registration totals + 30-day breakdown.
// Real captured: Total Registered 16.7K -> ~6.7K, period new regs 10,503 -> ~4,200,
// App Logins last 30d 136 -> ~54.
export async function GET(_request: Request) {
  const total = 6700;
  const activeAccounts = 6480;
  const periodTotal = 4200;
  const dates = lastNDates(30, "YYYY-MM-DD");
  const series = distribute(periodTotal, 30, { seed: "fb-registrations", variance: 0.55, trend: 0.3 });
  const byDay = dates.map((date, i) => ({ date, count: series[i] }));

  const today = series[series.length - 1];
  const thisWeek = series.slice(-7).reduce((a, b) => a + b, 0);
  const thisMonth = periodTotal;

  const appLogins = { today: 5, thisWeek: 18, thisMonth: 54 };

  return NextResponse.json({
    total,
    activeAccounts,
    periodTotal,
    today,
    thisWeek,
    thisMonth,
    byDay,
    appLogins,
  });
}
