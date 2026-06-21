import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const codes: string[] = Array.isArray(body.codes) ? body.codes : [];
  return NextResponse.json({
    created: codes.length,
    skipped: 0,
    sample: codes.slice(0, 5).map((c, i) => ({
      id: String(Date.now() + i),
      code: String(c).toUpperCase(),
      discount_type: body.discount_type || "percentage",
      discount_value: Number(body.discount_value || 10),
      is_active: true,
    })),
  });
}
