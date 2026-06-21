import { NextRequest, NextResponse } from "next/server";

// Portfolio demo — paid vs organic vs direct comparison shape.
type ChannelRow = {
  channel: string;
  activeUsers: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  pagesPerSession: number;
  engagementRate: number;
  engagedSessions: number;
};

export async function GET(_request: NextRequest) {
  const allChannels: ChannelRow[] = [
    { channel: "Direct", activeUsers: 8100, sessions: 13000, bounceRate: 31.4, avgSessionDuration: 1180, pagesPerSession: 4.2, engagementRate: 68.6, engagedSessions: 8918 },
    { channel: "Organic Search", activeUsers: 4050, sessions: 6500, bounceRate: 36.2, avgSessionDuration: 940, pagesPerSession: 3.6, engagementRate: 63.8, engagedSessions: 4147 },
    { channel: "Organic Social", activeUsers: 1620, sessions: 2600, bounceRate: 44.1, avgSessionDuration: 720, pagesPerSession: 2.8, engagementRate: 55.9, engagedSessions: 1453 },
    { channel: "Referral", activeUsers: 970, sessions: 1560, bounceRate: 38.7, avgSessionDuration: 820, pagesPerSession: 3.2, engagementRate: 61.3, engagedSessions: 956 },
    { channel: "Paid Search", activeUsers: 730, sessions: 1170, bounceRate: 29.8, avgSessionDuration: 1280, pagesPerSession: 4.4, engagementRate: 70.2, engagedSessions: 821 },
    { channel: "Email", activeUsers: 490, sessions: 780, bounceRate: 33.5, avgSessionDuration: 980, pagesPerSession: 3.8, engagementRate: 66.5, engagedSessions: 519 },
    { channel: "AI Assistant", activeUsers: 240, sessions: 390, bounceRate: 41.0, avgSessionDuration: 690, pagesPerSession: 2.9, engagementRate: 59.0, engagedSessions: 230 },
  ];

  const totalUsers = allChannels.reduce((sum, m) => sum + m.activeUsers, 0);

  const paidRow = allChannels.find((m) => m.channel === "Paid Search")!;
  const organicRow = allChannels.find((m) => m.channel === "Organic Search")!;
  const directRow = allChannels.find((m) => m.channel === "Direct")!;

  const paidCtaClicks = 480;
  const organicCtaClicks = 920;

  const comparison = {
    paid: {
      ...paidRow,
      ctaClicks: paidCtaClicks,
      percentOfTotal: totalUsers > 0 ? (paidRow.activeUsers / totalUsers) * 100 : 0,
    },
    organic: {
      ...organicRow,
      ctaClicks: organicCtaClicks,
      percentOfTotal: totalUsers > 0 ? (organicRow.activeUsers / totalUsers) * 100 : 0,
    },
    direct: {
      ...directRow,
      ctaClicks: 0,
      percentOfTotal: totalUsers > 0 ? (directRow.activeUsers / totalUsers) * 100 : 0,
    },
    totalUsers,
    allChannels,
  };

  return NextResponse.json(comparison);
}
