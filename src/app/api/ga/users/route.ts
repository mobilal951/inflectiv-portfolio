import { NextRequest, NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/mock-data";

// Portfolio demo — new vs returning, scaled from captured snapshot.
export async function GET(_request: NextRequest) {
  const dates = lastNDates(30);

  const newTotal = 5600;
  const returningTotal = 10600;
  const newSessionsTotal = 6800;
  const returningSessionsTotal = 19200;

  const newSeries = distribute(newTotal, 30, { seed: "users-new", variance: 0.5, trend: 0.2 });
  const returnSeries = distribute(returningTotal, 30, { seed: "users-returning", variance: 0.35, trend: 0.15 });

  const byDay = dates.map((date, i) => ({
    date,
    newUsers: newSeries[i],
    returningUsers: returnSeries[i],
  }));

  return NextResponse.json({
    newVsReturning: {
      new: newTotal,
      returning: returningTotal,
      newSessions: newSessionsTotal,
      returningSessions: returningSessionsTotal,
    },
    byDay,
  });
}
