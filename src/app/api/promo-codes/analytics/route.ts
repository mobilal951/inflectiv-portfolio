import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    summary: {
      totalCodes: 8,
      activeCodes: 7,
      totalRedemptions: 3156,
      totalDiscountValueUsd: 18420,
      avgDiscountUsd: 5.84,
    },
    topCodes: [
      { code: "WELCOME25",  redemptions: 1842, discount_type: "percentage", discount_value: 25, totalDiscountUsd: 9210 },
      { code: "SUMMER10",   redemptions: 587,  discount_type: "flat_usd",   discount_value: 10, totalDiscountUsd: 5870 },
      { code: "LAUNCH50",   redemptions: 312,  discount_type: "percentage", discount_value: 50, totalDiscountUsd: 1560 },
      { code: "CREDIT500",  redemptions: 142,  discount_type: "credits",    discount_value: 0,  totalDiscountUsd: 710 },
      { code: "BIGDATA15",  redemptions: 91,   discount_type: "percentage", discount_value: 15, totalDiscountUsd: 455 },
      { code: "PROFREE3M",  redemptions: 64,   discount_type: "free_months",discount_value: 3,  totalDiscountUsd: 615 },
      { code: "STARTUP30",  redemptions: 18,   discount_type: "percentage", discount_value: 30, totalDiscountUsd: 90  },
    ],
    byDay: Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const seed = 70 + Math.round(50 * Math.sin(i / 3) + 20 * Math.cos(i / 5));
      return { date: d.toISOString().slice(0, 10), redemptions: Math.max(20, seed) };
    }),
  });
}
