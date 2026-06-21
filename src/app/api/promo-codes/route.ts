import { NextRequest, NextResponse } from "next/server";

// Portfolio demo — synthetic promo codes. Original route was Postgres-backed
// with rate limiting + admin password auth.

interface PromoCode {
  id: string;
  code: string;
  credits: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  discount_type: string;
  discount_value: number;
  scope: string | null;
  target_plan_id: string | null;
  min_purchase_cents: number | null;
  max_discount_cents: number | null;
  description: string | null;
  created_by: string | null;
}

const MOCK_CODES: PromoCode[] = [
  { id: "1",  code: "LAUNCH50",      credits: 0,    max_uses: 500,  used_count: 312, expires_at: "2026-12-31T00:00:00Z", is_active: true,  created_at: "2026-01-12T10:00:00Z", discount_type: "percentage", discount_value: 50,   scope: "subscription", target_plan_id: null,    min_purchase_cents: null, max_discount_cents: 5000, description: "Launch month — 50% off first sub",     created_by: "demo" },
  { id: "2",  code: "WELCOME25",     credits: 0,    max_uses: null, used_count: 1842, expires_at: null,                  is_active: true,  created_at: "2026-02-03T10:00:00Z", discount_type: "percentage", discount_value: 25,   scope: "subscription", target_plan_id: null,    min_purchase_cents: null, max_discount_cents: 2500, description: "Standard new-user welcome",            created_by: "demo" },
  { id: "3",  code: "CREDIT500",     credits: 500,  max_uses: 200,  used_count: 142, expires_at: "2026-09-30T00:00:00Z", is_active: true,  created_at: "2026-02-22T10:00:00Z", discount_type: "credits",    discount_value: 0,    scope: "topup",        target_plan_id: null,    min_purchase_cents: null, max_discount_cents: null, description: "500 free credits on signup",           created_by: "demo" },
  { id: "4",  code: "PROFREE3M",     credits: 0,    max_uses: 100,  used_count: 64,  expires_at: "2026-08-15T00:00:00Z", is_active: true,  created_at: "2026-03-04T10:00:00Z", discount_type: "free_months",discount_value: 3,    scope: "subscription", target_plan_id: "pro",   min_purchase_cents: null, max_discount_cents: null, description: "3 free months of Pro",                 created_by: "demo" },
  { id: "5",  code: "SUMMER10",      credits: 0,    max_uses: 1000, used_count: 587, expires_at: "2026-09-01T00:00:00Z", is_active: true,  created_at: "2026-05-01T10:00:00Z", discount_type: "flat_usd",   discount_value: 10,   scope: "topup",        target_plan_id: null,    min_purchase_cents: 2500, max_discount_cents: 1000, description: "Summer promo — $10 off any top-up",    created_by: "demo" },
  { id: "6",  code: "STARTUP30",     credits: 0,    max_uses: 50,   used_count: 18,  expires_at: "2026-12-31T00:00:00Z", is_active: true,  created_at: "2026-04-18T10:00:00Z", discount_type: "percentage", discount_value: 30,   scope: "subscription", target_plan_id: null,    min_purchase_cents: null, max_discount_cents: 3000, description: "Startup partner discount",             created_by: "demo" },
  { id: "7",  code: "BIGDATA15",     credits: 0,    max_uses: 250,  used_count: 91,  expires_at: null,                  is_active: true,  created_at: "2026-03-19T10:00:00Z", discount_type: "percentage", discount_value: 15,   scope: "all",          target_plan_id: null,    min_purchase_cents: null, max_discount_cents: 1500, description: "Conference attendee code",             created_by: "demo" },
  { id: "8",  code: "RETIRED",       credits: 0,    max_uses: 100,  used_count: 100, expires_at: "2026-04-30T00:00:00Z", is_active: false, created_at: "2026-01-05T10:00:00Z", discount_type: "percentage", discount_value: 20,   scope: "subscription", target_plan_id: null,    min_purchase_cents: null, max_discount_cents: 2000, description: "Expired beta program",                 created_by: "demo" },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("search") || "").toLowerCase();
  const status = searchParams.get("status");
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "50")), 100);
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"));

  let filtered = MOCK_CODES;
  if (search) {
    filtered = filtered.filter((p) => p.code.toLowerCase().includes(search) || (p.description || "").toLowerCase().includes(search));
  }
  if (status === "active") {
    filtered = filtered.filter((p) => p.is_active && (!p.expires_at || new Date(p.expires_at) > new Date()));
  } else if (status === "inactive") {
    filtered = filtered.filter((p) => !p.is_active);
  } else if (status === "expired") {
    filtered = filtered.filter((p) => p.expires_at && new Date(p.expires_at) <= new Date());
  }

  const paged = filtered.slice(offset, offset + limit);
  return NextResponse.json({ promoCodes: paged, total: filtered.length, limit, offset });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const created: PromoCode = {
    id: String(Date.now()),
    code: String(body.code || "DEMO").toUpperCase(),
    discount_type: body.discount_type || "percentage",
    discount_value: Number(body.discount_value || 10),
    credits: Number(body.credits || 0),
    max_uses: body.max_uses ?? null,
    used_count: 0,
    expires_at: body.expires_at || null,
    is_active: true,
    created_at: new Date().toISOString(),
    scope: body.scope || "subscription",
    target_plan_id: body.target_plan_id || null,
    min_purchase_cents: body.min_purchase_cents ?? null,
    max_discount_cents: body.max_discount_cents ?? null,
    description: body.description || null,
    created_by: "demo",
  };
  return NextResponse.json({ promoCode: created }, { status: 201 });
}
