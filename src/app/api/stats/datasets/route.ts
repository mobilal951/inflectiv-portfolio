import { NextRequest, NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/mock-data";

// Portfolio demo - dataset overview, leaderboards, marketplace listings.
const DEMO_OWNERS = [
  "1001", "1002", "1003", "1004", "1005", "1006", "1007", "1008", "1009", "1010",
];

const DATASETS = [
  { name: "Customer Churn 2024", category: "Business" },
  { name: "Retail Sales 2025", category: "Commerce" },
  { name: "Healthcare Outcomes US", category: "Healthcare" },
  { name: "Fleet Telemetry — North America", category: "IoT" },
  { name: "E-commerce Cart Behavior", category: "Commerce" },
  { name: "Citizen Climate Sensors", category: "Environment" },
  { name: "Logistics Last-Mile Delays", category: "Logistics" },
  { name: "Lending Risk Profiles", category: "Finance" },
  { name: "Education Outcomes K-12", category: "Education" },
  { name: "Hospitality Reviews Multilingual", category: "Hospitality" },
  { name: "Energy Grid Demand", category: "Energy" },
  { name: "Manufacturing QA Defects", category: "Manufacturing" },
  { name: "Real Estate Price Indices", category: "Real Estate" },
  { name: "Insurance Claims 2023", category: "Insurance" },
  { name: "Sports Wearable Vitals", category: "Health & Fitness" },
];

function makeDataset(idx: number, opts: { boostViews?: number; boostDownloads?: number; rating?: number; usageCount?: number } = {}) {
  const d = DATASETS[idx % DATASETS.length];
  const created = new Date();
  created.setDate(created.getDate() - (idx * 4 + 2));
  return {
    id: `ds_${1000 + idx}`,
    name: d.name,
    ownerId: DEMO_OWNERS[idx % DEMO_OWNERS.length],
    views: opts.boostViews ?? Math.max(40, 1200 - idx * 80),
    downloads: opts.boostDownloads ?? Math.max(8, 320 - idx * 22),
    rating: opts.rating ?? (idx % 4 === 0 ? null : 4.6 - (idx % 10) * 0.08),
    ratingCount: idx % 4 === 0 ? 0 : 18 - (idx % 12),
    usageCount: opts.usageCount ?? Math.max(2, 80 - idx * 5),
    isPublic: idx % 5 !== 0,
    createdAt: created.toISOString(),
  };
}

export async function GET(_request: NextRequest) {
  const totalDatasets = 1840;
  const publicDatasets = 1380;
  const privateDatasets = totalDatasets - publicDatasets;
  const newThisMonth = 86;
  const uniqueOwners = 412;
  const totalViews = 84_200;
  const totalDownloads = 21_400;

  const dates = lastNDates(30, "YYYY-MM-DD");
  const series = distribute(newThisMonth + 40, 30, { seed: "ds-daily", variance: 0.5, trend: 0.2 });
  const dailyDatasets = dates.map((date, i) => ({ date, count: series[i] }));

  const byCategory = Array.from(
    DATASETS.reduce((m, d) => m.set(d.category, (m.get(d.category) || 0) + 1), new Map<string, number>()).entries()
  )
    .map(([category, count]) => ({ category, count: count * 24 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topOwners = DEMO_OWNERS.slice(0, 8).map((ownerId, i) => ({
    ownerId,
    datasetCount: 22 - i,
    totalViews: 6800 - i * 540,
    totalDownloads: 1800 - i * 160,
  }));

  const mostVisited = Array.from({ length: 8 }).map((_, i) => makeDataset(i, { boostViews: 2400 - i * 160 }));
  const topRated = Array.from({ length: 8 }).map((_, i) => makeDataset(i + 2, { rating: 4.9 - i * 0.08 }));
  const mostDownloaded = Array.from({ length: 8 }).map((_, i) => makeDataset(i + 1, { boostDownloads: 720 - i * 56 }));
  const mostUsed = Array.from({ length: 8 }).map((_, i) => makeDataset(i + 3, { usageCount: 140 - i * 9 }));

  const recentDatasets = Array.from({ length: 10 }).map((_, i) => makeDataset(i));

  const marketplaceListings = Array.from({ length: 8 }).map((_, i) => ({
    id: `ml_${1000 + i}`,
    datasetId: `ds_${1000 + i}`,
    name: DATASETS[i % DATASETS.length].name,
    price: [0, 9.99, 19.99, 49, 99, 199, 0, 29][i % 8],
    isActive: i % 6 !== 0,
    purchaseCount: 240 - i * 18,
    createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  }));

  return NextResponse.json({
    overview: {
      totalDatasets,
      publicDatasets,
      privateDatasets,
      newThisMonth,
      uniqueOwners,
      totalViews,
      totalDownloads,
    },
    leaderboards: { mostVisited, topRated, mostDownloaded, mostUsed },
    byCategory,
    topOwners,
    dailyDatasets,
    marketplaceListings,
    recentDatasets,
  });
}
