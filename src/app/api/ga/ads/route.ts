import { NextRequest, NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/mock-data";

// Portfolio demo — Google Ads overview with two campaigns.
// Shape mirrors the real route: per-day rows include campaign breakdown so
// the dashboard can filter client-side.
const CAMPAIGNS = [
  { campaign: "Inflectiv — Brand Search", weight: 0.65 },
  { campaign: "Inflectiv — AI Datasets Discovery", weight: 0.35 },
];

export async function GET(_request: NextRequest) {
  const dates = lastNDates(30);

  const totalClicks = 1840;
  const totalImpressions = 86200;
  const totalCost = 612.4;
  const totalConversions = 92;
  const costPerConversion = totalCost / totalConversions;

  const overview = {
    clicks: totalClicks,
    cost: totalCost,
    impressions: totalImpressions,
    conversions: totalConversions,
    hasConversionData: true,
    cpc: totalCost / totalClicks,
    ctr: (totalClicks / totalImpressions) * 100,
    costPerConversion,
    currencyCode: "USD",
  };

  // Build daily x campaign breakdown.
  const dailyData: {
    date: string;
    campaign: string;
    clicks: number;
    cost: number;
    impressions: number;
    conversions: number;
  }[] = [];

  for (const c of CAMPAIGNS) {
    const clicksSeries = distribute(Math.round(totalClicks * c.weight), 30, {
      seed: `ads-clicks-${c.campaign}`,
      variance: 0.4,
      trend: 0.2,
    });
    const impSeries = distribute(Math.round(totalImpressions * c.weight), 30, {
      seed: `ads-imp-${c.campaign}`,
      variance: 0.3,
      trend: 0.2,
    });
    const costSeries = distribute(Math.round(totalCost * c.weight * 100), 30, {
      seed: `ads-cost-${c.campaign}`,
      variance: 0.35,
      trend: 0.2,
    });
    const convSeries = distribute(Math.round(totalConversions * c.weight), 30, {
      seed: `ads-conv-${c.campaign}`,
      variance: 0.6,
      trend: 0.25,
    });

    dates.forEach((date, i) => {
      dailyData.push({
        date,
        campaign: c.campaign,
        clicks: clicksSeries[i],
        cost: costSeries[i] / 100,
        impressions: impSeries[i],
        conversions: convSeries[i],
      });
    });
  }

  const campaigns = CAMPAIGNS.map((c) => {
    const clicks = Math.round(totalClicks * c.weight);
    const impressions = Math.round(totalImpressions * c.weight);
    const cost = totalCost * c.weight;
    const conversions = Math.round(totalConversions * c.weight);
    return {
      campaign: c.campaign,
      clicks,
      cost,
      impressions,
      conversions,
      costPerConversion: conversions > 0 ? cost / conversions : 0,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? cost / clicks : 0,
    };
  });

  return NextResponse.json({
    overview,
    currencyCode: "USD",
    hasConversionData: true,
    dailyData,
    campaigns,
  });
}
