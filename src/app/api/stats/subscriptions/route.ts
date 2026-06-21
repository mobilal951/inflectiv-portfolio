import { NextRequest, NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/mock-data";

// Portfolio demo - subscription stats: counts by plan, payment method, billing period,
// daily series, recent subs with synthetic users.
const DEMO_USERS = [
  { id: "1001", name: "Acme Holdings", email: "billing@acme-holdings.example" },
  { id: "1002", name: "Northbay Capital", email: "ops@northbaycap.example" },
  { id: "1003", name: "Pacific Crest", email: "team@pacificcrest.example" },
  { id: "1004", name: "Lambda Research", email: "admin@lambda-research.example" },
  { id: "1005", name: "Atlas Media", email: "accounts@atlasmedia.example" },
  { id: "1006", name: "Ironwood Labs", email: "hello@ironwood-labs.example" },
  { id: "1007", name: "Vela Studio", email: "studio@velastudio.example" },
  { id: "1008", name: "Quartz Collective", email: "ops@quartzcollective.example" },
  { id: "1009", name: "Fernwood Partners", email: "office@fernwoodpartners.example" },
  { id: "1010", name: "Ridgeline IO", email: "billing@ridgeline-io.example" },
];

export async function GET(_request: NextRequest) {
  const total = 312;
  const active = 248;
  const newThisMonth = 38;
  const canceledThisMonth = 12;
  const churnRate = 4.6;

  const dates = lastNDates(30, "YYYY-MM-DD");
  const series = distribute(newThisMonth + 12, 30, { seed: "subs-daily", variance: 0.6, trend: 0.2 });
  const dailySubscriptions = dates.map((date, i) => ({ date, count: series[i] }));

  const recentSubscriptions = Array.from({ length: 12 }).map((_, i) => {
    const u = DEMO_USERS[i % DEMO_USERS.length];
    const created = new Date();
    created.setDate(created.getDate() - i * 2);
    const start = new Date(created);
    const end = new Date(start);
    end.setMonth(end.getMonth() + (i % 3 === 0 ? 12 : 1));
    const plans = ["pro", "basic", "pro", "enterprise", "basic", "pro"];
    const statuses = ["active", "active", "active", "trialing", "canceled", "active"];
    return {
      id: `sub_${1000 + i}`,
      userId: u.id,
      userName: u.name,
      userEmail: u.email,
      plan: plans[i % plans.length],
      status: statuses[i % statuses.length],
      billingPeriod: i % 3 === 0 ? "yearly" : "monthly",
      paymentMethod: ["card", "card", "wallet", "crypto", "card"][i % 5],
      createdAt: created.toISOString(),
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
    };
  });

  return NextResponse.json({
    overview: { total, active, newThisMonth, canceledThisMonth, churnRate },
    byStatus: [
      { status: "active", count: active },
      { status: "trialing", count: 22 },
      { status: "canceled", count: 32 },
      { status: "past_due", count: 8 },
      { status: "incomplete", count: 2 },
    ],
    byPlan: [
      { plan: "pro", count: 142 },
      { plan: "basic", count: 118 },
      { plan: "enterprise", count: 38 },
      { plan: "trial", count: 14 },
    ],
    byPaymentMethod: [
      { method: "card", count: 218 },
      { method: "wallet", count: 48 },
      { method: "crypto", count: 32 },
      { method: "invoice", count: 14 },
    ],
    byBillingPeriod: [
      { period: "monthly", count: 224 },
      { period: "yearly", count: 88 },
    ],
    recentSubscriptions,
    dailySubscriptions,
  });
}
