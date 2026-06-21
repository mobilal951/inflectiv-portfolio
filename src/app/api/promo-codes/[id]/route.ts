import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({
    promoCode: {
      id,
      code: `DEMO_${id}`,
      discount_type: "percentage",
      discount_value: 25,
      credits: 0,
      max_uses: 500,
      used_count: 142,
      expires_at: "2026-12-31T00:00:00Z",
      is_active: true,
      created_at: "2026-03-04T10:00:00Z",
      scope: "subscription",
      target_plan_id: null,
      min_purchase_cents: null,
      max_discount_cents: 2500,
      description: "Synthetic promo code",
      created_by: "demo",
    },
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  return NextResponse.json({ promoCode: { id, ...body, updated_at: new Date().toISOString() } });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ success: true, id });
}
