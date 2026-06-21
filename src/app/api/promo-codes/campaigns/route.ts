import { NextRequest, NextResponse } from "next/server";

const CAMPAIGNS = [
  { id: "c1", name: "Launch Month",          status: "active",   total_codes: 1,  total_redemptions: 312,  total_discount_usd: 1560, created_at: "2026-01-10T10:00:00Z" },
  { id: "c2", name: "Onboarding Welcome",    status: "active",   total_codes: 1,  total_redemptions: 1842, total_discount_usd: 9210, created_at: "2026-02-03T10:00:00Z" },
  { id: "c3", name: "Credits Top-Up Push",   status: "active",   total_codes: 2,  total_redemptions: 729,  total_discount_usd: 6580, created_at: "2026-02-22T10:00:00Z" },
  { id: "c4", name: "Pro Plan Trial",        status: "active",   total_codes: 1,  total_redemptions: 64,   total_discount_usd: 615,  created_at: "2026-03-04T10:00:00Z" },
  { id: "c5", name: "Conference Outreach",   status: "active",   total_codes: 1,  total_redemptions: 91,   total_discount_usd: 455,  created_at: "2026-03-19T10:00:00Z" },
  { id: "c6", name: "Startup Partner Tier",  status: "active",   total_codes: 1,  total_redemptions: 18,   total_discount_usd: 90,   created_at: "2026-04-18T10:00:00Z" },
  { id: "c7", name: "Beta Program (Closed)", status: "archived", total_codes: 1,  total_redemptions: 100,  total_discount_usd: 500,  created_at: "2026-01-05T10:00:00Z" },
];

export async function GET() {
  return NextResponse.json({ campaigns: CAMPAIGNS, total: CAMPAIGNS.length });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json(
    {
      campaign: {
        id: `c${Date.now()}`,
        name: body.name || "New Campaign",
        status: "active",
        total_codes: 0,
        total_redemptions: 0,
        total_discount_usd: 0,
        created_at: new Date().toISOString(),
      },
    },
    { status: 201 }
  );
}
