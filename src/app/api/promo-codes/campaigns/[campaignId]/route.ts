import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  return NextResponse.json({
    campaign: {
      id: campaignId,
      name: "Synthetic Campaign",
      status: "active",
      total_codes: 3,
      total_redemptions: 412,
      total_discount_usd: 2058,
      created_at: "2026-03-04T10:00:00Z",
      codes: [
        { id: "1", code: "WELCOME25", used_count: 1842, max_uses: null,  is_active: true },
        { id: "2", code: "LAUNCH50",  used_count: 312,  max_uses: 500,   is_active: true },
        { id: "3", code: "CREDIT500", used_count: 142,  max_uses: 200,   is_active: true },
      ],
    },
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  const body = await request.json();
  return NextResponse.json({ campaign: { id: campaignId, ...body, updated_at: new Date().toISOString() } });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  return NextResponse.json({ success: true, id: campaignId });
}
