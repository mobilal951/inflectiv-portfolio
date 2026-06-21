import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({
    user: {
      id,
      email: `demo.user.${id.slice(0, 6)}@example.com`,
      name: "Demo User",
      created_at: "2026-03-15T10:00:00Z",
      last_login_at: "2026-06-20T14:32:00Z",
      plan: "pro",
      credits_remaining: 1842,
      datasets_count: 12,
      api_keys_count: 3,
      is_active: true,
      country: "United States",
      subscriptions: [
        { plan: "pro", started_at: "2026-03-15T10:00:00Z", renews_at: "2026-07-15T10:00:00Z", status: "active" },
      ],
      recentActivity: [
        { event: "dataset_created", at: "2026-06-20T14:30:00Z" },
        { event: "chatbot_created", at: "2026-06-19T11:14:00Z" },
        { event: "credits_topped_up", at: "2026-06-17T09:02:00Z" },
      ],
    },
  });
}
