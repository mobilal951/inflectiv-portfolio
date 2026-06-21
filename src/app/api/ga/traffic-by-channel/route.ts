import { NextRequest, NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/mock-data";

// Portfolio demo — daily traffic stacked by channel + summary.
const CHANNEL_TOTALS = [
  { channel: "Direct", activeUsers: 8100, sessions: 13000, newUsers: 66 },
  { channel: "Organic Search", activeUsers: 4050, sessions: 6500, newUsers: 33 },
  { channel: "Organic Social", activeUsers: 1620, sessions: 2600, newUsers: 13 },
  { channel: "Referral", activeUsers: 970, sessions: 1560, newUsers: 8 },
  { channel: "Paid Search", activeUsers: 730, sessions: 1170, newUsers: 6 },
  { channel: "Email", activeUsers: 490, sessions: 780, newUsers: 4 },
  { channel: "AI Assistant", activeUsers: 240, sessions: 390, newUsers: 1 },
];

export async function GET(_request: NextRequest) {
  const dates = lastNDates(30);

  // For each channel, distribute its 30-day total across 30 days.
  const perChannelSeries: Record<string, number[]> = {};
  for (const c of CHANNEL_TOTALS) {
    perChannelSeries[c.channel] = distribute(c.activeUsers, 30, {
      seed: `tbc-${c.channel}`,
      variance: 0.4,
      trend: 0.2,
    });
  }

  const dailyData = dates.map((date, i) => {
    const row: Record<string, string | number> = { date };
    for (const c of CHANNEL_TOTALS) {
      row[c.channel] = perChannelSeries[c.channel][i];
    }
    return row;
  });

  const channels = CHANNEL_TOTALS.map((c) => c.channel);
  const totalUsers = CHANNEL_TOTALS.reduce((sum, c) => sum + c.activeUsers, 0);
  const summary = CHANNEL_TOTALS.map((c) => ({
    ...c,
    percentage: totalUsers > 0 ? (c.activeUsers / totalUsers) * 100 : 0,
  }));

  return NextResponse.json({ dailyData, channels, summary, totalUsers });
}
