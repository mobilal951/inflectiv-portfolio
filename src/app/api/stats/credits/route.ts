import { NextRequest, NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/mock-data";

// Portfolio demo - credit balance, transaction history, daily earned/spent, pools.
export async function GET(_request: NextRequest) {
  const usersWithCredits = 412;
  const totalBalance = 1840000;
  const totalEarned = 3120000;
  const totalSpent = 1280000;
  const earnedThisMonth = 280000;
  const spentThisMonth = 142000;
  const totalTransactions = 5840;

  const dates = lastNDates(30, "YYYY-MM-DD");
  const earnedSeries = distribute(earnedThisMonth, 30, { seed: "credit-earned", variance: 0.5, trend: 0.25 });
  const spentSeries = distribute(spentThisMonth, 30, { seed: "credit-spent", variance: 0.6, trend: 0.2 });
  const dailyUsage = dates.map((date, i) => ({
    date,
    earned: earnedSeries[i],
    spent: spentSeries[i],
  }));

  const recentTransactions = Array.from({ length: 18 }).map((_, i) => {
    const created = new Date();
    created.setHours(created.getHours() - i * 5);
    const isEarn = i % 3 !== 0;
    const amount = isEarn ? 1000 + (i * 137) % 4000 : -((i * 211) % 800 + 50);
    return {
      id: "tx_" + (10000 + i),
      userId: String(1001 + (i % 10)),
      creditType: ["default", "promo", "purchased", "bonus"][i % 4],
      amount,
      type: isEarn ? "credit" : "debit",
      description: isEarn
        ? ["Top-up purchase", "Promo redemption", "Monthly grant", "Referral bonus"][i % 4]
        : ["Dataset access", "Chatbot inference", "API call batch", "Export job"][i % 4],
      createdAt: created.toISOString(),
    };
  });

  const pools = [
    { id: "pool_1", name: "Pro Plan Monthly", totalCredits: 1000000, allocatedCredits: 720000, createdAt: new Date(Date.now() - 86400000 * 28).toISOString() },
    { id: "pool_2", name: "Promo - LAUNCH50", totalCredits: 250000, allocatedCredits: 142000, createdAt: new Date(Date.now() - 86400000 * 22).toISOString() },
    { id: "pool_3", name: "Enterprise - Acme Holdings", totalCredits: 500000, allocatedCredits: 318000, createdAt: new Date(Date.now() - 86400000 * 60).toISOString() },
    { id: "pool_4", name: "Referral Rewards", totalCredits: 120000, allocatedCredits: 64000, createdAt: new Date(Date.now() - 86400000 * 45).toISOString() },
  ];

  return NextResponse.json({
    overview: {
      usersWithCredits,
      totalBalance,
      totalEarned,
      totalSpent,
      earnedThisMonth,
      spentThisMonth,
      totalTransactions,
    },
    byType: [
      { type: "default", earned: 0, spent: 0, balance: 940000 },
      { type: "promo", earned: 0, spent: 0, balance: 320000 },
      { type: "purchased", earned: 0, spent: 0, balance: 520000 },
      { type: "bonus", earned: 0, spent: 0, balance: 60000 },
    ],
    topConsumers: [],
    recentTransactions,
    dailyUsage,
    pools,
  });
}
