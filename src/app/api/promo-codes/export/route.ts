import { NextResponse } from "next/server";

export async function GET() {
  const rows = [
    "code,discount_type,discount_value,used_count,max_uses,is_active,expires_at",
    "LAUNCH50,percentage,50,312,500,true,2026-12-31",
    "WELCOME25,percentage,25,1842,,true,",
    "CREDIT500,credits,0,142,200,true,2026-09-30",
    "PROFREE3M,free_months,3,64,100,true,2026-08-15",
    "SUMMER10,flat_usd,10,587,1000,true,2026-09-01",
    "STARTUP30,percentage,30,18,50,true,2026-12-31",
    "BIGDATA15,percentage,15,91,250,true,",
    "RETIRED,percentage,20,100,100,false,2026-04-30",
  ];
  return new NextResponse(rows.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=promo-codes-demo.csv",
    },
  });
}
