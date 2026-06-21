import { NextRequest, NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/mock-data";

// Portfolio demo - API key stats with overview + recent list.
export async function GET(_request: NextRequest) {
  const totalKeys = 920;
  const activeKeys = 740;
  const expiredKeys = 86;
  const newThisMonth = 64;
  const uniqueUsers = 412;
  const recentlyUsed = 218;
  const neverUsed = 184;

  const dates = lastNDates(30, "YYYY-MM-DD");
  const series = distribute(newThisMonth + 80, 30, { seed: "api-keys-daily", variance: 0.6, trend: 0.2 });
  const dailyKeys = dates.map((date, i) => ({ date, count: series[i] }));

  const ownerNames = [
    { id: "1001", username: "acme.holdings", fullName: "Acme Holdings" },
    { id: "1002", username: "northbay.cap", fullName: "Northbay Capital" },
    { id: "1003", username: "pacific.crest", fullName: "Pacific Crest" },
    { id: "1004", username: "lambda.research", fullName: "Lambda Research" },
    { id: "1005", username: "atlas.media", fullName: "Atlas Media" },
    { id: "1006", username: "ironwood.labs", fullName: "Ironwood Labs" },
    { id: "1007", username: "vela.studio", fullName: "Vela Studio" },
    { id: "1008", username: "quartz.collective", fullName: "Quartz Collective" },
    { id: "1009", username: "fernwood.partners", fullName: "Fernwood Partners" },
    { id: "1010", username: "ridgeline.io", fullName: "Ridgeline IO" },
  ];

  const topUsers = ownerNames.map((o, i) => ({
    userId: o.id,
    username: o.username,
    fullName: o.fullName,
    keyCount: 32 - i * 2,
    activeCount: Math.max(1, 28 - i * 2),
  }));

  const recentKeys = Array.from({ length: 12 }).map((_, i) => {
    const owner = ownerNames[i % ownerNames.length];
    const createdDaysAgo = (i * 2) + 1;
    const created = new Date();
    created.setDate(created.getDate() - createdDaysAgo);
    const lastUsed = new Date(created);
    lastUsed.setHours(lastUsed.getHours() + 6);
    return {
      id: `key_${1000 + i}`,
      userId: owner.id,
      username: owner.username,
      name: ["Production", "Staging", "Local Dev", "QA Sandbox", "Marketing", "Analytics"][i % 6],
      keyPrefix: `inf_${(Math.random().toString(36).slice(2, 10))}`,
      datasetName: ["Customer Churn", "Retail Sales 2025", "Healthcare Outcomes", "Fleet Telemetry", null][i % 5],
      isActive: i % 7 !== 0,
      createdAt: created.toISOString(),
      lastUsedAt: i % 5 === 0 ? null : lastUsed.toISOString(),
      expiresAt: i % 3 === 0 ? null : new Date(created.getTime() + 1000 * 60 * 60 * 24 * 365).toISOString(),
    };
  });

  return NextResponse.json({
    overview: {
      totalKeys,
      activeKeys,
      inactiveKeys: totalKeys - activeKeys,
      expiredKeys,
      newThisMonth,
      uniqueUsers,
      recentlyUsed,
      neverUsed,
    },
    byStatus: [
      { status: "active", count: activeKeys },
      { status: "inactive", count: totalKeys - activeKeys },
    ],
    topUsers,
    dailyKeys,
    recentKeys,
  });
}
